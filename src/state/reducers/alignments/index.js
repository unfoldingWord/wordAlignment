import chapter, * as fromChapter from './chapter';

import {
  SET_ALIGNMENT_SUGGESTIONS,
  ALIGN_SOURCE_TOKEN,
  ALIGN_TARGET_TOKEN,
  CLEAR_STATE,
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
    case RESET_VERSE_ALIGNMENT_SUGGESTIONS:
    case REPAIR_VERSE_ALIGNMENTS:
    case SET_ALIGNMENT_SUGGESTIONS:
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
 * Checks if the machine alignment is valid.
 * In particular the ensures the alignment does not conflict with a human alignment
 * @deprecated
 * @param state
 * @param {number} chapter
 * @param {number} verse
 * @param {object} machineAlignment
 * @return {*}
 */
export const getIsMachineAlignmentValid = (
  state, chapter, verse, machineAlignment) => {
  const chapterId = chapter + '';
  if (chapterId in state) {
    return fromChapter.getIsMachineAlignmentValid(state[chapterId], verse,
      machineAlignment);
  } else {
    return true;
  }
};

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
