/**
 * Determines if a word can be dropped
 * @param dropTargetProps
 * @param dragSourceProps
 * @return {boolean}
 */
export function canDropPrimaryWord(dropTargetProps, dragSourceProps) {
  const emptyTarget = dropTargetProps.topWords.length === 0;
  const singleTarget = dropTargetProps.topWords.length === 1;
  const mergedTarget = dropTargetProps.topWords.length > 1;
  const singleSource  = dragSourceProps.alignmentLength === 1;
  const mergedSource = dragSourceProps.alignmentLength > 1;
  const alignmentDelta = dropTargetProps.alignmentIndex - dragSourceProps.alignmentIndex;
  const moveLeft = alignmentDelta < 0;
  const moveRight = alignmentDelta > 0;
  const moved = alignmentDelta !== 0;
  const leftWord = mergedSource && dragSourceProps.wordIndex === 0;
  const rightWord = mergedSource && dragSourceProps.wordIndex === dragSourceProps.alignmentLength - 1;

  // limit all drags to adjacent alignments
  if(Math.abs(alignmentDelta) > 1) return false;

  // single to single
  // TRICKY: make sure we've moved
  if(singleSource && singleTarget && moved) return true;

  // single to merged
  if(singleSource && mergedTarget) {
    return true;
  }

  // merged to empty
  if(mergedSource && emptyTarget) {
    if(!moved) return true;
    // TRICKY: valid empty targets have the same alignment index as the source
    // if(moveLeft && leftWord) return true;
    // if(moveRight && rightWord) return true;
  }

  return false;
}