import _ from 'lodash';

/**
 * Renders the verse alignments with the suggestions
 * @param {object[]} alignments - an array of alignments
 * @param {object[]} suggestions - an array of alignment suggestions
 * @param {number} numSourceTokens - the number of source tokens in the verse
 * @return the alignments rendered with suggestions.
 */
const render = (alignments, suggestions, numSourceTokens) => {
  // index things
  const alignmentSourceIndex = [];
  const suggestionSourceIndex = [];
  const targetIndex = {};
  for (let aIndex = 0; aIndex < alignments.length; aIndex++) {
    for (const pos of alignments[aIndex].targetNgram) {
      targetIndex[pos] = aIndex;
    }
    for (let i = 0; i < alignments[aIndex].sourceNgram.length; i++) {
      const sourceLength = alignments[aIndex].sourceNgram.length;
      // TRICKY: the source tokens will be in order spread over the alignments
      alignmentSourceIndex.push({
        index: aIndex,
        aligned: alignments[aIndex].targetNgram.length > 0,
        sourceLength,
        targetLength: alignments[aIndex].targetNgram.length,
        sourceId: alignments[aIndex].sourceNgram.join(),
        targetId: alignments[aIndex].targetNgram.join(),
        targetNgram: alignments[aIndex].targetNgram,
        lastSourceToken: alignments[aIndex].sourceNgram[sourceLength - 1]
      });
    }
  }
  for (let sIndex = 0; sIndex < suggestions.length; sIndex++) {
    for (let i = 0; i < suggestions[sIndex].sourceNgram.length; i++) {
      const sourceLength = suggestions[sIndex].sourceNgram.length;
      // TRICKY: the source tokens will be in order spread over the suggestions
      suggestionSourceIndex.push({
        index: sIndex,
        sourceLength,
        targetLength: suggestions[sIndex].targetNgram.length,
        isEmpty: suggestions[sIndex].targetNgram.length === 0,
        sourceId: suggestions[sIndex].sourceNgram.join(),
        targetId: suggestions[sIndex].targetNgram.join(),
        targetNgram: suggestions[sIndex].targetNgram,
        lastSourceToken: suggestions[sIndex].sourceNgram[sourceLength - 1]
      });
    }
  }

  // TRICKY: we don't support partial suggestion coverage at the moment
  if (suggestionSourceIndex.length > 0 && suggestionSourceIndex.length !==
    numSourceTokens) {
    console.error(
      'Index out of bounds. We currently do not support partial suggestions.');
    return [...convertToRendered(alignments)];
  }

  // TRICKY: short circuit invalid alignments
  if (alignmentSourceIndex.length !== numSourceTokens) {
    console.error('Alignments are corrupt');
    return [...convertToRendered(alignments)];
  }

  // build output
  const suggestedAlignments = [];
  let tokenQueue = [];
  let alignmentQueue = []; // track how many alignments span a suggestion
  let suggestionStateIsValid = true;
  for (let tIndex = 0; tIndex < numSourceTokens; tIndex++) {
    tokenQueue.push(tIndex);
    if (alignmentQueue.indexOf(alignmentSourceIndex[tIndex].index) === -1) {
      alignmentQueue.push(alignmentSourceIndex[tIndex].index);
    }

    const alignmentIsAligned = alignmentSourceIndex[tIndex].aligned;
    const finishedReadingAlignment = alignmentSourceIndex[tIndex].lastSourceToken ===
      tIndex;
    const suggestionSpansMultiple = alignmentQueue.length > 1;

    let targetUsedElsewhere = false;

    // determine suggestion validity
    let suggestionIsValid = false;
    let finishedReadingSuggestion = false;
    let sourceNgramsMatch = false;
    // TRICKY: we may not have suggestions for everything
    if (tIndex < suggestionSourceIndex.length) {
      // check if suggested target tokens are already used
      for (const targetPos of suggestionSourceIndex[tIndex].targetNgram) {
        if (targetPos in targetIndex) {
          const index = targetIndex[targetPos];
          targetUsedElsewhere = alignmentQueue.indexOf(index) === -1;
          if(targetUsedElsewhere) {
            break;
          }
        }
      }

      finishedReadingSuggestion = suggestionSourceIndex[tIndex].lastSourceToken ===
        tIndex;
      const suggestionTargetIsSuperset = isSubArray(
        suggestionSourceIndex[tIndex].targetNgram,
        alignmentSourceIndex[tIndex].targetNgram);

      sourceNgramsMatch = alignmentSourceIndex[tIndex].sourceId ===
        suggestionSourceIndex[tIndex].sourceId;
      const targetNgramsMatch = alignmentSourceIndex[tIndex].targetId ===
        suggestionSourceIndex[tIndex].targetId;
      const isPerfectMatch = sourceNgramsMatch && targetNgramsMatch;

      if (!alignmentIsAligned) {
        // un-aligned alignments are valid
        suggestionIsValid = true;
      } else if (!isPerfectMatch && finishedReadingAlignment &&
        finishedReadingSuggestion && !suggestionSpansMultiple &&
        suggestionTargetIsSuperset && sourceNgramsMatch) {
        // identical source n-grams are valid
        suggestionIsValid = true;
      } else if (!isPerfectMatch && !finishedReadingAlignment &&
        !finishedReadingSuggestion && !suggestionSpansMultiple &&
        suggestionTargetIsSuperset) {
        // incomplete readings are valid until proven otherwise
        suggestionIsValid = true;
      }
    }

    // TRICKY: persist invalid state through the entire suggestion.
    if (!suggestionIsValid) {
      suggestionStateIsValid = suggestionIsValid;
    }

    // renders a finished alignment
    const renderAlignment = () => {
      // use the alignment
      const index = alignmentQueue.pop();
      const rawAlignment = _.cloneDeep(alignments[index]);
      rawAlignment.alignments = [index];
      return rawAlignment;
    };

    // renders a finished suggestion
    const renderSuggestion = () => {
      const index = suggestionSourceIndex[tIndex].index;
      // merge target n-grams
      const rawSuggestion = _.cloneDeep(suggestions[index]);
      rawSuggestion.suggestedTargetTokens = [...rawSuggestion.targetNgram];
      for (const aIndex of alignmentQueue) {
        const rawAlignment = alignments[aIndex];
        for (const t of rawAlignment.targetNgram) {
          if (rawSuggestion.targetNgram.indexOf(t) === -1) {
            rawSuggestion.targetNgram.push(t);
          } else {
            _.pull(rawSuggestion.suggestedTargetTokens, t);
          }
        }
        rawSuggestion.targetNgram = _.union(rawSuggestion.targetNgram,
          rawAlignment.targetNgram);
      }
      rawSuggestion.alignments = [...alignmentQueue];
      rawSuggestion.suggestion = index;
      rawSuggestion.targetNgram;
      if (suggestionSourceIndex[tIndex].isEmpty && sourceNgramsMatch) {
        // TRICKY: render empty matches as an alignment
        return {
          alignments: rawSuggestion.alignments,
          sourceNgram: rawSuggestion.sourceNgram,
          targetNgram: rawSuggestion.targetNgram
        };
      } else {
        return rawSuggestion;
      }
    };

    // TRICKY: if the suggested target tokens are used elsewhere we render the alignment
    const shouldRenderSuggestion = suggestionStateIsValid &&
      finishedReadingSuggestion && !targetUsedElsewhere;
    const shouldRenderAlignment = (!suggestionStateIsValid ||
      targetUsedElsewhere) && finishedReadingAlignment;

    // append finished readings
    if (shouldRenderSuggestion) {
      suggestedAlignments.push(renderSuggestion());
    } else if (shouldRenderAlignment) {
      suggestedAlignments.push(renderAlignment());
    }

    // clean up
    if (!suggestionStateIsValid && finishedReadingAlignment ||
      suggestionStateIsValid && finishedReadingSuggestion) {
      tokenQueue = [];
      alignmentQueue = [];
    }
    if (finishedReadingSuggestion) {
      suggestionStateIsValid = true;
    }
  }

  return suggestedAlignments;
};

export default render;

/**
 * Converts some alignments to rendered alignments.
 * @param alignments
 * @return {*}
 */
export const convertToRendered = (alignments) => {
  return alignments.map((a, index) => {
    const newA = _.cloneDeep(a);
    newA.alignments = [index];
    return newA;
  });
};

/**
 * Checks if an array if a subset of another
 * @param superset
 * @param subset
 * @return {boolean}
 */
const isSubArray = (superset, subset) => {
  for (const val of subset) {
    if (!_.includes(superset, val)) {
      return false;
    }
  }
  return true;
};
