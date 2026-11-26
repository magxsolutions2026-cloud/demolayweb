/** Closed SVG path through `points` [x, y, radius], each corner rounded with a quadratic curve (works for concave corners too). */
export function roundedPath(points: [number, number, number][]) {
  const n = points.length;
  const seg = (from: [number, number, number], to: [number, number, number], r: number) => {
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const len = Math.hypot(dx, dy) || 1;
    const t = Math.min(r, len / 2) / len;
    return [from[0] + dx * t, from[1] + dy * t, to[0] - dx * t, to[1] - dy * t];
  };
  let d = '';
  for (let k = 0; k < n; k++) {
    const prev = points[(k + n - 1) % n];
    const cur = points[k];
    const next = points[(k + 1) % n];
    const [, , inX, inY] = seg(prev, cur, cur[2]);
    const [outX, outY] = seg(cur, next, cur[2]);
    d += `${k === 0 ? 'M' : 'L'}${inX} ${inY} Q${cur[0]} ${cur[1]} ${outX} ${outY} `;
  }
  return `${d}Z`;
}
