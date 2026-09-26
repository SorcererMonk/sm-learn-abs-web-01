// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { auditHead, type Finding } from '../../src/lib/head-audit.ts';

const parse = (html: string): Document => new DOMParser().parseFromString(html, 'text/html');
const errors = (findings: Finding[]): string[] =>
  findings.filter((f) => f.level === 'error').map((f) => f.message);

const good = `<!doctype html><html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Cycle lanes approved · The Daily Planet</title>
<meta name="description" content="The council voted 9–2 to build 14 km of protected cycle lanes by 2027. Here is what changes, street by street.">
<link rel="canonical" href="https://planet.example/news/cycle-lanes">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<meta property="og:title" content="Cycle lanes approved">
<meta property="og:description" content="14 km of protected lanes by 2027.">
<meta property="og:image" content="https://planet.example/og/cycle-lanes.png">
<meta property="og:image:alt" content="Map of the new lanes">
<meta property="og:url" content="https://planet.example/news/cycle-lanes">
<link rel="preload" href="/fonts/serif.woff2" as="font" type="font/woff2" crossorigin>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"NewsArticle","headline":"Cycle lanes approved"}</script>
</head><body></body></html>`;

describe('auditHead', () => {
  it('passes a complete head with no errors or warnings', () => {
    const findings = auditHead(parse(good));
    expect(findings.filter((f) => f.level !== 'ok')).toEqual([]);
    expect(findings.some((f) => f.message.includes('NewsArticle'))).toBe(true);
  });

  it('flags zoom blocking, missing charset, lang and title', () => {
    const doc = parse(
      '<html><head><meta name="viewport" content="width=device-width, user-scalable=no"></head></html>',
    );
    const errs = errors(auditHead(doc));
    expect(errs.some((m) => m.includes('charset'))).toBe(true);
    expect(errs.some((m) => m.includes('zooming'))).toBe(true);
    expect(errs.some((m) => m.includes('lang'))).toBe(true);
    expect(errs.some((m) => m.includes('<title>'))).toBe(true);
  });

  it('treats maximum-scale=1 as blocking zoom but allows maximum-scale=5', () => {
    const blocked = parse(
      '<head><meta name="viewport" content="width=device-width, maximum-scale=1"></head>',
    );
    const allowed = parse(
      '<head><meta name="viewport" content="width=device-width, maximum-scale=5"></head>',
    );
    expect(errors(auditHead(blocked)).some((m) => m.includes('zooming'))).toBe(true);
    expect(errors(auditHead(allowed)).some((m) => m.includes('zooming'))).toBe(false);
  });

  it('warns when charset is not first and title is too long', () => {
    const doc = parse(
      `<html lang="en"><head><title>${'Very long title '.repeat(6)}</title><meta charset="utf-8"></head></html>`,
    );
    const warns = auditHead(doc)
      .filter((f) => f.level === 'warn')
      .map((f) => f.message);
    expect(warns.some((m) => m.includes('first element'))).toBe(true);
    expect(warns.some((m) => m.includes('truncated'))).toBe(true);
  });

  it('catches broken JSON-LD and font preloads without crossorigin', () => {
    const doc = parse(
      '<head><script type="application/ld+json">{nope}</script><link rel="preload" href="/f.woff2" as="font"></head>',
    );
    const errs = errors(auditHead(doc));
    expect(errs.some((m) => m.includes('not valid JSON'))).toBe(true);
    expect(errs.some((m) => m.includes('crossorigin'))).toBe(true);
  });
});
