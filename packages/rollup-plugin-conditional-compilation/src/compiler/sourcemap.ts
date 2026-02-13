import MagicString from 'magic-string';
import type { ExistingRawSourceMap } from 'rollup';
import type { SourceMapOptions, CodeRange } from '../types/global.js';

function toDroppedRanges(codeLength: number, keptRanges: CodeRange[]): CodeRange[] {
  if (keptRanges.length === 0) {
    return [{ start: 0, end: codeLength }];
  }

  const dropped: CodeRange[] = [];
  let cursor = 0;
  for (let i = 0; i < keptRanges.length; i++) {
    const range = keptRanges[i];
    if (cursor < range.start) {
      dropped.push({ start: cursor, end: range.start });
    }
    cursor = range.end;
  }

  if (cursor < codeLength) {
    dropped.push({ start: cursor, end: codeLength });
  }

  return dropped;
}

export function createSourceMap(
  originalCode: string,
  keptRanges: CodeRange[],
  options: SourceMapOptions = {},
): ExistingRawSourceMap {
  const filename = options.filename ?? 'source.js';
  const droppedRanges = toDroppedRanges(originalCode.length, keptRanges);
  const magicString = new MagicString(originalCode, { filename });

  for (let i = droppedRanges.length - 1; i >= 0; i--) {
    const range = droppedRanges[i];
    if (range.start < range.end) {
      magicString.remove(range.start, range.end);
    }
  }

  return magicString.generateMap({
    file: filename,
    source: filename,
    includeContent: true,
    hires: true,
  }) as unknown as ExistingRawSourceMap;
}
