import {Token} from 'wordmap-lexer';
import _ from 'lodash';
import {insertSourceToken} from '../../actions';
import {
  ACCEPT_TOKEN_SUGGESTION,
  ACCEPT_VERSE_ALIGNMENT_SUGGESTIONS,
  ALIGN_RENDERED_SOURCE_TOKEN,
  ALIGN_RENDERED_TARGET_TOKEN,
  INSERT_RENDERED_ALIGNMENT,
  REMOVE_TOKEN_SUGGESTION,
  REPAIR_VERSE_ALIGNMENTS,
  RESET_VERSE_ALIGNMENT_SUGGESTIONS,
  RESET_VERSE_ALIGNMENTS,
  SET_ALIGNMENT_SUGGESTIONS,
  SET_CHAPTER_ALIGNMENTS,
  SET_SOURCE_TOKENS,
  SET_TARGET_TOKENS,
  UNALIGN_RENDERED_SOURCE_TOKEN,
  UNALIGN_RENDERED_TARGET_TOKEN
} from '../../actions/actionTypes';
import renderedAlignmentsReducer, * as fromRenderedAlignments
  from './renderedAlignments';
import renderedAlignmentReducer, * as fromRenderedAlignment
  from './renderedAlignment';
import alignmentReducer, * as fromAlignment from './alignment';
import suggestionReducer from './suggestion';
import compile from './compile';
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
 * This usually ignores the token's position within the sentence and allows us
 * to evaluate where tokens have been moved to within the sentence.
 * A negative position indicates the token was removed.
 * @param {Token} t - the token to search for
 * @param {Token[]} tokens - an array of tokens comprising the new sentence.
 * @param {number} [previouslyMappedPos=-1] - the position of the previously mapped token
 * @param {[]} [mappedPositions=[]] - positions that have already been mapped
 * @return {number} the index of the token within the new sentence
 */
const findIndexOfOccurrence = (t, tokens, previouslyMappedPos = -1, mappedPositions=[]) => {
  for (let i = 0; i < tokens.length; i++) {
    if (t.equals(tokens[i]) || isSameOccurrence(t, tokens[i])) {
      return i;
    } else if (previouslyMappedPos >= 0
      && previouslyMappedPos === i - 1
      && mappedPositions.indexOf(i) === -1
      && t.looksLike(tokens[i])) {
      // TRICKY: we allow for a loose match if
      // 1) the position has not already been assigned and
      // 2) the position is adjacent to the previously assigned position
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
    case UNALIGN_RENDERED_SOURCE_TOKEN:
    case ALIGN_RENDERED_SOURCE_TOKEN:
    case UNALIGN_RENDERED_TARGET_TOKEN:
    case ACCEPT_TOKEN_SUGGESTION:
    case ALIGN_RENDERED_TARGET_TOKEN: {
      const newSuggestions = [...state.suggestions];
      const newRenderedAlignments = _.cloneDeep(state.renderedAlignments);

      // update rendered alignment
      const renderedAlignment = state.renderedAlignments[action.index];
      newRenderedAlignments[action.index] = renderedAlignmentReducer(
        renderedAlignment, action);

      // TRICKY: remove empty rendered alignments
      let renderIsEmpty = newRenderedAlignments[action.index].sourceNgram.length ===
        0;
      if (renderIsEmpty) {
        newRenderedAlignments.splice(action.index, 1);
      }
      // compile alignments
      const {alignments, indices} = compile(newRenderedAlignments,
        state.alignments);

      // update index mapping
      for (let i = 0; i < newRenderedAlignments.length; i++) {
        newRenderedAlignments[i].alignments = indices[i].sort(
          numberComparator);
      }

      // update new alignment
      if (!renderIsEmpty) {
        const newAlignmentIndex = newRenderedAlignments[action.index].alignments[0];
        alignments[newAlignmentIndex] = alignmentReducer(
          alignments[newAlignmentIndex], action);
      }

      // update suggestion
      if ('suggestion' in renderedAlignment) {
        newSuggestions[renderedAlignment.suggestion] = suggestionReducer(
          state.suggestions[renderedAlignment.suggestion], action);
      }

      return {
        ...state,
        suggestions: newSuggestions,
        alignments,
        renderedAlignments: renderedAlignmentsReducer(newRenderedAlignments,
          action, alignments, newSuggestions, state.sourceTokens.length)//newRenderedAlignments
      };
    }
    case ACCEPT_VERSE_ALIGNMENT_SUGGESTIONS: {
      const renderedAlignments = [];
      for (let i = 0; i < state.renderedAlignments.length; i++) {
        const currentRender = state.renderedAlignments[i];
        renderedAlignments.push(
          renderedAlignmentReducer(currentRender, action));
      }
      const {alignments} = compile(renderedAlignments,
        state.alignments);
      return {
        ...state,
        suggestions: [],
        alignments,
        renderedAlignments: renderedAlignmentsReducer(renderedAlignments,
          action, alignments, [], state.sourceTokens.length)
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
        suggestions: [],
        renderedAlignments: renderedAlignmentsReducer(state.renderedAlignments,
          action, state.alignments)
      };
    case REMOVE_TOKEN_SUGGESTION: {
      const renderedAlignment = state.renderedAlignments[action.index];
      const suggestionIndex = renderedAlignment.suggestion;
      const suggestions = [
        ...state.suggestions
      ];
      suggestions[suggestionIndex] = suggestionReducer(
        state.suggestions[suggestionIndex], action);
      return {
        ...state,
        suggestions,
        renderedAlignments: renderedAlignmentsReducer(state.renderedAlignments,
          action, state.alignments, suggestions, state.sourceTokens.length)
      };
    }
    case RESET_VERSE_ALIGNMENTS: {
      const alignments = [];
      for (let i = 0; i < state.sourceTokens.length; i++) {
        alignments.push(alignmentReducer(undefined, {...action, position: i}));
      }
      return {
        ...state,
        alignments,
        suggestions: [],
        renderedAlignments: renderedAlignmentsReducer(state.renderedAlignments,
          action, alignments)
      };
    }
    case INSERT_RENDERED_ALIGNMENT: {
      // add alignment
      const a = alignmentReducer(undefined, action);
      const alignments = [
        ...state.alignments,
        a
      ].sort(alignmentComparator);

      return {
        ...state,
        renderedAlignments: renderedAlignmentsReducer(state.renderedAlignments, action, alignments, state.suggestions, state.sourceTokens.length),
        alignments
      };
    }
    case SET_SOURCE_TOKENS: {
      // NOTE: this is performed when the verse is loaded so there is no need to render anything.
      return {
        sourceTokens: action.tokens.map(formatSourceToken),
        targetTokens: [...state.targetTokens],
        alignments: [...state.alignments]
      };
    }
    case SET_TARGET_TOKENS: {
      // NOTE: this is performed when the verse is loaded so there is no need to render anything.
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
        let previousPos = -1;
        if (targetTokenPositionMap.length > 0) {
          const lastIndex = targetTokenPositionMap.length - 1;
          previousPos = targetTokenPositionMap[lastIndex];
        }
        const t = new Token(state.targetTokens[i]);
        const newPos = findIndexOfOccurrence(
          t,
          action.targetTokens,
          previousPos,
          Object.values(targetTokenPositionMap)
          );
        targetTokenPositionMap.push(newPos);
      }

      // repair alignments
      let fixedAlignments = state.alignments.map(
        a => alignmentReducer(a, {
          ...action,
          sourceTokenPositionMap,
          targetTokenPositionMap
        }));

      // remove duplicate tokens
      const usedSourceTokens = [];
      const usedTargetTokens = [];
      fixedAlignments = fixedAlignments.map(a => {
        // source
        const locallyUsedSourceTokens = [];
        for (const t of a.sourceNgram) {
          if (usedSourceTokens.indexOf(t) >= 0 ||
            locallyUsedSourceTokens.indexOf(t) >= 0) {
            return null;
          } else {
            locallyUsedSourceTokens.push(t);
          }
        }
        // target
        for (const t of a.targetNgram) {
          if (usedTargetTokens.indexOf(t) >= 0) {
            _.pullAt(a.targetNgram, a.targetNgram.indexOf(t));
          } else {
            usedTargetTokens.push(t);
          }
        }
        // find used source tokens
        usedSourceTokens.push.apply(usedSourceTokens, a.sourceNgram);
        return a;
      });
      fixedAlignments = _.compact(fixedAlignments);

      // insert missing source tokens
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
  const textIsValid = sourceText === sourceBaselineText && targetText ===
    targetBaselineText;
  return textIsValid && getAreAlignmentsValid(state);
};

/**
 * Check if the verse alignments are valid.
 * @param state
 * @return {boolean}
 */
export const getAreAlignmentsValid = state => {
  const usedSourceTokens = [];
  const usedTargetTokens = [];
  for (const a of state.alignments) {
    // validate tokens are unique
    for (const t of a.sourceNgram) {
      if (usedSourceTokens.indexOf(t) >= 0) {
        return false;
      } else {
        usedSourceTokens.push(t);
      }
    }
    for (const t of a.targetNgram) {
      if (usedTargetTokens.indexOf(t) >= 0) {
        return false;
      } else {
        usedTargetTokens.push(t);
      }
    }
  }
  return usedSourceTokens.length === state.sourceTokens.length;
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
 * Returns tokens that have been visually aligned to the verse.
 * @param state
 * @return {Array}
 */
export const getRenderedAlignedTargetTokens = state => {
  const alignments = getRenderedAlignments(state);
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
 * Checks if the verse has any rendered (visible to the user) alignment suggestions
 * @param state
 * @return {boolean}
 */
export const getVerseHasRenderedSuggestions = state => {
  if (state.renderedAlignments.length === state.alignments.length) {
    for (let i = 0; i < state.alignments.length; i++) {
      const rendered = fromRenderedAlignment.getAlignment(
        state.renderedAlignments[i]);
      const alignment = state.alignments[i];
      if(!_.isEqual(rendered, alignment)) {
        return true;
      }
    }
    return false;
  }
  return true;
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
  const usedTargetTokens = [];
  for (const a of alignments) {
    usedTargetTokens.push.apply(usedTargetTokens, a.targetNgram);
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
