import {
  ALIGN_SOURCE_TOKEN,
  ALIGN_TARGET_TOKEN,
  INSERT_ALIGNMENT,
  SET_CHAPTER_ALIGNMENTS,
  SET_SOURCE_TOKENS,
  SET_TARGET_TOKENS,
  UNALIGN_SOURCE_TOKEN,
  UNALIGN_TARGET_TOKEN
} from '../../actions/actionTypes';
import alignment, * as fromAlignment from './alignment';
import Token from 'word-map/structures/Token';
import {numberComparator} from './index';

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
 * Reduces a source token
 * @param token
 * @return {*}
 */
const formatSourceToken = (token) => ({
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

/**
 * Reduces the verse alignment state
 * @param state
 * @param action
 * @return {*}
 */
const verse = (state = {}, action) => {
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
        source: {
          tokens: action.tokens.map(formatSourceToken)
        },
        target: {
          tokens: [...state.target.tokens]
        },
        alignments: [...state.alignments]
      };
    }
    case SET_TARGET_TOKENS: {
      return {
        target: {
          tokens: action.tokens.map(formatTargetToken)
        },
        source: {
          tokens: [...state.source.tokens]
        },
        alignments: [...state.alignments]
      };
    }
    case SET_CHAPTER_ALIGNMENTS: {
      const vid = action.verse + '';
      const alignments = [];
      for (let i = 0; i < action.alignments[vid].alignments.length; i++) {
        alignments.push(alignment(state[i], {...action, index: i}));
      }
      return {
        source: {
          tokens: action.alignments[vid].sourceTokens.map(formatSourceToken)
        },
        target: {
          tokens: action.alignments[vid].targetTokens.map(formatTargetToken)
        },
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
  return state.tokens.map(t => new Token(t));
};

/**
 * Returns the target tokens being aligned
 * @param state
 * @return {Token[]}
 */
export const getTargetTokens = state => {
  return state.tokens.map(t => new Token(t));
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
  return sourceText !== sourceBaselineText || targetText !== targetBaselineText;
};

/**
 * Returns the tokenized alignments for the verse
 * @param state
 * @return {Array}
 */
export const getAlignments = state => {
  const alignments = [];
  for (const alignment of state.alignments) {
    alignments.push(fromAlignment.getTokenizedAlignment(
      alignment,
      state.source.tokens,
      state.target.tokens
    ));
  }
  return alignments;
};
