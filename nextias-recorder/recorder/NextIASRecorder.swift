// NextIAS Recorder — records the sound of one app (for example the NEXT IAS app)
// to lossless 16 kHz WAV files, so that the separate transcriber can turn them into
// timestamped and continuous transcripts.
//
// Capture uses Core Audio process taps (macOS 14.4+). No virtual audio driver is needed.
// Each recording taps only the chosen app's processes, so several recordings from
// different apps can run at the same time without mixing.
//
// Build (done by Install.command):
//   swiftc -O -parse-as-library -swift-version 5 NextIASRecorder.swift -o "NextIAS Recorder"

import SwiftUI
import AppKit
import AVFoundation
import CoreAudio
import AudioToolbox
import Darwin

let appVersion = "1.0.0"
let outputSampleRate = 16000.0
let samplesPerBlock = 1600               // 100 ms at 16 kHz
let partTargetSeconds = 300.0            // start looking for a quiet point after 5 minutes
let partMaxSeconds = 330.0               // cut anyway at 5.5 minutes
let quietBlockDB = -42.0                 // a 100 ms block quieter than this is a good cut point
let soundBlockDB = -55.0                 // louder than this counts as "sound is arriving"
let maxPaddedGapSeconds = 900.0          // fill short capture gaps with silence so times stay right

// MARK: - Paths and small helpers

enum Paths {
    static var documents: URL { FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0] }
    static var recordings: URL { documents.appendingPathComponent("NextIAS Recordings", isDirectory: true) }
    static var transcripts: URL { documents.appendingPathComponent("NextIAS Transcripts", isDirectory: true) }
    static var transcriberStatus: URL { recordings.appendingPathComponent(".transcriber-status.json") }
}

let isoFormatter: ISO8601DateFormatter = {
    let f = ISO8601DateFormatter()
    f.formatOptions = [.withInternetDateTime]
    return f
}()

func nowISO() -> String { isoFormatter.string(from: Date()) }

func formatClock(_ seconds: Double) -> String {
    let s = max(0, Int(seconds.rounded(.down)))
    return String(format: "%02d:%02d:%02d", s / 3600, (s / 60) % 60, s % 60)
}

func safeFileName(_ text: String) -> String {
    let banned = CharacterSet(charactersIn: "/\\:?%*|\"<>\n\r\t")
    let cleaned = text.components(separatedBy: banned).joined(separator: "-")
        .trimmingCharacters(in: .whitespacesAndNewlines)
    return String((cleaned.isEmpty ? "Lecture" : cleaned).prefix(80))
}

struct RecorderError: LocalizedError {
    let message: String
    init(_ message: String) { self.message = message }
    var errorDescription: String? { message }
}

func check(_ status: OSStatus, _ what: String) throws {
    if status != noErr { throw RecorderError("\(what) failed (Core Audio code \(status)).") }
}

// MARK: - Core Audio property access

let systemObject = AudioObjectID(kAudioObjectSystemObject)

func caAddress(_ selector: AudioObjectPropertySelector) -> AudioObjectPropertyAddress {
    AudioObjectPropertyAddress(mSelector: selector,
                               mScope: kAudioObjectPropertyScopeGlobal,
                               mElement: kAudioObjectPropertyElementMain)
}

func caRead<T>(_ object: AudioObjectID, _ selector: AudioObjectPropertySelector, _ initial: T) -> T? {
    var address = caAddress(selector)
    var size = UInt32(MemoryLayout<T>.size)
    var value = initial
    let status = withUnsafeMutablePointer(to: &value) {
        AudioObjectGetPropertyData(object, &address, 0, nil, &size, $0)
    }
    return status == noErr ? value : nil
}

func caReadString(_ object: AudioObjectID, _ selector: AudioObjectPropertySelector) -> String? {
    guard let value = caRead(object, selector, "" as CFString) else { return nil }
    let text = value as String
    return text.isEmpty ? nil : text
}

func caProcessObjects() -> [AudioObjectID] {
    var address = caAddress(kAudioHardwarePropertyProcessObjectList)
    var size: UInt32 = 0
    guard AudioObjectGetPropertyDataSize(systemObject, &address, 0, nil, &size) == noErr, size > 0 else { return [] }
    var list = [AudioObjectID](repeating: AudioObjectID(kAudioObjectUnknown),
                               count: Int(size) / MemoryLayout<AudioObjectID>.size)
    guard AudioObjectGetPropertyData(systemObject, &address, 0, nil, &size, &list) == noErr else { return [] }
    return list
}

func caProcessObject(for pid: pid_t) -> AudioObjectID? {
    var address = caAddress(kAudioHardwarePropertyTranslatePIDToProcessObject)
    var qualifier = pid
    var object = AudioObjectID(kAudioObjectUnknown)
    var size = UInt32(MemoryLayout<AudioObjectID>.size)
    let status = AudioObjectGetPropertyData(systemObject, &address,
                                            UInt32(MemoryLayout<pid_t>.size), &qualifier,
                                            &size, &object)
    return (status == noErr && object != AudioObjectID(kAudioObjectUnknown)) ? object : nil
}

func caDefaultOutputDeviceUID() -> String? {
    guard let device = caRead(systemObject, kAudioHardwarePropertyDefaultOutputDevice,
                              AudioDeviceID(kAudioObjectUnknown)),
          device != AudioDeviceID(kAudioObjectUnknown) else { return nil }
    return caReadString(device, kAudioDevicePropertyDeviceUID)
}

func executablePath(of pid: pid_t) -> String? {
    var buffer = [CChar](repeating: 0, count: 4096)
    let length = proc_pidpath(pid, &buffer, UInt32(buffer.count))
    return length > 0 ? String(cString: buffer) : nil
}

// MARK: - Sound sources (apps that can be recorded)

struct SoundSource: Identifiable, Hashable {
    let key: String              // "system", "app:<bundle path>", "bundle:<id>" or "pid:<n>"
    let name: String
    let processObjects: [AudioObjectID]
    let isPlaying: Bool
    let isNextIAS: Bool
    var id: String { key }

    static let systemKey = "system"

    var label: String {
        if key == SoundSource.systemKey { return "Everything playing on this Mac (all apps mixed)" }
        return name + (isPlaying ? "   ● playing now" : "")
    }

    static func looksLikeNextIAS(_ text: String) -> Bool {
        let letters = text.lowercased().filter { $0.isLetter || $0.isNumber }
        return letters.contains("nextias")
    }

    /// Lists processes known to Core Audio, grouped by the app they belong to.
    /// Helper processes inside an app bundle (Electron, iPad-app wrappers) join their app.
    static func scan() -> [SoundSource] {
        struct Group { var name: String; var objects: [AudioObjectID] = []; var playing = false; var hint = "" }
        var groups: [String: Group] = [:]
        let ownPID = getpid()

        for object in caProcessObjects() {
            guard let pid = caRead(object, kAudioProcessPropertyPID, pid_t(-1)), pid > 0, pid != ownPID else { continue }
            let bundleID = caReadString(object, kAudioProcessPropertyBundleID) ?? ""
            let playing = (caRead(object, kAudioProcessPropertyIsRunningOutput, UInt32(0)) ?? 0) != 0
            let path = executablePath(of: pid) ?? ""

            var key: String
            var name: String
            if let range = path.range(of: ".app/") {
                let appPath = String(path[..<range.lowerBound]) + ".app"
                key = "app:" + appPath
                name = FileManager.default.displayName(atPath: appPath)
                if name.hasSuffix(".app") { name = String(name.dropLast(4)) }
            } else if !bundleID.isEmpty {
                key = "bundle:" + bundleID
                name = bundleID.hasPrefix("com.apple.WebKit") ? "Web pages shown by Safari or other WebKit apps" : bundleID
            } else {
                key = "pid:\(pid)"
                name = path.isEmpty ? "Process \(pid)" : (path as NSString).lastPathComponent
            }
            var group = groups[key] ?? Group(name: name)
            group.objects.append(object)
            group.playing = group.playing || playing
            group.hint += " " + bundleID + " " + path
            groups[key] = group
        }

        var result: [SoundSource] = groups.compactMap { entry in
            let key = entry.key
            let group = entry.value
            let nextIAS = looksLikeNextIAS(group.name + group.hint)
            // Hide background system daemons that are not playing anything.
            if !group.playing && !nextIAS && !key.hasPrefix("app:") { return nil }
            return SoundSource(key: key, name: group.name, processObjects: group.objects,
                               isPlaying: group.playing, isNextIAS: nextIAS)
        }
        result.sort { a, b in
            if a.isNextIAS != b.isNextIAS { return a.isNextIAS }
            if a.isPlaying != b.isPlaying { return a.isPlaying }
            return a.name.localizedCaseInsensitiveCompare(b.name) == .orderedAscending
        }
        result.append(SoundSource(key: systemKey, name: "Everything playing on this Mac",
                                  processObjects: [], isPlaying: false, isNextIAS: false))
        return result
    }
}

// MARK: - Process tap capture

/// One Core Audio tap plus the private aggregate device that delivers its audio.
final class TapCapture {
    let tapID: AudioObjectID
    let deviceID: AudioObjectID
    let procID: AudioDeviceIOProcID
    let format: AudioStreamBasicDescription
    let processObjects: [AudioObjectID]
    let outputUID: String
    private var stopped = false

    private init(tapID: AudioObjectID, deviceID: AudioObjectID, procID: AudioDeviceIOProcID,
                 format: AudioStreamBasicDescription, processObjects: [AudioObjectID], outputUID: String) {
        self.tapID = tapID; self.deviceID = deviceID; self.procID = procID
        self.format = format; self.processObjects = processObjects; self.outputUID = outputUID
    }

    /// processObjects == nil records every app except this recorder.
    /// The handler runs on `ioQueue`; it must copy what it needs and return quickly.
    static func start(processObjects: [AudioObjectID]?, mute: Bool, ioQueue: DispatchQueue,
                      handler: @escaping (UnsafePointer<AudioBufferList>, AudioStreamBasicDescription) -> Void) throws -> TapCapture {
        let description: CATapDescription
        if let objects = processObjects {
            description = CATapDescription(monoMixdownOfProcesses: objects)
        } else {
            let own = caProcessObject(for: getpid()).map { [$0] } ?? []
            description = CATapDescription(monoGlobalTapButExcludeProcesses: own)
        }
        description.uuid = UUID()
        description.name = "NextIAS Recorder tap"
        description.isPrivate = true
        description.muteBehavior = mute ? .mutedWhenTapped : .unmuted

        var tapID = AudioObjectID(kAudioObjectUnknown)
        try check(AudioHardwareCreateProcessTap(description, &tapID), "Creating the audio tap")
        var deviceID = AudioObjectID(kAudioObjectUnknown)
        var procID: AudioDeviceIOProcID?
        do {
            guard let outputUID = caDefaultOutputDeviceUID() else {
                throw RecorderError("No sound output device was found. Check the Mac's Sound settings.")
            }
            guard let format = caRead(tapID, kAudioTapPropertyFormat, AudioStreamBasicDescription()),
                  format.mSampleRate > 0 else {
                throw RecorderError("Could not read the audio format of the tap.")
            }
            let aggregate: [String: Any] = [
                kAudioAggregateDeviceNameKey: "NextIAS Recorder",
                kAudioAggregateDeviceUIDKey: UUID().uuidString,
                kAudioAggregateDeviceMainSubDeviceKey: outputUID,
                kAudioAggregateDeviceIsPrivateKey: true,
                kAudioAggregateDeviceIsStackedKey: false,
                kAudioAggregateDeviceTapAutoStartKey: true,
                kAudioAggregateDeviceSubDeviceListKey: [[kAudioSubDeviceUIDKey: outputUID]],
                kAudioAggregateDeviceTapListKey: [[kAudioSubTapDriftCompensationKey: true,
                                                   kAudioSubTapUIDKey: description.uuid.uuidString]],
            ]
            try check(AudioHardwareCreateAggregateDevice(aggregate as CFDictionary, &deviceID),
                      "Creating the private recording device")
            let block: AudioDeviceIOBlock = { _, input, _, _, _ in handler(input, format) }
            try check(AudioDeviceCreateIOProcIDWithBlock(&procID, deviceID, ioQueue, block),
                      "Connecting to the recording device")
            try check(AudioDeviceStart(deviceID, procID), "Starting the recording device")
            return TapCapture(tapID: tapID, deviceID: deviceID, procID: procID!, format: format,
                              processObjects: processObjects ?? [], outputUID: outputUID)
        } catch {
            if let procID { AudioDeviceDestroyIOProcID(deviceID, procID) }
            if deviceID != AudioObjectID(kAudioObjectUnknown) { AudioHardwareDestroyAggregateDevice(deviceID) }
            AudioHardwareDestroyProcessTap(tapID)
            throw error
        }
    }

    /// Must not be called on the I/O queue.
    func stop() {
        guard !stopped else { return }
        stopped = true
        AudioDeviceStop(deviceID, procID)
        AudioDeviceDestroyIOProcID(deviceID, procID)
        AudioHardwareDestroyAggregateDevice(deviceID)
        AudioHardwareDestroyProcessTap(tapID)
    }

    deinit { stop() }

    /// Copies one I/O buffer as mono Float samples (averaging channels if needed).
    static func monoSamples(_ list: UnsafePointer<AudioBufferList>, _ format: AudioStreamBasicDescription) -> [Float] {
        let buffers = UnsafeMutableAudioBufferListPointer(UnsafeMutablePointer(mutating: list))
        let isFloat = (format.mFormatFlags & kAudioFormatFlagIsFloat) != 0
        let bits = Int(format.mBitsPerChannel)
        guard (isFloat && bits == 32) || (!isFloat && (bits == 16 || bits == 32)) else { return [] }
        let bytesPerSample = bits / 8

        func sample(_ base: UnsafeRawPointer, _ index: Int) -> Float {
            if isFloat { return base.load(fromByteOffset: index * 4, as: Float.self) }
            if bits == 16 { return Float(base.load(fromByteOffset: index * 2, as: Int16.self)) / 32768 }
            return Float(base.load(fromByteOffset: index * 4, as: Int32.self)) / 2147483648
        }

        let valid = buffers.filter { $0.mData != nil && $0.mDataByteSize > 0 }
        guard let first = valid.first, let firstData = first.mData else { return [] }
        if valid.count == 1 {
            let channels = max(1, Int(first.mNumberChannels))
            let frames = Int(first.mDataByteSize) / (bytesPerSample * channels)
            let base = UnsafeRawPointer(firstData)
            var out = [Float](repeating: 0, count: frames)
            for f in 0..<frames {
                var total: Float = 0
                for c in 0..<channels { total += sample(base, f * channels + c) }
                out[f] = total / Float(channels)
            }
            return out
        }
        // Non-interleaved: one buffer per channel.
        let frames = valid.map { Int($0.mDataByteSize) / bytesPerSample }.min() ?? 0
        var out = [Float](repeating: 0, count: frames)
        for buffer in valid {
            guard let data = buffer.mData else { continue }
            let base = UnsafeRawPointer(data)
            for f in 0..<frames { out[f] += sample(base, f) }
        }
        let scale = 1 / Float(valid.count)
        for f in 0..<frames { out[f] *= scale }
        return out
    }
}

// MARK: - Sample-rate conversion to 16 kHz Int16

final class Resampler {
    let inputRate: Double
    private let inputFormat: AVAudioFormat
    private let outputFormat: AVAudioFormat
    private let converter: AVAudioConverter

    init?(inputRate: Double) {
        guard let input = AVAudioFormat(commonFormat: .pcmFormatFloat32, sampleRate: inputRate, channels: 1, interleaved: false),
              let output = AVAudioFormat(commonFormat: .pcmFormatInt16, sampleRate: outputSampleRate, channels: 1, interleaved: false),
              let converter = AVAudioConverter(from: input, to: output) else { return nil }
        converter.sampleRateConverterQuality = AVAudioQuality.max.rawValue
        self.inputRate = inputRate
        self.inputFormat = input
        self.outputFormat = output
        self.converter = converter
    }

    func process(_ samples: [Float]) -> [Int16] {
        guard !samples.isEmpty,
              let input = AVAudioPCMBuffer(pcmFormat: inputFormat, frameCapacity: AVAudioFrameCount(samples.count)),
              let channel = input.floatChannelData else { return [] }
        input.frameLength = AVAudioFrameCount(samples.count)
        samples.withUnsafeBufferPointer { channel[0].update(from: $0.baseAddress!, count: samples.count) }
        let capacity = AVAudioFrameCount(Double(samples.count) * outputSampleRate / inputRate) + 64
        guard let output = AVAudioPCMBuffer(pcmFormat: outputFormat, frameCapacity: capacity) else { return [] }
        var supplied = false
        var error: NSError?
        let status = converter.convert(to: output, error: &error) { _, inputStatus in
            if supplied { inputStatus.pointee = .noDataNow; return nil }
            supplied = true
            inputStatus.pointee = .haveData
            return input
        }
        guard status != .error, let data = output.int16ChannelData else { return [] }
        return Array(UnsafeBufferPointer(start: data[0], count: Int(output.frameLength)))
    }
}

// MARK: - Crash-tolerant WAV writer (header is refreshed every few seconds)

final class WavWriter {
    let url: URL
    private let handle: FileHandle
    private(set) var samples = 0
    private var lastPatch = 0

    init(url: URL) throws {
        self.url = url
        guard FileManager.default.createFile(atPath: url.path, contents: WavWriter.header(dataBytes: 0)) else {
            throw RecorderError("Could not create \(url.lastPathComponent). Is the disk full?")
        }
        handle = try FileHandle(forWritingTo: url)
        try handle.seekToEnd()
    }

    func append(_ block: [Int16]) throws {
        guard !block.isEmpty else { return }
        let data = block.withUnsafeBufferPointer { Data(buffer: $0) }
        try handle.write(contentsOf: data)
        samples += block.count
        if samples - lastPatch >= Int(outputSampleRate) * 5 { try patchHeader() }
    }

    func patchHeader() throws {
        try handle.seek(toOffset: 0)
        try handle.write(contentsOf: WavWriter.header(dataBytes: samples * 2))
        try handle.seekToEnd()
        lastPatch = samples
    }

    func close() {
        try? patchHeader()
        try? handle.synchronize()
        try? handle.close()
    }

    static func header(dataBytes: Int) -> Data {
        var d = Data()
        func text(_ s: String) { d.append(contentsOf: Array(s.utf8)) }
        func u32(_ v: UInt32) { var x = v.littleEndian; withUnsafeBytes(of: &x) { d.append(contentsOf: $0) } }
        func u16(_ v: UInt16) { var x = v.littleEndian; withUnsafeBytes(of: &x) { d.append(contentsOf: $0) } }
        text("RIFF"); u32(UInt32(36 + dataBytes)); text("WAVE")
        text("fmt "); u32(16); u16(1); u16(1); u32(UInt32(outputSampleRate)); u32(UInt32(outputSampleRate) * 2); u16(2); u16(16)
        text("data"); u32(UInt32(dataBytes))
        return d
    }

    /// Fixes the header of a part left behind by a crash. Returns its duration in seconds.
    static func repair(_ url: URL) -> Double {
        guard let size = (try? FileManager.default.attributesOfItem(atPath: url.path))?[.size] as? NSNumber,
              let handle = try? FileHandle(forWritingTo: url) else { return 0 }
        let dataBytes = max(0, (size.intValue - 44) / 2 * 2)
        try? handle.seek(toOffset: 0)
        try? handle.write(contentsOf: header(dataBytes: dataBytes))
        try? handle.close()
        return Double(dataBytes / 2) / outputSampleRate
    }
}

// MARK: - Recording metadata (recording.json, read by the transcriber)

struct SessionMeta: Codable {
    var index: Int
    var startedAt: String
    var endedAt: String?
    var audioStart: Double
    var endReason: String?
    var sourceName: String
}

struct PartMeta: Codable {
    var file: String
    var session: Int
    var start: Double
    var duration: Double
    var complete: Bool
}

struct RecordingMeta: Codable {
    var format: Int
    var id: String
    var title: String
    var subject: String
    var sourceName: String
    var createdAt: String
    var updatedAt: String
    var status: String          // recording | finished | interrupted
    var sampleRate: Int
    var recorderVersion: String
    var sessions: [SessionMeta]
    var parts: [PartMeta]
    var notes: [String]
}

// MARK: - One lecture recording (may have several sessions when continued later)

final class Recording: ObservableObject, Identifiable {
    let id: String
    let folder: URL

    // Published copies for the window (updated on the main thread).
    @Published private(set) var meta: RecordingMeta
    @Published private(set) var isActive = false
    @Published private(set) var seconds: Double = 0
    @Published private(set) var levelDB: Double = -120
    @Published private(set) var problem: String?
    @Published private(set) var transcriptLine = ""
    @Published private(set) var transcriptURL: URL?

    private let queue = DispatchQueue(label: "nextias.recording.processing", qos: .userInitiated)
    private let ioQueue = DispatchQueue(label: "nextias.recording.io", qos: .userInteractive)

    // State below is only touched on `queue`.
    private var m: RecordingMeta
    private var capture: TapCapture?
    private var resampler: Resampler?
    private var writer: WavWriter?
    private var pending: [Int16] = []
    private var partSamples = 0
    private var timelineSamples = 0          // all audio written, including earlier sessions
    private var sessionStartSamples = 0
    private var sessionStartDate = Date()
    private var lastSoundSample = 0
    private var heardAnything = false
    private var lastCallback = Date()
    private var sourceKey = ""
    private var mute = false
    private var lastMetaSave = Date.distantPast
    private var lastPublish = Date.distantPast
    private var recentPeakDB = -120.0
    private var sourcePlaying = false
    private var lastRebuild = Date.distantPast

    private init(folder: URL, meta: RecordingMeta) {
        self.id = meta.id
        self.folder = folder
        self.meta = meta
        self.m = meta
        self.seconds = meta.parts.reduce(0) { $0 + $1.duration }
    }

    var metaURL: URL { folder.appendingPathComponent("recording.json") }

    static func create(title: String, subject: String) throws -> Recording {
        let stamp = DateFormatter()
        stamp.dateFormat = "yyyy-MM-dd HHmm"
        let folder = Paths.recordings.appendingPathComponent("\(stamp.string(from: Date())) — \(safeFileName(title))", isDirectory: true)
        try FileManager.default.createDirectory(at: folder.appendingPathComponent("audio"), withIntermediateDirectories: true)
        let meta = RecordingMeta(format: 1, id: UUID().uuidString, title: title, subject: subject, sourceName: "",
                                 createdAt: nowISO(), updatedAt: nowISO(), status: "finished",
                                 sampleRate: Int(outputSampleRate), recorderVersion: appVersion,
                                 sessions: [], parts: [], notes: [])
        let recording = Recording(folder: folder, meta: meta)
        try recording.saveMeta()
        return recording
    }

    /// Loads recent recordings. Anything still marked "recording" was cut off by a crash or
    /// power loss: repair its last audio part and mark it interrupted.
    static func loadRecent(limit: Int = 40) -> [Recording] {
        let fm = FileManager.default
        guard let folders = try? fm.contentsOfDirectory(at: Paths.recordings, includingPropertiesForKeys: nil) else { return [] }
        var result: [Recording] = []
        for folder in folders where folder.hasDirectoryPath || (try? folder.resourceValues(forKeys: [.isDirectoryKey]).isDirectory) == true {
            let url = folder.appendingPathComponent("recording.json")
            guard let data = try? Data(contentsOf: url),
                  var meta = try? JSONDecoder().decode(RecordingMeta.self, from: data) else { continue }
            if meta.status == "recording" {
                for i in meta.parts.indices where !meta.parts[i].complete {
                    meta.parts[i].duration = WavWriter.repair(folder.appendingPathComponent(meta.parts[i].file))
                    meta.parts[i].complete = true
                }
                if let last = meta.sessions.indices.last, meta.sessions[last].endedAt == nil {
                    meta.sessions[last].endedAt = meta.updatedAt
                    meta.sessions[last].endReason = "The recorder stopped unexpectedly (crash, power loss or forced quit)."
                }
                meta.status = "interrupted"
                meta.notes.append("Recording was cut off unexpectedly near \(formatClock(meta.parts.reduce(0) { $0 + $1.duration })). Audio up to that point was kept.")
                meta.updatedAt = nowISO()
                if let encoded = try? Recording.encode(meta) { try? encoded.write(to: url, options: .atomic) }
            }
            result.append(Recording(folder: folder, meta: meta))
        }
        result.sort { $0.meta.createdAt > $1.meta.createdAt }
        return Array(result.prefix(limit))
    }

    static func encode(_ meta: RecordingMeta) throws -> Data {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys, .withoutEscapingSlashes]
        return try encoder.encode(meta)
    }

    private func saveMeta() throws {
        m.updatedAt = nowISO()
        try Recording.encode(m).write(to: metaURL, options: .atomic)
        lastMetaSave = Date()
        let snapshot = m
        DispatchQueue.main.async { self.meta = snapshot }
    }

    // MARK: Start / stop

    func start(source: SoundSource, mute: Bool) throws {
        try queue.sync {
            guard capture == nil else { return }
            self.sourceKey = source.key
            self.mute = mute
            timelineSamples = Int((m.parts.reduce(0) { $0 + $1.duration } * outputSampleRate).rounded())
            sessionStartSamples = timelineSamples
            sessionStartDate = Date()
            lastCallback = Date()
            lastSoundSample = timelineSamples
            heardAnything = false
            pending = []
            let index = (m.sessions.last?.index ?? 0) + 1
            m.sessions.append(SessionMeta(index: index, startedAt: nowISO(), endedAt: nil,
                                          audioStart: Double(timelineSamples) / outputSampleRate,
                                          endReason: nil, sourceName: source.name))
            m.sourceName = source.name
            m.status = "recording"
            do {
                try openPart()
                capture = try makeCapture(source)
                try saveMeta()
            } catch {
                capture?.stop(); capture = nil
                closePart()
                m.sessions.removeLast()
                m.status = m.parts.isEmpty ? "finished" : "interrupted"
                try? saveMeta()
                throw error
            }
            DispatchQueue.main.async { self.isActive = true; self.problem = nil }
        }
    }

    func stop(reason: String) {
        queue.sync {
            guard let current = capture else { return }
            capture = nil
            current.stop()
            flushPending(final: true)
            closePart()
            if let last = m.sessions.indices.last {
                m.sessions[last].endedAt = nowISO()
                m.sessions[last].endReason = reason
            }
            m.status = "finished"
            try? saveMeta()
            DispatchQueue.main.async { self.isActive = false; self.levelDB = -120 }
        }
    }

    private func makeCapture(_ source: SoundSource) throws -> TapCapture {
        let objects: [AudioObjectID]? = source.key == SoundSource.systemKey ? nil : source.processObjects
        if let objects, objects.isEmpty { throw RecorderError("\(source.name) is not running.") }
        let capture = try TapCapture.start(processObjects: objects, mute: mute, ioQueue: ioQueue) { [weak self] list, format in
            let samples = TapCapture.monoSamples(list, format)
            let rate = format.mSampleRate
            self?.queue.async { self?.ingest(samples, rate: rate) }
        }
        if resampler?.inputRate != capture.format.mSampleRate {
            resampler = Resampler(inputRate: capture.format.mSampleRate)
            if resampler == nil { capture.stop(); throw RecorderError("Could not set up audio conversion.") }
        }
        return capture
    }

    // MARK: Parts

    private func openPart() throws {
        let number = m.parts.count + 1
        let file = String(format: "audio/part-%04d.wav", number)
        writer = try WavWriter(url: folder.appendingPathComponent(file))
        partSamples = 0
        m.parts.append(PartMeta(file: file, session: m.sessions.last?.index ?? 1,
                                start: Double(timelineSamples) / outputSampleRate, duration: 0, complete: false))
    }

    private func closePart() {
        guard let writer else { return }
        writer.close()
        self.writer = nil
        guard let last = m.parts.indices.last else { return }
        if writer.samples == 0 {
            try? FileManager.default.removeItem(at: writer.url)
            m.parts.removeLast()
        } else {
            m.parts[last].duration = Double(writer.samples) / outputSampleRate
            m.parts[last].complete = true
        }
    }

    // MARK: Audio processing (on `queue`)

    private func ingest(_ samples: [Float], rate: Double) {
        guard capture != nil, let resampler, !samples.isEmpty else { return }
        lastCallback = Date()
        if rate != resampler.inputRate { return }   // stale buffer from a replaced tap

        // Keep the timeline equal to time since Start: fill short gaps (sleep, app restart) with silence.
        let expected = sessionStartSamples + Int(Date().timeIntervalSince(sessionStartDate) * outputSampleRate)
        let have = timelineSamples + pending.count
        let deficit = expected - have - Int(outputSampleRate)   // allow 1 s of slack
        if deficit > Int(outputSampleRate) * 2 {
            let gapSeconds = Double(deficit) / outputSampleRate
            if gapSeconds <= maxPaddedGapSeconds {
                pending.append(contentsOf: [Int16](repeating: 0, count: deficit))
                m.notes.append("No audio arrived for \(Int(gapSeconds)) s near \(formatClock(Double(have) / outputSampleRate)); that stretch is silent in the recording.")
            } else {
                m.notes.append("Recording paused for \(formatClock(gapSeconds)) near \(formatClock(Double(have) / outputSampleRate)) (Mac asleep?). Times after this point are shifted by that amount.")
                sessionStartSamples = have
                sessionStartDate = Date()
            }
        }

        pending.append(contentsOf: resampler.process(samples))
        flushPending(final: false)
        publishIfDue()
    }

    private func flushPending(final: Bool) {
        var offset = 0
        while pending.count - offset >= samplesPerBlock || (final && offset < pending.count) {
            let end = min(offset + samplesPerBlock, pending.count)
            let block = Array(pending[offset..<end])
            offset = end
            writeBlock(block)
            if writer == nil { break }
        }
        pending.removeFirst(min(offset, pending.count))
    }

    private func writeBlock(_ block: [Int16]) {
        guard let writer else { return }
        do {
            try writer.append(block)
        } catch {
            fail("Could not write audio to disk: \(error.localizedDescription)")
            return
        }
        partSamples += block.count
        timelineSamples += block.count

        var sum: Double = 0
        var peak: Int16 = 0
        for s in block {
            let v = Double(s)
            sum += v * v
            peak = max(peak, s == Int16.min ? Int16.max : abs(s))
        }
        let rms = (sum / Double(block.count)).squareRoot() / 32768
        let db = rms > 0 ? 20 * log10(rms) : -120
        recentPeakDB = max(recentPeakDB, db)
        if peak > 0 { heardAnything = true }
        if db > soundBlockDB { lastSoundSample = timelineSamples }

        let partSeconds = Double(partSamples) / outputSampleRate
        if partSeconds >= partMaxSeconds || (partSeconds >= partTargetSeconds && db < quietBlockDB) {
            closePart()
            do { try openPart(); try saveMeta() } catch { fail("Could not start a new audio file: \(error.localizedDescription)") }
        } else if Date().timeIntervalSince(lastMetaSave) > 30 {
            if let last = m.parts.indices.last { m.parts[last].duration = partSeconds }
            try? saveMeta()
        }
    }

    private func publishIfDue() {
        guard Date().timeIntervalSince(lastPublish) > 0.25 else { return }
        lastPublish = Date()
        let seconds = Double(timelineSamples) / outputSampleRate
        let level = recentPeakDB
        recentPeakDB = -120
        let quietFor = Double(timelineSamples - lastSoundSample) / outputSampleRate
        let problem = currentProblem(quietFor: quietFor)
        DispatchQueue.main.async {
            self.seconds = seconds
            self.levelDB = level
            self.problem = problem
        }
    }

    private func currentProblem(quietFor: Double) -> String? {
        let sessionSeconds = Double(timelineSamples - sessionStartSamples) / outputSampleRate
        if sessionSeconds > 12 && !heardAnything && sourcePlaying {
            return "The app is playing sound, but macOS is giving the recorder pure silence. Most likely the permission is off: System Settings → Privacy & Security → Screen & System Audio Recording → turn on NextIAS Recorder under “System Audio Recording Only”, then Stop and Start again. If it is already on, the app may be protecting its sound: try the source “Everything playing on this Mac”."
        }
        if sessionSeconds > 12 && !heardAnything {
            return "No sound is arriving yet. Press Play in the lecture and check that its volume is not muted inside the app."
        }
        if quietFor > 45 {
            return "Silent for \(Int(quietFor)) seconds. Is the lecture paused? (Recording continues; silence is skipped when transcribing.)"
        }
        return nil
    }

    private func fail(_ message: String) {
        capture?.stop()
        capture = nil
        closePart()
        if let last = m.sessions.indices.last {
            m.sessions[last].endedAt = nowISO()
            m.sessions[last].endReason = message
        }
        m.status = "interrupted"
        m.notes.append(message)
        try? saveMeta()
        DispatchQueue.main.async { self.isActive = false; self.problem = message }
    }

    // MARK: Health check (every few seconds from the main thread)

    func healthCheck(sources: [SoundSource]) {
        queue.async { [self] in
            guard let current = capture else { return }
            if sourceKey != SoundSource.systemKey {
                sourcePlaying = sources.first { $0.key == sourceKey }?.isPlaying ?? false
            } else {
                sourcePlaying = false
            }
            if let free = try? folder.resourceValues(forKeys: [.volumeAvailableCapacityForImportantUsageKey]).volumeAvailableCapacityForImportantUsage,
               free < 600_000_000 {
                fail("Stopped because the disk is almost full. Audio recorded so far is saved.")
                return
            }
            // Rebuild the tap if the app restarted, gained a new sound process, the output
            // device changed (headphones), or audio stopped arriving.
            let latest = sources.first { $0.key == sourceKey }
            var reason: String?
            if let latest, sourceKey != SoundSource.systemKey,
               !latest.processObjects.isEmpty, Set(latest.processObjects) != Set(current.processObjects) {
                reason = "the app's sound processes changed"
            } else if let uid = caDefaultOutputDeviceUID(), uid != current.outputUID {
                reason = "the sound output device changed"
            } else if Date().timeIntervalSince(lastCallback) > 5 {
                reason = "audio stopped arriving"
            }
            guard let reason else { return }
            if Date().timeIntervalSince(lastRebuild) < 20 { return }
            if sourceKey != SoundSource.systemKey && (latest?.processObjects.isEmpty ?? true) { return }   // app not running: wait
            let source = latest ?? SoundSource(key: SoundSource.systemKey, name: m.sourceName, processObjects: [], isPlaying: false, isNextIAS: false)
            lastRebuild = Date()
            do {
                let replacement = try makeCapture(source)
                capture = replacement
                current.stop()
                lastCallback = Date()
                m.notes.append("Reconnected to \(source.name) near \(formatClock(Double(timelineSamples) / outputSampleRate)) because \(reason).")
                try? saveMeta()
            } catch {
                lastCallback = Date()   // try again on the next check
            }
        }
    }

    // MARK: Transcript progress (written by the transcriber)

    func refreshTranscriptState() {
        let stateURL = folder.appendingPathComponent("transcript/state.json")
        guard let data = try? Data(contentsOf: stateURL),
              let object = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            if transcriptLine != "Transcript: waiting for the transcriber" { transcriptLine = "Transcript: waiting for the transcriber" }
            return
        }
        let done = object["doneParts"] as? Int ?? 0
        let total = object["totalParts"] as? Int ?? 0
        let final = object["final"] as? Bool ?? false
        let line = final ? "Transcript ready" : "Transcript: \(done) of \(total) audio parts done"
        if line != transcriptLine { transcriptLine = line }
        if let path = object["timestampsFile"] as? String {
            let url = URL(fileURLWithPath: path)
            if url != transcriptURL { transcriptURL = url }
        }
    }

    var statusLine: String {
        let source = meta.sourceName.isEmpty ? "" : "From \(meta.sourceName). "
        switch meta.status {
        case "recording": return source + "Recording…"
        case "interrupted": return source + "Interrupted — audio so far is saved. You can continue recording into the same transcript."
        default: return source + (meta.parts.isEmpty ? "No audio yet." : "Saved. \(meta.parts.count) audio part(s).")
        }
    }
}

// MARK: - App model

final class AppModel: ObservableObject {
    static let shared = AppModel()

    @Published var sources: [SoundSource] = []
    @Published var selectedKey = ""
    @Published var title = ""
    @Published var subject = ""
    @Published var mute = false
    @Published var recordings: [Recording] = []
    @Published var transcriberLine = ""
    @Published var alert: String?

    private var timer: Timer?
    private var ticks = 0
    private var activity: NSObjectProtocol?
    private var userPicked = false

    private init() {
        try? FileManager.default.createDirectory(at: Paths.recordings, withIntermediateDirectories: true)
        recordings = Recording.loadRecent()
        recordings.forEach { $0.refreshTranscriptState() }
        refreshSources()
        readTranscriberStatus()
        timer = Timer.scheduledTimer(withTimeInterval: 2, repeats: true) { [weak self] _ in self?.tick() }
    }

    var activeCount: Int { recordings.filter { $0.isActive }.count }

    func userSelected(_ key: String) { userPicked = true; selectedKey = key }

    private func tick() {
        ticks += 1
        refreshSources()
        if ticks % 2 == 0 { recordings.filter { $0.isActive }.forEach { $0.healthCheck(sources: sources) } }
        if ticks % 3 == 0 { recordings.forEach { $0.refreshTranscriptState() }; readTranscriberStatus() }
        updateSleepAssertion()
    }

    func refreshSources() {
        let latest = SoundSource.scan()
        if latest.map(\.label) != sources.map(\.label) || latest.map(\.processObjects) != sources.map(\.processObjects) {
            sources = latest
        }
        let stillThere = latest.contains { $0.key == selectedKey }
        if !stillThere || (!userPicked && selectedKey == SoundSource.systemKey) {
            let preferred = latest.first { $0.isNextIAS }?.key
                ?? latest.first { $0.isPlaying && $0.key != SoundSource.systemKey }?.key
                ?? SoundSource.systemKey
            if preferred != selectedKey { selectedKey = preferred }
        }
    }

    func startNew() {
        guard let source = sources.first(where: { $0.key == selectedKey }) else { alert = "Choose what to record first."; return }
        if let busy = recordings.first(where: { $0.isActive && $0.meta.sourceName == source.name }) {
            alert = "“\(busy.meta.title)” is already recording \(source.name). One app can only be recorded once at a time — its windows share one sound output."
            return
        }
        let name = title.trimmingCharacters(in: .whitespacesAndNewlines)
        let finalTitle = name.isEmpty ? "Lecture \(DateFormatter.localizedString(from: Date(), dateStyle: .medium, timeStyle: .short))" : name
        do {
            let recording = try Recording.create(title: finalTitle, subject: subject.trimmingCharacters(in: .whitespacesAndNewlines))
            try recording.start(source: source, mute: mute)
            recordings.insert(recording, at: 0)
            title = ""
        } catch {
            alert = "Could not start recording: \(error.localizedDescription)"
        }
    }

    func continueRecording(_ recording: Recording) {
        guard let source = sources.first(where: { $0.key == selectedKey }) else { alert = "Choose what to record first."; return }
        if recordings.contains(where: { $0.isActive && $0.meta.sourceName == source.name }) {
            alert = "\(source.name) is already being recorded. Stop that recording first."
            return
        }
        do { try recording.start(source: source, mute: mute) }
        catch { alert = "Could not continue: \(error.localizedDescription)" }
    }

    func stop(_ recording: Recording) { recording.stop(reason: "Stopped by you.") }

    func stopAll(reason: String) { recordings.filter { $0.isActive }.forEach { $0.stop(reason: reason) } }

    private func updateSleepAssertion() {
        if activeCount > 0 && activity == nil {
            activity = ProcessInfo.processInfo.beginActivity(
                options: [.idleSystemSleepDisabled, .suddenTerminationDisabled, .automaticTerminationDisabled, .userInitiated],
                reason: "Recording lectures")
        } else if activeCount == 0, let token = activity {
            ProcessInfo.processInfo.endActivity(token)
            activity = nil
        }
    }

    private func readTranscriberStatus() {
        var line = "Transcriber is not running. It starts automatically after installation; to run it now, double-click “Transcribe Now.command”."
        if let data = try? Data(contentsOf: Paths.transcriberStatus),
           let object = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let updated = object["updatedAt"] as? Double,
           Date().timeIntervalSince1970 - updated < 180 {
            line = "Transcriber: " + (object["message"] as? String ?? "running")
        }
        if line != transcriberLine { transcriberLine = line }
    }
}

// MARK: - Window

struct LevelBar: View {
    let db: Double
    var body: some View {
        GeometryReader { geo in
            let fraction = CGFloat(min(1, max(0, (db + 60) / 60)))
            ZStack(alignment: .leading) {
                RoundedRectangle(cornerRadius: 3).fill(Color.gray.opacity(0.2))
                RoundedRectangle(cornerRadius: 3).fill(db > -6 ? Color.orange : Color.green)
                    .frame(width: geo.size.width * fraction)
            }
        }
        .frame(height: 6)
    }
}

struct RecordingRow: View {
    @ObservedObject var recording: Recording
    @ObservedObject var model = AppModel.shared

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Circle().fill(recording.isActive ? Color.red : Color.gray.opacity(0.5)).frame(width: 10, height: 10)
                Text(recording.meta.title).font(.headline).lineLimit(1)
                Spacer()
                Text(formatClock(recording.seconds)).font(.system(.body, design: .monospaced))
            }
            if recording.isActive { LevelBar(db: recording.levelDB) }
            Text(recording.statusLine).font(.callout).foregroundColor(.secondary)
            if let problem = recording.problem {
                Text(problem).font(.callout).foregroundColor(.orange).fixedSize(horizontal: false, vertical: true)
            }
            HStack {
                if recording.isActive {
                    Button("Stop & save") { model.stop(recording) }
                } else {
                    Button("Continue recording into this transcript") { model.continueRecording(recording) }
                        .help("Records the source chosen above and adds it to the end of this lecture's audio and transcript.")
                }
                Button("Show files") { NSWorkspace.shared.activateFileViewerSelecting([recording.folder]) }
                if let url = recording.transcriptURL {
                    Button("Open transcript") { NSWorkspace.shared.open(url) }
                }
                Spacer()
                Text(recording.transcriptLine).font(.caption).foregroundColor(.secondary)
            }
        }
        .padding(10)
        .background(RoundedRectangle(cornerRadius: 8).fill(Color(nsColor: .controlBackgroundColor)))
    }
}

struct ContentView: View {
    @ObservedObject var model = AppModel.shared

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            GroupBox(label: Text("New recording").font(.headline)) {
                VStack(alignment: .leading, spacing: 8) {
                    TextField("Lecture name, e.g. Polity Lecture 05 [20-10-2026]", text: $model.title)
                    TextField("Subject words (optional) — names and terms that help spelling, e.g. Polity, Preamble, Ambedkar", text: $model.subject)
                    Picker("Record sound from", selection: Binding(get: { model.selectedKey }, set: { model.userSelected($0) })) {
                        ForEach(model.sources) { source in Text(source.label).tag(source.key) }
                    }
                    Toggle("Silence it on my speakers while recording (useful when recording two lectures at once)", isOn: $model.mute)
                    HStack {
                        Button(action: { model.startNew() }) { Text("● Start recording") }
                            .keyboardShortcut(.defaultAction)
                        Text("Play the lecture at 1× and keep its volume up inside the app. Your Mac's own volume does not matter.")
                            .font(.caption).foregroundColor(.secondary)
                    }
                }
                .padding(6)
            }
            Text("Recordings").font(.headline)
            ScrollView {
                LazyVStack(spacing: 8) {
                    ForEach(model.recordings) { RecordingRow(recording: $0) }
                    if model.recordings.isEmpty {
                        Text("No recordings yet.").foregroundColor(.secondary).padding()
                    }
                }
            }
            Divider()
            HStack {
                Text(model.transcriberLine).font(.callout).foregroundColor(.secondary).lineLimit(2)
                Spacer()
                Button("Recordings folder") { NSWorkspace.shared.open(Paths.recordings) }
                Button("Transcripts folder") {
                    try? FileManager.default.createDirectory(at: Paths.transcripts, withIntermediateDirectories: true)
                    NSWorkspace.shared.open(Paths.transcripts)
                }
            }
        }
        .padding(16)
        .frame(minWidth: 680, minHeight: 560)
        .alert("NextIAS Recorder", isPresented: Binding(get: { model.alert != nil }, set: { if !$0 { model.alert = nil } })) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(model.alert ?? "")
        }
    }
}

final class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationShouldTerminate(_ sender: NSApplication) -> NSApplication.TerminateReply {
        AppModel.shared.stopAll(reason: "NextIAS Recorder was quit.")
        return .terminateNow
    }
}

@main
struct NextIASRecorderApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var delegate

    var body: some Scene {
        WindowGroup("NextIAS Recorder") {
            ContentView()
        }
    }
}
