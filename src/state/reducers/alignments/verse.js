import {
  ALIGN_SOURCE_TOKEN,
  ALIGN_TARGET_TOKEN,
  INSERT_ALIGNMENT,
  REPAIR_VERSE_ALIGNMENTS,
  RESET_VERSE_ALIGNMENT_SUGGESTIONS,
  RESET_VERSE_ALIGNMENTS,
  SET_ALIGNMENT_SUGGESTIONS,
  SET_CHAPTER_ALIGNMENTS,
  SET_SOURCE_TOKENS,
  SET_TARGET_TOKENS,
  UNALIGN_SOURCE_TOKEN,
  UNALIGN_TARGET_TOKEN
} from '../../actions/actionTypes';
import alignmentReducer, * as fromAlignment from './alignment';
import suggestionReducer from './suggestion';
import Token from 'word-map/structures/Token';
import {numberComparator} from './index';
import {insertSourceToken} from '../../actions';
import renderedAlignmentsReducer, * as fromRenderedAlignments
  from './renderedAlignments';
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
  suggestions: [],
  renderedAlignments: []
};

/**
 * Reduces the verse alignment state
 * @param state
 * @param action
 * @return {*}
 */
const verse = (state = defaultState, action) => {
  switch (action.type) {
    case UNALIGN_SOURCE_TOKEN: // destroy suggestion, clear target n-gram
    case ALIGN_SOURCE_TOKEN: // merge suggestions
    case UNALIGN_TARGET_TOKEN:
    case ALIGN_TARGET_TOKEN: {
      let newAlignments = [...state.alignments];
      const suggestions = [...state.suggestions];
      const index = action.index;

      if (!action.suggestion) {
        // update alignment
        newAlignments[index] = alignmentReducer(state.alignments[index],
          action);
        // TRICKY: remove empty alignments
        if (newAlignments[index].sourceNgram.length === 0) {
          newAlignments.splice(index, 1);
        }
      } else {
        let targetTokens = [];
        // remove affected alignments
        for (const alignmentIndex of action.suggestionAlignments) {
          const alignment = state.alignments[alignmentIndex];
          targetTokens = targetTokens.concat(alignment.targetNgram);
          newAlignments[alignmentIndex] = null;
        }
        newAlignments = _.compact(newAlignments);

        // update suggestion
        const suggestion = state.suggestions[index];
        suggestions[index] = suggestionReducer(suggestion, action);

        // build new alignment
        targetTokens = targetTokens.concat(suggestion.targetNgram);
        targetTokens = _.uniq(targetTokens);
        targetTokens.sort(numberComparator);
        const newAlignment = {
          sourceNgram: [...suggestion.sourceNgram],
          targetNgram: targetTokens
        };
        newAlignments.push(alignmentReducer(newAlignment, action));
      }

      return {
        ...state,
        alignments: newAlignments.sort(alignmentComparator),
        suggestions: suggestions.sort(alignmentComparator)
      };
    }
    case SET_ALIGNMENT_SUGGESTIONS: {
      const suggestions = action.alignments.map(a => ({
        sourceNgram: a.sourceNgram.map(t => t.position),
        targetNgram: a.targetNgram.map(t => t.position)
      }));
      suggestions.sort(alignmentComparator);
      return {
        ...state,
        suggestions,
        renderedAlignments: renderedAlignmentsReducer(state.renderedAlignments,
          action,
          state.alignments,
          suggestions,
          state.sourceTokens.length)
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
        alignments.push(alignmentReducer(undefined, {...action, position: i}));
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
          alignmentReducer(undefined, action)
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
        a => alignmentReducer(a, {
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
          fixedAlignments.push(alignmentReducer(undefined, insertAction));
        }
      }

      // clean broken alignments
      fixedAlignments = fixedAlignments.filter(a => a.sourceNgram.length > 0);
      fixedAlignments.sort(alignmentComparator);

      return {
        ...defaultState,
        targetTokens: action.targetTokens.map(formatTargetToken),
        sourceTokens: action.sourceTokens.map(formatSourceToken),
        alignments: fixedAlignments,
        renderedAlignments: renderedAlignmentsReducer(state.renderedAlignments,
          action, fixedAlignments)
      };
    }
    case SET_CHAPTER_ALIGNMENTS: {
      const vid = action.verse + '';
      const alignments = [];
      for (let i = 0; i < action.alignments[vid].alignments.length; i++) {
        alignments.push(alignmentReducer(state[i], {...action, index: i}));
      }
      return {
        ...defaultState,
        sourceTokens: action.alignments[vid].sourceTokens.map(
          formatSourceToken),
        targetTokens: action.alignments[vid].targetTokens.map(
          formatTargetToken),
        alignments,
        renderedAlignments: renderedAlignmentsReducer(state.renderedAlignments,
          action, alignments)
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
  let alignedTargetTokens = 0;
  for (const alignment of state.alignments) {
    // check source tokens
    if (!fromAlignment.getIsAligned(alignment)) {
      return false;
    }

    // check target tokens
    alignedTargetTokens += alignment.targetNgram.length;
  }

  return alignedTargetTokens === state.targetTokens.length;
};

/**
 * Returns tokens that have been aligned to the verse
 * @param state
 * @return {Token[]}
 */
export const getAlignedTargetTokens = state => {
  const alignments = getAlignments(state);
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
    const a = fromAlignment.getTokenizedAlignment(
      state.alignments[i],
      state.sourceTokens,
      state.targetTokens
    );
    a.index = i;
    a.position = i; // TODO: deprecated
    alignments.push(a);
  }
  return alignments;
};

/**
 * Returns alignments combined with suggestions
 * @param state
 * @return {Array}
 */
export const getRenderedAlignments = state => {
  return fromRenderedAlignments.getTokenizedAlignments(state.renderedAlignments,
    state.sourceTokens, state.targetTokens);
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
