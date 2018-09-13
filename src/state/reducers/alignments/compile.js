import _ from 'lodash';

/**
 * Compiles rendered-alignments into alignments
 * @param {object[]} renders - an array of rendered-alignments
 * @param {object[]} alignments  - an array of original alignments
 * @return {{alignments: Array, indices: Object}} the compiled alignments and a dictionary mapping rendered alignment indices to compiled alignment indices.
 */
const compile = (renders, alignments) => {
  const approvedAlignments = [];
  const compiledRenders = {};

  // index the alignment keys
  const alignmentIndexMap = {};
  for (let i = 0; i < alignments.length; i++) {
    alignmentIndexMap[alignments[i].sourceNgram.join('|')] = i;
  }

  // index renders by alignment
  const siblingIndex = {};
  for (let siblingPos = 0; siblingPos < renders.length; siblingPos++) {
    for (const aIndex of renders[siblingPos].alignments) {
      if (!siblingIndex[aIndex]) {
        siblingIndex[aIndex] = [];
      }
      siblingIndex[aIndex].push(siblingPos);
    }
  }

  for (let renderPos = 0; renderPos < renders.length; renderPos++) {
    const r = renders[renderPos];
    const isSuggestion = r.suggestion !== undefined;
    if (renderPos in compiledRenders) {
      continue;
    }

    if (!isSuggestion) {
      // compile approved alignments
      // TRICKY: approved suggestions only have a single alignment
      approvedAlignments.push.apply(approvedAlignments,
        siblingIndex[r.alignments[0]]);
      compileApprovedSplitAlignment(renderPos, renders, siblingIndex,
        compiledRenders);
    } else {
      // compile everything else
      for (const aIndex of r.alignments) {
        // checks if a sibling of this render has been approved.
        const isSiblingApproved = approvedAlignments.indexOf(aIndex) >= 0;
        const alignment = alignments[aIndex];
        const isAlignmentUpdated = didAlignmentTargetChange(r, alignment);

        if (isAlignmentUpdated) {
          // compile partially approved suggestions (splits)
          compileUpdatedSplitAlignment(renderPos, renders, siblingIndex,
            compiledRenders);
        } else if (isSiblingApproved) {
          // compile partially approved suggestions (splits)
          compiledRenders[renderPos] = {
            isSuggestion: false,
            index: renderPos,
            values: {
              renderedIndex: renderPos,
              sourceNgram: [...r.sourceNgram],
              targetNgram: []
            }
          };
        } else {
          // compile un-approved suggestions
          // TRICKY: as an un-approved suggestion there may be multiple alignments
          // so we must append the values
          let values = [];
          if (compiledRenders[renderPos]) {
            values = compiledRenders[renderPos].values;
          }

          compiledRenders[renderPos] = {
            isSuggestion: true,
            index: renderPos,
            values: [
              ...values, {
                ..._.cloneDeep(alignment),
                renderedIndex: renderPos
              }]
          };
        }
      }
    }
  }

  const compiledIndices = {};
  const compiledAlignments = [];
  const flattenedAlignments = _.flatten(
    _.sortBy(Object.values(compiledRenders), [o => o.index]).
      map(o => o.values));

  // generate index map
  const addedAlignments = [];
  for (let i = 0; i < flattenedAlignments.length; i++) {
    const a = {...flattenedAlignments[i]};
    const id = a.sourceNgram.join('|');
    const originalIndex = alignmentIndexMap[id];

    if (!compiledIndices[a.renderedIndex]) {
      compiledIndices[a.renderedIndex] = [];
    }

    const alignmentIndex = addedAlignments.length;

    // skip duplicates
    if (addedAlignments.indexOf(id) >= 0) {
      const duplicateAlignmentIndex = addedAlignments.indexOf(id);
      if (compiledIndices[a.renderedIndex].indexOf(duplicateAlignmentIndex) ===
        -1) {
        compiledIndices[a.renderedIndex].push(duplicateAlignmentIndex);
      }
      continue;
    }

    if (originalIndex !== undefined && siblingIndex[originalIndex]) {
      // map old indices
      for (const renderedIndex of siblingIndex[originalIndex]) {
        if (!compiledIndices[renderedIndex]) {
          compiledIndices[renderedIndex] = [];
        }
        compiledIndices[renderedIndex].push(alignmentIndex);
      }
    } else {
      // map new indices
      compiledIndices[a.renderedIndex].push(alignmentIndex);
    }
    delete a.renderedIndex;
    compiledAlignments.push(a);
    addedAlignments.push(id);
  }

  return {
    alignments: compiledAlignments,
    indices: compiledIndices
  };
};

export default compile;

/**
 * Recursively compiles an approved rendered alignment
 * @param rIndex
 * @param renders
 * @param siblingIndex
 * @param compiledRenders
 */
const compileApprovedSplitAlignment = (
  rIndex, renders, siblingIndex, compiledRenders) => {
  const r = renders[rIndex];
  compiledRenders[rIndex] = {
    isSuggestion: false,
    index: rIndex,
    values: [
      {
        renderedIndex: rIndex,
        sourceNgram: [...r.sourceNgram],
        targetNgram: [...r.targetNgram]
      }]
  };
  for (const aIndex of r.alignments) {
    for (const sIndex of siblingIndex[aIndex]) {
      if (sIndex !== rIndex) {
        compileApprovedSplitAlignmentSiblings(sIndex, renders, siblingIndex,
          compiledRenders);
      }
    }
  }
};

/**
 * Recursively compiles an approved rendered alignment
 * @param rIndex
 * @param renders
 * @param siblingIndex
 * @param compiledRenders
 */
const compileUpdatedSplitAlignment = (
  rIndex, renders, siblingIndex, compiledRenders) => {
  const r = renders[rIndex];
  const partiallyApproved = r.suggestedTargetTokens.length > 0;
  const compiledTargetTokens = _.difference(r.targetNgram,
    r.suggestedTargetTokens);
  compiledRenders[rIndex] = {
    isSuggestion: partiallyApproved,
    index: rIndex,
    values: [
      {
        renderedIndex: rIndex,
        sourceNgram: [...r.sourceNgram],
        targetNgram: [...compiledTargetTokens]
      }]
  };
  for (const i of r.alignments) {
    for (const sIndex of siblingIndex[i]) {
      if (sIndex !== rIndex) {
        compileUpdatedSplitAlignmentSiblings(sIndex, renders, siblingIndex,
          compiledRenders);
      }
    }
  }
};

/**
 * Compiles the siblings of a split alignment suggestion
 * @param rIndex
 * @param renders
 * @param siblingIndex
 * @param compiledRenders
 */
const compileApprovedSplitAlignmentSiblings = (
  rIndex, renders, siblingIndex, compiledRenders) => {
  const r = renders[rIndex];

  // only compile un-approved suggestions
  if ((rIndex in compiledRenders && !compiledRenders[rIndex].isSuggestion)
    || (r.suggestion === undefined)) {
    return;
  }

  compiledRenders[rIndex] = {
    isSuggestion: false,
    index: rIndex,
    values: [
      {
        renderedIndex: rIndex,
        sourceNgram: [...r.sourceNgram],
        targetNgram: []
      }]
  };

  for (const aIndex of r.alignments) {
    for (const sIndex of siblingIndex[aIndex]) {
      if (sIndex !== rIndex) {
        compileApprovedSplitAlignmentSiblings(sIndex, renders, siblingIndex,
          compiledRenders);
      }
    }
  }
};

/**
 * Compiles the siblings of a split alignment suggestion
 * @param rIndex
 * @param renders
 * @param siblingIndex
 * @param compiledRenders
 */
const compileUpdatedSplitAlignmentSiblings = (
  rIndex, renders, siblingIndex, compiledRenders) => {
  const r = renders[rIndex];

  // only compile un-approved suggestions
  if ((rIndex in compiledRenders && !compiledRenders[rIndex].isSuggestion)
    || (r.suggestion === undefined)) {
    return;
  }

  compiledRenders[rIndex] = {
    isSuggestion: false,
    index: rIndex,
    values: [
      {
        renderedIndex: rIndex,
        sourceNgram: [...r.sourceNgram],
        targetNgram: []
      }]
  };

  for (const aIndex of r.alignments) {
    for (const sIndex of siblingIndex[aIndex]) {
      if (sIndex !== rIndex) {
        compileUpdatedSplitAlignmentSiblings(sIndex, renders, siblingIndex,
          compiledRenders);
      }
    }
  }
};

/**
 * Checks if the alignment target n-gram has changed
 * @param rendered
 * @param alignment
 * @return {boolean}
 */
export const didAlignmentTargetChange = (rendered, alignment) => {
  const changedTokens = _.difference(rendered.targetNgram,
    alignment.targetNgram);
  return _.difference(changedTokens, rendered.suggestedTargetTokens).length >
    0;
};
