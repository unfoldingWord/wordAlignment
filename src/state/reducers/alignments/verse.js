import {
  ALIGN_RENDERED_SOURCE_TOKEN,
  ALIGN_RENDERED_TARGET_TOKEN,
  INSERT_RENDERED_ALIGNMENT,
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
import alignmentReducer, * as fromAlignment from './alignment';
import Token from 'word-map/structures/Token';
import {numberComparator} from './index';
import {insertSourceToken} from '../../actions';
import renderedAlignmentsReducer, * as fromRenderedAlignments
  from './renderedAlignments';
import renderedAlignmentReducer from './renderedAlignment';
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
    case UNALIGN_RENDERED_SOURCE_TOKEN:
    case ALIGN_RENDERED_SOURCE_TOKEN:
    case UNALIGN_RENDERED_TARGET_TOKEN:
    case ALIGN_RENDERED_TARGET_TOKEN: {
      // let newAlignments = _.cloneDeep(state.alignments);
      const newSuggestions = _.cloneDeep(state.suggestions);
      const newRenderedAlignments = _.cloneDeep(state.renderedAlignments);

      // update rendered alignment
      const renderedAlignment = state.renderedAlignments[action.index];
      const newRenderedAlignment = renderedAlignmentReducer(renderedAlignment,
        action);
      newRenderedAlignments[action.index] = newRenderedAlignment;

      // propagate alignment index changes to other rendered alignments.
      // for(let i = action.index + 1; i < newRenderedAlignments.length; i ++) {
      //   const shiftedAlignment = newRenderedAlignments[i];
      //   shiftedAlignment.alignments = shiftedAlignment.alignments.map(a => a - 1);
      //   newRenderedAlignments[i] = shiftedAlignment;
      // }

      // TRICKY: remove empty rendered alignments
      if (newRenderedAlignments[action.index].sourceNgram.length === 0) {
        newRenderedAlignments.splice(action.index, 1);
      }
      newRenderedAlignments.sort(alignmentComparator);

      // remove affected alignments
      // for (const index of renderedAlignment.alignments) {
      //   newAlignments[index] = null;
      // }
      // newAlignments = _.compact(newAlignments);

      // persist to alignments (if it wasn't removed)
      // if (newRenderedAlignment.sourceNgram.length > 0) {
      //   const newAlignment = {
      //     sourceNgram: newRenderedAlignment.sourceNgram,
      //       targetNgram: newRenderedAlignment.targetNgram
      //   };
      //   newAlignments.push(newAlignment);
      //   newAlignments.sort(alignmentComparator);
      // }

      // compile alignments
      const {alignments, indices: indices} = compile(newRenderedAlignments,
        state.alignments);

      // update index mapping
      for (let i = 0; i < newRenderedAlignments.length; i++) {
        newRenderedAlignments[i].alignments = indices[i].sort(
          numberComparator);
      }

      // clear suggestion
      if ('suggestion' in renderedAlignment) {
        const suggestion = _.cloneDeep(
          newSuggestions[renderedAlignment.suggestion]);
        suggestion.targetNgram = [];
        newSuggestions[renderedAlignment.suggestion] = suggestion;
      }

      return {
        ...state,
        suggestions: newSuggestions,
        alignments,
        renderedAlignments: newRenderedAlignments
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

      // render alignment
      const index = alignments.indexOf(a);
      const newRenderedAlignment = renderedAlignmentReducer(undefined, action,
        index);
      const renderedAlignments = [
        ...state.renderedAlignments,
        newRenderedAlignment
      ].sort(alignmentComparator);

      return {
        ...state,
        renderedAlignments,
        alignments
      };
    }
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

      // repair alignments
      let fixedAlignments = state.alignments.map(
        a => alignmentReducer(a, {
          ...action,
          sourceTokenPositionMap,
          targetTokenPositionMap
        }));

      // remove duplicate tokens
      let usedSourceTokens = [];
      let usedTargetTokens = [];
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
        usedSourceTokens = usedSourceTokens.concat(a.sourceNgram);
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

// TODO: change these to memoized selectors

/**
 * Compiles rendered alignments to standard alignments
 * @param rendered - an array of rendered alignments
 * @param alignments - an array of matching alignments
 * @return an array of newly compiled alignments
 */
export const compile = (rendered, alignments) => {
  const compiledAlignments = [];
  const compiledIndices = {};
  const processedAlignments = [];
  const approvedRenders = [];
  for (let rIndex = 0; rIndex < rendered.length; rIndex++) {
    const r = rendered[rIndex];
    for (const aIndex of r.alignments) {
      const alignment = alignments[aIndex];
      const aID = alignment.sourceNgram.join('');
      if (!compiledIndices[rIndex]) {
        compiledIndices[rIndex] = [];
      }

      const isSuggestion = r.suggestion !== undefined;
      const alreadyCompiled = processedAlignments.indexOf(aID) >= 0;

      // identify fully accepted rendered alignments
      if (!isSuggestion) {
        approvedRenders.push(aID);
      }

      const isApproved = approvedRenders.indexOf(aID) >= 0;

      // update index mapping
      if (alreadyCompiled && !isApproved) {
        compiledIndices[rIndex].push(processedAlignments.indexOf(aID));
        // TRICKY: suggested alignment splits will cause the alignment to appear multiple times
        continue;
      } else {
        compiledIndices[rIndex].push(processedAlignments.length);
        processedAlignments.push(aID);
      }

      // compile
      if (!isApproved) {
        // compile un-approved renders
        compiledAlignments.push(_.cloneDeep(alignment));
      } else if (isSuggestion) {
        // compile partially approved suggestions (splits)
        compiledAlignments.push({
          sourceNgram: [...r.sourceNgram],
          targetNgram: []
        });
      } else {
        // compile approved suggestions
        compiledAlignments.push({
          sourceNgram: [...r.sourceNgram],
          targetNgram: [...r.targetNgram]
        });
        // TRICKY: discard remaining alignments
        break;
      }
    }
  }
  return {
    alignments: compiledAlignments,
    indices: compiledIndices
  };
};

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
