import {numberComparator} from './index';
import {
  ACCEPT_VERSE_ALIGNMENT_SUGGESTIONS,
  INSERT_RENDERED_ALIGNMENT,
  REPAIR_VERSE_ALIGNMENTS,
  RESET_VERSE_ALIGNMENT_SUGGESTIONS,
  RESET_VERSE_ALIGNMENTS,
  SET_ALIGNMENT_SUGGESTIONS,
  SET_CHAPTER_ALIGNMENTS
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
    case ACCEPT_VERSE_ALIGNMENT_SUGGESTIONS:
    case INSERT_RENDERED_ALIGNMENT:
    case SET_ALIGNMENT_SUGGESTIONS:
      return render(alignments, suggestions, numSourceTokens);
    case SET_CHAPTER_ALIGNMENTS:
    case RESET_VERSE_ALIGNMENT_SUGGESTIONS:
    case RESET_VERSE_ALIGNMENTS:
    case REPAIR_VERSE_ALIGNMENTS:
      return [...convertToRendered(alignments)];
    default:
      return state;
  }
};

export default renderedAlignments;

/**
 * Converts some alignments to rendered alignments.
 * @param alignments
 * @return {*}
 */
const convertToRendered = (alignments) => {
  return alignments.map((a, index) => {
    const newA = _.cloneDeep(a);
    newA.alignments = [index];
    return newA;
  });
};

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

  // TRICKY: we don't support partial suggestion coverage at the moment
  if (suggestionIndex.length > 0 && suggestionIndex.length !==
    numSourceTokens) {
    console.error(
      'Index out of bounds. We currently do not support partial suggestions.');
    return [...convertToRendered(alignments)];
  }

  // TRICKY: short circuit invalid alignments
  if (alignmentIndex.length !== numSourceTokens) {
    console.error('Alignments are corrupt');
    return [...convertToRendered(alignments)];
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
      const suggestionIsEmpty = suggestionIndex[tIndex].targetNgram.length ===
        0;
      const suggestionTargetIsSuperset = isSubArray(
        suggestionIndex[tIndex].targetNgram,
        alignmentIndex[tIndex].targetNgram);

      const sourceNgramsMatch = alignmentIndex[tIndex].sourceId ===
        suggestionIndex[tIndex].sourceId;
      const targetNgramsMatch = alignmentIndex[tIndex].targetId ===
        suggestionIndex[tIndex].targetId;
      const isPerfectMatch = sourceNgramsMatch && targetNgramsMatch;

      if (!alignmentIsAligned) {
        // un-aligned alignments are valid unless a perfect match
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

      if (suggestionIsEmpty) {
        suggestionIsValid = false;
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
        rawSuggestion.alignments = [...alignmentQueue];
        rawSuggestion.suggestion = index;
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
        rawAlignment.alignments = [index];
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
  if (!state) {
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
