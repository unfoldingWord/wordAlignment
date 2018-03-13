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
  const leftPlaceholder = dropTargetProps.placeholderPosition === 'left';  //alignmentDelta < 0;
  const rightPlaceholder = dropTargetProps.placeholderPosition === 'right'; //alignmentDelta > 0;
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
    // TODO: need a workaround for this bug before supporting left vs right un-merging https://github.com/react-dnd/react-dnd/issues/735
    // see components/AlignmentGrid.js
    // we could potentially use the touch backend https://github.com/yahoo/react-dnd-touch-backend
    // however that would require us to render a custom drag preview and the drag performance may
    // not be as good.
    // if(!moved && leftPlaceholder && leftWord) return true;
    // if(!moved && rightPlaceholder && rightWord) return true;
  }

  return false;
}
