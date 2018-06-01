import {
  SET_ALIGNMENT_SUGGESTIONS,
  ALIGN_SOURCE_TOKEN,
  ALIGN_TARGET_TOKEN,
  INSERT_ALIGNMENT,
  REPAIR_VERSE_ALIGNMENTS,
  RESET_VERSE_ALIGNMENT_SUGGESTIONS,
  RESET_VERSE_ALIGNMENTS,
  SET_CHAPTER_ALIGNMENTS,
  SET_SOURCE_TOKENS,
  SET_TARGET_TOKENS,
  UNALIGN_SOURCE_TOKEN,
  UNALIGN_TARGET_TOKEN
} from '../../actions/actionTypes';
import alignment, * as fromAlignment from './alignment';
import * as fromSuggestion from './suggestion';
import Token from 'word-map/structures/Token';
import {numberComparator} from './index';
import {insertSourceToken} from '../../actions';
import _ from 'lodash';

/**
 * Compares two alignments for sorting
 * @param {object} a
 * @param {object} b
 * @return {number}
 */
const alignmentComparator = (a, b) => {
  if (a.sourceNgram.length && b.sourceNgram.length) {
    return numberComparator(a.sourceNgram[0], b.sourceNgram[0]);
  }
  return 0;
};

/**
 * Compares two tokens for equivalence based on their occurrence.
 * TRICKY: this is different from {@link Token.equals} which checks for an exact positional match.
 * @param {Token} t1
 * @param {Token} t2
 * @return {boolean}
 */
const isSameOccurrence = (t1, t2) => {
  return t1.toString() === t2.toString()
    && t1.occurrence === t2.occurrence
    && t1.occurrences === t2.occurrences;
};

/**
 * Searches for the index of a matching token occurrence.
 * This ignores the token's position within the sentence.
 * @param {Token} t
 * @param {Token[]} tokens
 * @return {number}
 */
const findIndexOfOccurrence = (t, tokens) => {
  for (let i = 0; i < tokens.length; i++) {
    if (isSameOccurrence(t, tokens[i])) {
      return i;
    }
  }
  return -1;
};

/**
 * Reduces a source token
 * @param token
 * @return {*}
 */
const formatSourceToken = token => ({
  text: token.text,
  position: token.position,
  occurrence: token.occurrence,
  occurrences: token.occurrences,
  strong: token.strong,
  lemma: token.lemma,
  morph: token.morph
});

/**
 * Reduces a target token
 * @param token
 * @return {*}
 */
const formatTargetToken = (token) => ({
  text: token.text,
  occurrence: token.occurrence,
  occurrences: token.occurrences,
  position: token.position
});

const defaultState = {
  sourceTokens: [],
  targetTokens: [],
  alignments: [],
  suggestions: []
};

/**
 * Reduces the verse alignment state
 * @param state
 * @param action
 * @return {*}
 */
const verse = (state = defaultState, action) => {
  switch (action.type) {
    case UNALIGN_SOURCE_TOKEN:
    case ALIGN_SOURCE_TOKEN:
    case UNALIGN_TARGET_TOKEN:
    case ALIGN_TARGET_TOKEN: {
      const index = action.index;
      const newAlignments = [...state.alignments];
      newAlignments[index] = alignment(state.alignments[index], action);
      // TRICKY: remove empty alignments
      if (newAlignments[index].sourceNgram.length === 0) {
        newAlignments.splice(index, 1);
      }
      return {
        ...state,
        alignments: newAlignments
      };
    }
    case SET_ALIGNMENT_SUGGESTIONS: {
      const suggestions = action.alignments.map(a => ({
        sourceNgram: a.sourceNgram.map(t => t.position),
        targetNgram: a.targetNgram.map(t => t.position)
      }));
      return {
        ...state,
        suggestions: suggestions.sort(alignmentComparator)
      };
    }
    case RESET_VERSE_ALIGNMENT_SUGGESTIONS:
      return {
        ...state,
        suggestions: []
      };
    case RESET_VERSE_ALIGNMENTS: {
      const alignments = [];
      for (let i = 0; i < state.sourceTokens.length; i++) {
        alignments.push(alignment(undefined, {...action, position: i}));
      }
      return {
        ...state,
        alignments,
        suggestions: []
      };
    }
    case INSERT_ALIGNMENT:
      return {
        ...state,
        alignments: [
          ...state.alignments,
          alignment(undefined, action)
        ].sort(alignmentComparator)
      };
    case SET_SOURCE_TOKENS: {
      return {
        sourceTokens: action.tokens.map(formatSourceToken),
        targetTokens: [...state.targetTokens],
        alignments: [...state.alignments]
      };
    }
    case SET_TARGET_TOKENS: {
      return {
        targetTokens: action.tokens.map(formatTargetToken),
        sourceTokens: [...state.sourceTokens],
        alignments: [...state.alignments]
      };
    }
    case REPAIR_VERSE_ALIGNMENTS: {

      // calculate operations
      const sourceTokenPositionMap = [];
      const targetTokenPositionMap = [];
      for (let i = 0; i < state.sourceTokens.length; i++) {
        const t = new Token(state.sourceTokens[i]);
        const newPos = findIndexOfOccurrence(t, action.sourceTokens);
        sourceTokenPositionMap.push(newPos);
      }
      for (let i = 0; i < state.targetTokens.length; i++) {
        const t = new Token(state.targetTokens[i]);
        const newPos = findIndexOfOccurrence(t, action.targetTokens);
        targetTokenPositionMap.push(newPos);
      }

      // repair
      let fixedAlignments = state.alignments.map(
        a => alignment(a, {
          ...action,
          sourceTokenPositionMap,
          targetTokenPositionMap
        }));

      // hydrate alignments
      let usedSourceTokens = [];
      fixedAlignments.map(a => {
        usedSourceTokens = usedSourceTokens.concat(
          fromAlignment.getSourceTokenPositions(a));
      });
      for (const t of action.sourceTokens) {
        if (!usedSourceTokens.includes(t.position)) {
          const insertAction = insertSourceToken(action.chapter, action.verse,
            t);
          fixedAlignments.push(alignment(undefined, insertAction));
        }
      }

      // clean broken alignments
      fixedAlignments = fixedAlignments.filter(a => a.sourceNgram.length > 0);

      return {
        targetTokens: action.targetTokens.map(formatTargetToken),
        sourceTokens: action.sourceTokens.map(formatSourceToken),
        alignments: fixedAlignments.sort(alignmentComparator),
        suggestions: []
      };
    }
    case SET_CHAPTER_ALIGNMENTS: {
      const vid = action.verse + '';
      const alignments = [];
      for (let i = 0; i < action.alignments[vid].alignments.length; i++) {
        alignments.push(alignment(state[i], {...action, index: i}));
      }
      return {
        ...defaultState,
        sourceTokens: action.alignments[vid].sourceTokens.map(
          formatSourceToken),
        targetTokens: action.alignments[vid].targetTokens.map(
          formatTargetToken),
        alignments
      };
    }
    default:
      return state;
  }
};

export default verse;

// TODO: change these to memoized selectors

/**
 * Returns the source tokens being aligned.
 * @param state
 * @return {Token[]}
 */
export const getSourceTokens = state => {
  return state.sourceTokens.map(t => new Token(t));
};

/**
 * Returns the target tokens being aligned
 * @param state
 * @return {Token[]}
 */
export const getTargetTokens = state => {
  return state.targetTokens.map(t => new Token(t));
};

/**
 * Returns the source text being aligned.
 * All punctuation will be stripped out.
 * @param state
 * @return {string}
 */
export const getSourceText = state => {
  return getSourceTokens(state).map(t => t.toString()).join(' ');
};

/**
 * Returns the target text being aligned.
 * All punctuation will be stripped out.
 * @param state
 * @return {string}
 */
export const getTargetText = state => {
  return getTargetTokens(state).map(t => t.toString()).join(' ');
};

/**
 * Checks if the verses being aligned are valid.
 * @param state
 * @param {string} sourceBaselineText - the source text used as a baseline
 * @param {string} targetBaselineText - the target text used as a baseline
 * @return {boolean}
 */
export const getIsValid = (state, sourceBaselineText, targetBaselineText) => {
  const sourceText = getSourceText(state);
  const targetText = getTargetText(state);
  // console.warn('source text:\n', sourceText, '\n', sourceBaselineText);
  // console.warn('target text:\n', targetText, '\n', targetBaselineText);
  return sourceText === sourceBaselineText && targetText === targetBaselineText;
};

/**
 * Checks if the verse is aligned.
 * All source and target tokens must be aligned.
 * @param state
 */
export const getIsAligned = state => {
  for (const alignment of state.alignments) {
    if (!fromAlignment.getIsAligned(alignment)) {
      return false;
    }
  }
  const tokens = getAlignedTargetTokens(state);
  return tokens.length === state.targetTokens.length;

};

/**
 * Returns tokens that have been aligned to the verse
 * @param state
 * @return {Token[]}
 */
export const getAlignedTargetTokens = state => {
  const alignments = getSuggestions(state);
  const tokens = [];
  for (const alignment of alignments) {
    for (const token of alignment.targetNgram) {
      tokens.push(token);
    }
  }
  return tokens;
};

/**
 * Returns the tokenized alignments for the verse.
 * @param state
 * @return {Array}
 */
export const getAlignments = state => {
  const alignments = [];
  for (let i = 0; i < state.alignments.length; i++) {
    const alignment = fromAlignment.getTokenizedAlignment(
      state.alignments[i],
      state.sourceTokens,
      state.targetTokens
    );
    alignment.index = i;
    alignments.push(alignment);
  }
  return alignments;
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
 * Returns the tokenized alignment suggestions
 * @param state
 * @return {Array}
 */
export const getSuggestions = state => {
  const suggestions = getRawSuggestions(state);
  const alignments = [];
  for(const suggestion of suggestions) {
    const alignment = fromAlignment.getTokenizedAlignment(
      suggestion,
      state.sourceTokens,
      state.targetTokens
    );
    alignment.index = suggestion.index;
    alignment.position = suggestion.position;
    alignment.suggestion = suggestion.suggestion;
    alignments.push(alignment);
  }
  return alignments;
};

/**
 * Returns alignments combined with suggestions
 * @param state
 * @return {Array}
 */
export const getRawSuggestions = state => {
  // index things
  const alignmentIndex = [];
  const suggestionIndex = [];
  for (let aIndex = 0; aIndex < state.alignments.length; aIndex++) {
    for (let i = 0; i < state.alignments[aIndex].sourceNgram.length; i++) {
      const sourceLength = state.alignments[aIndex].sourceNgram.length;
      alignmentIndex.push({
        index: aIndex,
        aligned: state.alignments[aIndex].targetNgram.length > 0,
        sourceLength,
        targetLength: state.alignments[aIndex].targetNgram.length,
        sourceId: state.alignments[aIndex].sourceNgram.join(),
        targetId: state.alignments[aIndex].targetNgram.join(),
        targetNgram: state.alignments[aIndex].targetNgram,
        lastSourceToken: state.alignments[aIndex].sourceNgram[sourceLength - 1]
      });
    }
  }
  for (let sIndex = 0; sIndex < state.suggestions.length; sIndex++) {
    for (let i = 0; i < state.suggestions[sIndex].sourceNgram.length; i++) {
      const sourceLength = state.suggestions[sIndex].sourceNgram.length;
      suggestionIndex.push({
        index: sIndex,
        sourceLength,
        targetLength: state.suggestions[sIndex].targetNgram.length,

        sourceId: state.suggestions[sIndex].sourceNgram.join(),
        targetId: state.suggestions[sIndex].targetNgram.join(),
        targetNgram: state.suggestions[sIndex].targetNgram,
        lastSourceToken: state.suggestions[sIndex].sourceNgram[sourceLength - 1]
      });
    }
  }

  if (suggestionIndex.length > 0 && suggestionIndex.length !==
    state.sourceTokens.length) {
    throw new Error(
      'Index out of bounds. We currently do not support partial suggestions.');
  }

  // build output
  const suggestedAlignments = [];
  let tokenQueue = [];
  let alignmentQueue = [];
  // let usedTargetTokens = [];
  let suggestionStateIsValid = true;
  for (let tIndex = 0; tIndex < state.sourceTokens.length; tIndex++) {
    tokenQueue.push(tIndex);
    if (!(alignmentIndex[tIndex].index in alignmentQueue)) {
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
    if(!suggestionIsValid) {
      suggestionStateIsValid = suggestionIsValid;
    }

    // append finished readings
    if (suggestionStateIsValid) {
      if (finishedReadingSuggestion) {
        // use the suggestion
        const index = suggestionIndex[tIndex].index;
        // merge target n-grams
        const rawSuggestion = Object.assign({}, state.suggestions[index]);
        rawSuggestion.suggestedTargetTokens = [...rawSuggestion.targetNgram];
        for (const aIndex of alignmentQueue) {
          const rawAlignment = state.alignments[aIndex];
          for(const t of rawAlignment.targetNgram) {
            if(!(t in rawSuggestion.targetNgram)) {
              rawSuggestion.targetNgram.push(t);
            } else {
              _.pull(rawSuggestion.suggestedTargetTokens, t);
            }
          }
          rawSuggestion.targetNgram = _.union(rawSuggestion.targetNgram,
            rawAlignment.targetNgram);
        }
        rawSuggestion.targetNgram.sort(numberComparator);
        // usedTargetTokens = usedTargetTokens.concat(rawSuggestion.targetNgram);
        // const suggestion = fromAlignment.getTokenizedAlignment(
        //   rawSuggestion,
        //   state.sourceTokens,
        //   state.targetTokens
        // );
        rawSuggestion.index = index;
        rawSuggestion.position = suggestedAlignments.length;
        rawSuggestion.suggestion = true;
        suggestedAlignments.push(rawSuggestion);
      }
    } else {
      if (finishedReadingAlignment) {
        // use the alignment
        const index = alignmentQueue.pop();
        const rawAlignment = Object.assign({}, state.alignments[index]);
        rawAlignment.index = index;
        rawAlignment.position = suggestedAlignments.length;
        suggestedAlignments.push(rawAlignment);
      }
    }

    // clean up
    if (finishedReadingAlignment || finishedReadingSuggestion) {
      tokenQueue = [];
      alignmentQueue = [];
    }
    if(finishedReadingSuggestion) {
      suggestionStateIsValid = true;
    }
  }

  return suggestedAlignments;
};

/**
 * Returns alignments like {@link getAlignments} but also
 * includes suggested alignments
 * @deprecated
 * @param state
 */
export const getAlignmentsWithSuggestions = state => {
  const alignments = [];
  for (let i = 0; i < state.alignments.length; i++) {
    const alignment = fromAlignment.getTokenizedAlignment(
      state.alignments[i],
      state.sourceTokens,
      state.targetTokens
    );
    alignment.index = i;
    alignments.push(alignment);
  }
  for (let i = 0; i < state.suggestions.length; i++) {
    const suggestion = fromSuggestion.getTokenizedSuggestion(
      state.suggestions[i],
      state.sourceTokens,
      state.targetTokens
    );
    for (const a of alignments) {
      if (alignmentIntersectsSuggestion(a, suggestion)) {
        // apply suggestion
      }
    }
  }
  return alignments;
};

/**
 * Checks if an alignment intersects with a suggestion
 * @deprecated
 * @param alignment
 * @param suggestion
 */
const alignmentIntersectsSuggestion = (alignment, suggestion) => {
  return getAlignmentMatchesSuggestion(alignment, suggestion) ||
    getAlignmentSubsetsSuggestion(alignment, suggestion);
};

/**
 * Checks if the alignment sourceNgram exactly matches a suggestion
 * @deprecated
 * @param alignment
 * @param suggestion
 * @return {boolean}
 */
export const getAlignmentMatchesSuggestion = (alignment, suggestion) => {
  if (alignment.sourceNgram.length === suggestion.sourceNgram.length) {
    for (let i = 0; i < alignment.sourceNgram.length; i++) {
      if (alignment.sourceNgram[i] !== suggestion.sourceNgram[i]) {
        return false;
      }
    }
    return true;
  }
  return false;
};

/**
 * Checks if the alignment sourceNgram is a subset of the suggestion
 * and is not aligned
 * @deprecated
 * @param alignment
 * @param suggestion
 */
export const getAlignmentSubsetsSuggestion = (alignment, suggestion) => {
  if (alignment.sourceNgram.length < suggestion.sourceNgram.length &&
    alignment.targetNgram.length === 0) {
    // find subset start index
    const firstToken = alignment.sourceNgram[0];
    let subsetIndex = -1;
    for (let i = 0; i < suggestion.sourceNgram.length; i++) {
      if (suggestion.sourceNgram[i] === firstToken) {
        subsetIndex = i;
        break;
      }
    }

    if (subsetIndex === -1) {
      return false;
    }

    // compare subset
    // TRICKY: the first token was already compared
    for (let i = 1; i < alignment.sourceNgram.length; i++) {
      subsetIndex++;
      if (suggestion.sourceNgram[subsetIndex] !== alignment.sourceNgram[i]) {
        return false;
      }
    }
    return true;
  }
  return false;
};

/**
 * Checks if the machine alignment is valid.
 * In particular the ensures the alignment does not conflict with a human alignment
 * @deprecated
 * @param state
 * @param {object} machineAlignment
 * @return {boolean}
 */
export const getIsMachineAlignmentValid = (state, machineAlignment) => {
  for (const alignment of state.alignments) {
    const tokenizedAlignment = fromAlignment.getTokenizedAlignment(alignment,
      state.sourceTokens,
      state.targetTokens);

    if (tokenizedAlignment.sourceNgram.length ===
      machineAlignment.sourceNgram.length) {
      for (let i = 0; i < machineAlignment.sourceNgram.length; i++) {
        if (!tokenizedAlignment.sourceNgram[i].equals(
          machineAlignment.sourceNgram[i])) {
          return false;
        }
      }
      return true;
    }
  }
  return false;
};

/**
 * Returns alignments for the verse in the legacy format
 * @param state
 * @return {*}
 */
export const getLegacyAlignments = state => {
  const alignments = getAlignments(state);
  const targetTokens = getTargetTokens(state);
  const legacyAlignments = [];
  let usedTargetTokens = [];
  for (const a of alignments) {
    usedTargetTokens = usedTargetTokens.concat(a.targetNgram);
    legacyAlignments.push(makeLegacyAlignment(a));
  }
  const unusedTargetTokens = targetTokens.filter(t => {
    for (const usedToken of usedTargetTokens) {
      if (t.equals(usedToken)) {
        return false;
      }
    }
    return true;
  });
  return {
    alignments: legacyAlignments,
    wordBank: unusedTargetTokens.map(makeLegacyTargetToken)
  };
};

/**
 * Converts an alignment to a legacy alignment
 * @param alignment
 */
const makeLegacyAlignment = alignment => ({
  topWords: alignment.sourceNgram.map(makeLegacySourceToken),
  bottomWords: alignment.targetNgram.map(makeLegacyTargetToken)
});

const makeLegacySourceToken = token => ({
  word: token.toString(),
  strong: token.strong,
  lemma: token.lemma,
  morph: token.morph,
  occurrence: token.occurrence,
  occurrences: token.occurrences
});

const makeLegacyTargetToken = token => ({
  word: token.toString(),
  occurrence: token.occurrence,
  occurrences: token.occurrences,
  type: 'bottomWord'
});
