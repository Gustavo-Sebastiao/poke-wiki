import type { FuseResult } from 'fuse.js';

function normalizedEditDistance(left: string, right: string): number {
  const source = left.toLocaleLowerCase().trim();
  const target = right.toLocaleLowerCase().trim();
  if (!source.length || !target.length) return 1;

  let previous = Array.from({ length: target.length + 1 }, (_, index) => index);

  for (let sourceIndex = 1; sourceIndex <= source.length; sourceIndex += 1) {
    const current = [sourceIndex];
    for (let targetIndex = 1; targetIndex <= target.length; targetIndex += 1) {
      const substitutionCost = source[sourceIndex - 1] === target[targetIndex - 1] ? 0 : 1;
      current[targetIndex] = Math.min(
        current[targetIndex - 1] + 1,
        previous[targetIndex] + 1,
        previous[targetIndex - 1] + substitutionCost,
      );
    }
    previous = current;
  }

  return previous[target.length] / Math.max(source.length, target.length);
}

export function rankFuzzyResults<T>(
  results: FuseResult<T>[],
  query: string,
  getName: (item: T) => string,
): FuseResult<T>[] {
  const normalizedQuery = query.toLocaleLowerCase().trim();

  return [...results].sort((left, right) => {
    const leftIsExact = getName(left.item).toLocaleLowerCase().trim() === normalizedQuery;
    const rightIsExact = getName(right.item).toLocaleLowerCase().trim() === normalizedQuery;
    if (leftIsExact !== rightIsExact) return leftIsExact ? -1 : 1;

    const scoreDifference = (left.score ?? 1) - (right.score ?? 1);
    if (Math.abs(scoreDifference) > 0.02) return scoreDifference;

    const distanceDifference = normalizedEditDistance(query, getName(left.item))
      - normalizedEditDistance(query, getName(right.item));
    return distanceDifference || scoreDifference;
  });
}
