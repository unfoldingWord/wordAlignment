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
import verse, * as fromVerse from './verse';

/**
 * Reduces the chapter alignment state
 * @param state
 * @param action
 * @return {*}
 */
const chapter = (state = {}, action) => {
  switch (action.type) {
    case INSERT_RENDERED_ALIGNMENT:
    case UNALIGN_RENDERED_SOURCE_TOKEN:
    case ALIGN_RENDERED_SOURCE_TOKEN:
    case UNALIGN_RENDERED_TARGET_TOKEN:
    case SET_TARGET_TOKENS:
    case SET_SOURCE_TOKENS:
    case REMOVE_TOKEN_SUGGESTION:
    case ACCEPT_TOKEN_SUGGESTION:
    case RESET_VERSE_ALIGNMENT_SUGGESTIONS:
    case ACCEPT_VERSE_ALIGNMENT_SUGGESTIONS:
    case REPAIR_VERSE_ALIGNMENTS:
    case SET_ALIGNMENT_SUGGESTIONS:
    case RESET_VERSE_ALIGNMENTS:
    case ALIGN_RENDERED_TARGET_TOKEN: {
      if(isNaN(action.verse)) {
        throw new Error('Alignment verse must be a number');
      }
      const vid = action.verse + '';
      return {
        ...state,
        [vid]: verse(state[vid], action)
      };
    }
    case SET_CHAPTER_ALIGNMENTS: {
      const verses = {};
      for (const vid of Object.keys(action.alignments)) {
        verses[vid] = verse(state[vid], {...action, verse: vid});
      }
      return verses;
    }
    default:
      return state;
  }
};

export default chapter;

/**
 * Checks if the verses being aligned are valid
 * @param state
 * @param {number} verse
 * @param {string} sourceText - the source text used as a baseline
 * @param {string} targetText - the target text used as a baseline
 * @return {boolean}
 */
export const getIsVerseValid = (
  state, verse, sourceText, targetText) => {
  const verseId = verse + '';
  if (verseId in state) {
    return fromVerse.getIsValid(state[verseId], sourceText, targetText);
  } else {
    return false;
  }
};

/**
 * Checks if a verse has been fully aligned
 * @param state
 * @param verse
 */
export const getIsVerseAligned = (state, verse) => {
  const verseId = verse + '';
  if (verseId in state) {
    return fromVerse.getIsAligned(state[verseId]);
  } else {
    return false;
  }
};

/**
 * Returns an array of alignments for the verse
 * @param state
 * @param {number} verse
 * @return {Array}
 */
export const getVerseAlignments = (state, verse) => {
  const verseId = verse + '';
  if (verseId in state) {
    return fromVerse.getAlignments(state[verseId]);
  } else {
    return [];
  }
};

/**
 * Returns an array of rendered alignments for the verse
 * @param state
 * @param {number} verse
 * @return {Array}
 */
export const getRenderedVerseAlignments = (state, verse) => {
  const verseId = verse + '';
  if (verseId in state) {
    return fromVerse.getRenderedAlignments(state[verseId]);
  } else {
    return [];
  }
};

/**
 * Returns tokens that have been aligned to the verse
 * @param state
 * @param {number} verse
 * @return {Token[]}
 */
export const getVerseAlignedTargetTokens = (state, verse) => {
  const verseId = verse + '';
  if (verseId in state) {
    return fromVerse.getAlignedTargetTokens(state[verseId]);
  } else {
    return [];
  }
};

/**
 * Returns the tokens that have been visually aligned to the verse
 * @param state
 * @param verse
 * @return {Array}
 */
export const getRenderedVerseAlignedTargetTokens = (state, verse) => {
  const verseId = verse + '';
  if (verseId in state) {
    return fromVerse.getRenderedAlignedTargetTokens(state[verseId]);
  } else {
    return [];
  }
};

/**
 * Returns the chapter alignments in the legacy format
 * @param state
 */
export const getLegacyAlignments = state => {
  const alignments = {};
  for (const verseId of Object.keys(state)) {
    alignments[verseId] = fromVerse.getLegacyAlignments(state[verseId]);
  }
  return alignments;
};

/**
 * Checks if the verse has any rendered (visible to the user) alignment suggestions
 * @param state
 * @param {number} verse
 * @return {boolean}
 */
export const getVerseHasRenderedSuggestions = (state, verse) => {
  const verseId = verse + '';
  if (state && verseId in state) {
    return fromVerse.getVerseHasRenderedSuggestions(state[verseId]);
  } else {
    return false;
  }
};
