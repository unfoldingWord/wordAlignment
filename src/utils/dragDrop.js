
export function canDropPrimaryWord(dropTargetProps, dragSourceProps) {
  const targetIsEmpty = dropTargetProps.topWords.length === 0;
  // const targetIsMerged = dropTargetProps.topWords.length > 1;
  const sourceIsMerged = dragSourceProps.alignmentLength > 1;
  // const hasSiblings = dropTargetProps.siblingTopWords && dropTargetProps.siblingTopWords.length > 1;

  const alignmentDelta = dropTargetProps.alignmentIndex - dragSourceProps.alignmentIndex;
  const firstWord = sourceIsMerged && dragSourceProps.wordIndex === 0;
  const lastWord = sourceIsMerged && dragSourceProps.wordIndex === dragSourceProps.alignmentLength - 1;

  // limit to adjacent alignments
  if(Math.abs(alignmentDelta) !== 1) {
    return false;
  }

  // exclude drags from merged to non-empty alignments
  if(sourceIsMerged && !targetIsEmpty) {
    return false;
  }

  // exclude dragging single words to empty alignments
  if(!sourceIsMerged && targetIsEmpty) {
    return false;
  }

  // handle un-merging
  if(sourceIsMerged) {
    // exclude dragging last word to the left
    if(alignmentDelta < 0 && lastWord) {
      return false;
    }

    // exclude dragging first word to the right
    if(alignmentDelta > 0 && firstWord) {
      return false;
    }
  }

  return Math.abs(alignmentDelta) === 1;
}