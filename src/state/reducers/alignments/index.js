import {
  ACCEPT_TOKEN_SUGGESTION,
  ACCEPT_VERSE_ALIGNMENT_SUGGESTIONS,
  ALIGN_RENDERED_SOURCE_TOKEN,
  ALIGN_RENDERED_TARGET_TOKEN,
  CLEAR_STATE,
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
import chapter, * as fromChapter from './chapter';


/**
 * Compares two numbers for sorting
 * @param {number} a
 * @param {number} b
 * @return {number}
 */
export const numberComparator = (a, b) => a - b;

/**
 * Compares the sort field of two objects in sorting
 * @param {Object} a
 * @param {Object} b
 * @return {number}
 */
export const objectComparator = (a, b) => (a.sort - b.sort);

/**
 * Represents the alignment data.
 *
 * @param state
 * @param action
 * @return {*}
 */
const alignments = (state = {}, action) => {
  switch (action.type) {
    case INSERT_RENDERED_ALIGNMENT:
    case SET_CHAPTER_ALIGNMENTS:
    case UNALIGN_RENDERED_SOURCE_TOKEN:
    case SET_TARGET_TOKENS:
    case SET_SOURCE_TOKENS:
    case REMOVE_TOKEN_SUGGESTION:
    case ALIGN_RENDERED_SOURCE_TOKEN:
    case RESET_VERSE_ALIGNMENTS:
    case ACCEPT_TOKEN_SUGGESTION:
    case ACCEPT_VERSE_ALIGNMENT_SUGGESTIONS:
    case UNALIGN_RENDERED_TARGET_TOKEN:
    case RESET_VERSE_ALIGNMENT_SUGGESTIONS:
    case REPAIR_VERSE_ALIGNMENTS:
    case SET_ALIGNMENT_SUGGESTIONS:
    case ALIGN_RENDERED_TARGET_TOKEN: {
      if(isNaN(action.chapter)) {
        throw new Error('Alignment chapter must be a number');
      }
      const chapterId = action.chapter + '';
      return {
        ...state,
        [chapterId]: chapter(state[chapterId], action)
      };
    }
    case CLEAR_STATE:
      return {};
    default:
      return state;
  }
};

export default alignments;

/**
 * Returns verse alignments for an entire chapter
 * @param state
 * @param {number} chapter
 * @return {{}}
 */
export const getChapterAlignments = (state, chapter) => {
  const chapterId = chapter + '';
  if (chapterId in state) {
    const alignments = {};
    for (const verseId of Object.keys(state[chapterId])) {
      alignments[verseId] = getVerseAlignments(state, chapter,
        parseInt(verseId));
    }
    return alignments;
  } else {
    return {};
  }
};

/**
 * Returns alignments for a single verse
 * @param state
 * @param {number} chapter
 * @param {number} verse
 * @return {[]}
 */
export const getVerseAlignments = (state, chapter, verse) => {
  const chapterId = chapter + '';
  if (chapterId in state) {
    return fromChapter.getVerseAlignments(state[chapterId], verse);
  }
  return [];
};

/**
 * Returns rendered alignments for a single verse
 * @param state
 * @param chapter
 * @param verse
 * @return {Array}
 */
export const getRenderedVerseAlignments = (state, chapter, verse) => {
  const chapterId = chapter + '';
  if (chapterId in state) {
    return fromChapter.getRenderedVerseAlignments(state[chapterId], verse);
  }
  return [];
};

/**
 * Checks if data for the chapter has been loaded
 * @param state
 * @param {number} chapter
 * @return {boolean}
 */
export const getIsChapterLoaded = (state, chapter) => {
  const chapterId = chapter + '';
  if (chapterId in state) {
    // make sure we have some verses
    return Object.keys(state[chapterId]).length > 0;
  } else {
    return false;
  }
};

/**
 * Returns tokens that have been aligned to the verse
 * @param state
 * @param chapter
 * @param verse
 * @return {Token[]}
 */
export const getVerseAlignedTargetTokens = (state, chapter, verse) => {
  const chapterId = chapter + '';
  if (chapterId in state) {
    return fromChapter.getVerseAlignedTargetTokens(state[chapterId], verse);
  } else {
    return [];
  }
};

/**
 * Returns tokens that have been visually aligned to the verse
 * @param state
 * @param chapter
 * @param verse
 * @return {Array}
 */
export const getRenderedVerseAlignedTargetTokens = (state, chapter, verse) => {
  const chapterId = chapter + '';
  if (chapterId in state) {
    return fromChapter.getRenderedVerseAlignedTargetTokens(state[chapterId],
      verse);
  } else {
    return [];
  }
};

/**
 * Checks if the verses being aligned are valid
 * @param state
 * @param {number} chapter
 * @param {number} verse
 * @param {string} sourceText - the source text used as a baseline
 * @param {string} targetText - the target text used as a baseline
 * @return {boolean}
 */
export const getIsVerseValid = (
  state, chapter, verse, sourceText, targetText) => {
  const chapterId = chapter + '';
  if (state && chapterId in state) {
    return fromChapter.getIsVerseValid(state[chapterId], verse, sourceText,
      targetText);
  } else {
    return false;
  }
};

/**
 * Checks if a verse has been fully aligned
 * @param state
 * @param chapter
 * @param verse
 */
export const getIsVerseAligned = (state, chapter, verse) => {
  const chapterId = chapter + '';
  if (state && chapterId in state) {
    return fromChapter.getIsVerseAligned(state[chapterId], verse);
  } else {
    return false;
  }
};

/**
 * Returns the chapter alignments in the legacy format
 * @param state
 * @param {number} chapter
 */
export const getLegacyChapterAlignments = (state, chapter) => {
  const chapterId = chapter + '';
  if (state && chapterId in state) {
    return fromChapter.getLegacyAlignments(state[chapterId]);
  }
  return {};
};

/**
 * Checks if the verse has rendered (visible to the user) alignment suggestions
 * @param state
 * @param {number} chapter
 * @param {number} verse
 * @return {boolean}
 */
export const getVerseHasRenderedSuggestions = (state, chapter, verse) => {
  const chapterId = chapter + '';
  if (state && chapterId in state) {
    return fromChapter.getVerseHasRenderedSuggestions(state[chapterId], verse);
  } else {
    return false;
  }
};
