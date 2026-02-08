export const checkDivOverlap = (rectA: DOMRect, rectB: DOMRect): boolean => {
  return !(
    rectA.right < rectB.left ||
    rectA.left > rectB.right ||
    rectA.bottom < rectB.top ||
    rectA.top > rectB.bottom
  );
};
