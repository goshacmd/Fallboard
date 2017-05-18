// @flow

type Point =  { x: number, y: number };
type Rect = { x1: number, x2: number, y1: number, y2: number };
export function doesOverlap(a: Rect, b: Rect): bool {
  return (
    ((a.x1 >= b.x1 && a.x1 <= b.x2) || (a.x2 >= b.x1 && a.x2 <= b.x2)) &&
    ((a.y1 >= b.y1 && a.y1 <= b.y2) || (a.y2 >= b.y1 && a.y2 <= b.y2))
  );
}

export function isPointInsideRect(point: Point, rect: Rect): bool {
  return point.x >= rect.x1 && point.x <= rect.x2 && point.y >= rect.y1 && point.y <= rect.y2;
}

export function moveRect(rect: Rect, dx: number, dy: number): Rect {
  return { x1: rect.x1 + dx, x2: rect.x2 + dx, y1: rect.y1 + dy, y2: rect.y2 + dy };
}
