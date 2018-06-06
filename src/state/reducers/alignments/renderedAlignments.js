import {numberComparator} from './index';
import {
  REPAIR_VERSE_ALIGNMENTS,
  SET_ALIGNMENT_SUGGESTIONS,
  SET_CHAPTER_ALIGNMENTS,
  RESET_VERSE_ALIGNMENT_SUGGESTIONS,
  INSERT_ALIGNMENT,
  RESET_VERSE_ALIGNMENTS
} from '../../actions/actionTypes';
import _ from 'lodash';
import Token from 'word-map/structures/Token';

/**
 * The renderedAlignments reducer
 * @param state
 * @param action
 * @param {object[]} alignments
 * @param {object[]} suggestions
 * @param {number} numSourceTokens
 * @return {Array}
 */
const renderedAlignments = (
  state = [], action, alignments = [], suggestions = [],
  numSourceTokens = 0) => {
  switch (action.type) {
    case INSERT_ALIGNMENT:
    case SET_ALIGNMENT_SUGGESTIONS:
      return render(alignments, suggestions, numSourceTokens);
    case SET_CHAPTER_ALIGNMENTS:
    case RESET_VERSE_ALIGNMENT_SUGGESTIONS:
    case RESET_VERSE_ALIGNMENTS:
    case REPAIR_VERSE_ALIGNMENTS:
      return [...alignments.map(_.cloneDeep)];
    default:
      return state;
  }
};

export default renderedAlignments;

/**
 * Renders the verse alignments with the suggestions
 * @param {object[]} alignments - an array of alignments
 * @param {object[]} suggestions - an array of alignment suggestions
 * @param {number} numSourceTokens - the number of source tokens in the verse
 */
export const render = (alignments, suggestions, numSourceTokens) => {
  // index things
  const alignmentIndex = [];
  const suggestionIndex = [];
  for (let aIndex = 0; aIndex < alignments.length; aIndex++) {
    for (let i = 0; i < alignments[aIndex].sourceNgram.length; i++) {
      const sourceLength = alignments[aIndex].sourceNgram.length;
      alignmentIndex.push({
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
      suggestionIndex.push({
        index: sIndex,
        sourceLength,
        targetLength: suggestions[sIndex].targetNgram.length,

        sourceId: suggestions[sIndex].sourceNgram.join(),
        targetId: suggestions[sIndex].targetNgram.join(),
        targetNgram: suggestions[sIndex].targetNgram,
        lastSourceToken: suggestions[sIndex].sourceNgram[sourceLength - 1]
      });
    }
  }

  if (suggestionIndex.length > 0 && suggestionIndex.length !==
    numSourceTokens) {
    throw new Error(
      'Index out of bounds. We currently do not support partial suggestions.');
  }

  // TRICKY: short circuit invalid alignments
  if (alignmentIndex.length !== numSourceTokens) {
    console.error('Alignments are corrupt');
    return [...alignments.map(_.cloneDeep)];
  }

  // build output
  const suggestedAlignments = [];
  let tokenQueue = [];
  let alignmentQueue = [];
  let suggestionStateIsValid = true;
  for (let tIndex = 0; tIndex < numSourceTokens; tIndex++) {
    tokenQueue.push(tIndex);
    if (alignmentQueue.indexOf(alignmentIndex[tIndex].index) === -1) {
      alignmentQueue.push(alignmentIndex[tIndex].index);
    }

    const alignmentIsAligned = alignmentIndex[tIndex].aligned;
    const finishedReadingAlignment = alignmentIndex[tIndex].lastSourceToken ===
      tIndex;
    const suggestionSpansMultiple = alignmentQueue.length > 1;

    // determine suggestion validity
    let suggestionIsValid = false;
    let finishedReadingSuggestion = false;
    // TRICKY: we may not  have suggestions for everything
    if (tIndex < suggestionIndex.length) {
      finishedReadingSuggestion = suggestionIndex[tIndex].lastSourceToken ===
        tIndex;
      const suggestionTargetIsSuperset = isSubArray(
        suggestionIndex[tIndex].targetNgram,
        alignmentIndex[tIndex].targetNgram);

      const sourceNgramsMatch = alignmentIndex[tIndex].sourceId ===
        suggestionIndex[tIndex].sourceId;
      const targetNgramsMatch = alignmentIndex[tIndex].targetId ===
        suggestionIndex[tIndex].targetId;
      const isPerfectMatch = sourceNgramsMatch && targetNgramsMatch;

      if (!alignmentIsAligned) {
        // un-aligned alignments are valid
        suggestionIsValid = true;
      } else if (!isPerfectMatch && finishedReadingAlignment &&
        finishedReadingSuggestion && !suggestionSpansMultiple &&
        suggestionTargetIsSuperset) {
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

    // append finished readings
    if (suggestionStateIsValid) {
      if (finishedReadingSuggestion) {
        // use the suggestion
        const index = suggestionIndex[tIndex].index;
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
        rawSuggestion.suggestionAlignments = [...alignmentQueue];
        rawSuggestion.targetNgram.sort(numberComparator);
        // rawSuggestion.index = index;
        // rawSuggestion.position = suggestedAlignments.length;
        suggestedAlignments.push(rawSuggestion);
      }
    } else {
      if (finishedReadingAlignment) {
        // use the alignment
        const index = alignmentQueue.pop();
        const rawAlignment = _.cloneDeep(alignments[index]);
        // rawAlignment.index = index;
        // rawAlignment.position = suggestedAlignments.length;
        suggestedAlignments.push(rawAlignment);
      }
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

/**
 * Returns the tokenized rendered alignments
 * @param state
 * @param sourceTokens
 * @param targetTokens
 */
export const getTokenizedAlignments = (state, sourceTokens, targetTokens) => {
  const alignments = [];
  if(!state) {
    return [];
  }
  for (const rendered of state) {
    const a = {
      sourceNgram: rendered.sourceNgram.map(
        pos => new Token(_.cloneDeep(sourceTokens[pos]))),
      targetNgram: rendered.targetNgram.map(pos => {
        const config = _.cloneDeep(targetTokens[pos]);
        config.suggestion = isTokenSuggestion(rendered, config);
        return new Token(config);
      })
    };

    a.index = alignments.length;
    a.position = alignments.length; // TODO: deprecated
    a.isSuggestion = !!rendered.suggestedTargetTokens;
    alignments.push(a);
  }
  return alignments;
};

/**
 * Checks if a token is a suggestion
 * @param renderedAlignment
 * @param token
 * @return {*|number[]|boolean}
 */
const isTokenSuggestion = (renderedAlignment, token) => {
  return renderedAlignment.suggestedTargetTokens &&
    renderedAlignment.suggestedTargetTokens.indexOf(token.position) >= 0;
};
