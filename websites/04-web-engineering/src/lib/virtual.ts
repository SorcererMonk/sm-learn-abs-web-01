/** Which rows of a fixed-row-height list are visible (plus overscan) for a scroll position. */
export function visibleRange(
  scrollTop: number,
  viewportHeight: number,
  rowHeight: number,
  total: number,
  overscan = 5,
): { start: number; end: number } {
  const first = Math.floor(scrollTop / rowHeight);
  const count = Math.ceil(viewportHeight / rowHeight);
  return {
    start: Math.max(0, first - overscan),
    end: Math.min(total, first + count + overscan),
  };
}
