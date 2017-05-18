// @flow

export function range(x: number): Array<void> {
  return [...Array(x)];
}

export function moveToIdx<T>(ary: Array<T>, sourceIdx: number, destinationIdx: number): Array<T> {
  const ret = ary.slice();
  const item = ary[sourceIdx];
  if (destinationIdx < sourceIdx) {
    ret.splice(sourceIdx, 1);
    ret.splice(destinationIdx, 0, item);
  } else {
    ret.splice(destinationIdx+1, 0, item);
    ret.splice(sourceIdx, 1);
  }
  return ret;
}
