import chapter, * as fromChapter from './chapter';

import {
  ALIGN_SOURCE_TOKEN,
  ALIGN_TARGET_TOKEN,
  CLEAR_STATE,
  INSERT_ALIGNMENT,
  REPAIR_VERSE_ALIGNMENTS,
  RESET_VERSE_ALIGNMENTS,
  SET_CHAPTER_ALIGNMENTS,
  SET_SOURCE_TOKENS,
  SET_TARGET_TOKENS,
  UNALIGN_SOURCE_TOKEN,
  UNALIGN_TARGET_TOKEN
} from '../../actions/actionTypes';

/**
 * Compares two numbers for sorting
 * @param {number} a
 * @param {number} b
 * @return {number}
 */
export const numberComparator = (a, b) => a - b;

/**
 * Represents the alignment data.
 *
 * @param state
 * @param action
 * @return {*}
 */
const alignments = (state = {}, action) => {
  switch (action.type) {
    case INSERT_ALIGNMENT:
    case SET_CHAPTER_ALIGNMENTS:
    case UNALIGN_SOURCE_TOKEN:
    case SET_TARGET_TOKENS:
    case SET_SOURCE_TOKENS:
    case ALIGN_SOURCE_TOKEN:
    case RESET_VERSE_ALIGNMENTS:
    case UNALIGN_TARGET_TOKEN:
    case REPAIR_VERSE_ALIGNMENTS:
    case ALIGN_TARGET_TOKEN: {
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
 * Returns tokens that have been aligned to the verse
 * @param state
 * @param chapter
 * @param verse
 * @return {Token[]}
 */
export const getVerseAlignedTargetTokens = (state, chapter, verse) => {
  const verseAlignments = getVerseAlignments(state, chapter, verse);
  const tokens = [];
  for (const alignment of verseAlignments) {
    for (const token of alignment.targetNgram) {
      tokens.push(token);
    }
  }
  return tokens;
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
