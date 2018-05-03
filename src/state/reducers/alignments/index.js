import Token from 'word-map/structures/Token';
import chapter, * as fromChapter from './chapter';

import {
  ALIGN_SOURCE_TOKEN,
  ALIGN_TARGET_TOKEN,
  CLEAR_STATE,
  INSERT_ALIGNMENT,
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
    case UNALIGN_TARGET_TOKEN:
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
 * Returns alignments for an entire chapter
 * @param state
 * @param {number} chapter - the chapter for which to return alignments
 * @return {{}}
 */
export const getChapterAlignments = (state, chapter) => {
  const chapterId = chapter + '';
  if (chapterId in state) {
    const alignments = {};
    for (const verseId of Object.keys(state[chapterId])) {
      alignments[verseId] = getVerseAlignments(state, chapterId, verseId);
    }
    return alignments;
  } else {
    return {};
  }
};

/**
 * Returns alignments for a single verse
 * @param state
 * @param {number} chapterNum
 * @param {number} verseNum
 * @return {[]}
 */
export const getVerseAlignments = (state, chapterNum, verseNum) => {
  const chapterId = chapterNum + '';
  const verseId = verseNum + '';
  if (chapterId in state) {
    const chapter = state[chapterId];
    if (verseId in chapter) {
      const verse = chapter[verseId];

      // join tokens to alignments
      const alignments = [];
      for (const a of verse.alignments) {
        const sourceNgram = [
          ...a.sourceNgram.map(pos => new Token(verse.source.tokens[pos]))
        ];
        const targetNgram = [
          ...a.targetNgram.map(pos => new Token(verse.target.tokens[pos]))
        ];
        alignments.push({
          sourceNgram,
          targetNgram
        });
      }
      return alignments;
    }
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
export const getAlignedVerseTargetTokens = (state, chapter, verse) => {
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
 * Returns the source tokens being aligned for a verse
 * @param state
 * @param {number} chapter
 * @param {number} verse
 * @return {Token[]}
 */
export const getVerseSourceTokens = (state, chapter, verse) => {
  const chapterId = chapter + '';
  const verseId = verse + '';
  if (chapterId in state) {
    if (verseId in state[chapterId]) {
      return state[chapterId][verseId].source.tokens.map(t => new Token(t));
    }
  }
  return [];
};

/**
 * Returns the target tokens being aligned for a verse
 * @param state
 * @param {number} chapter
 * @param {number} verse
 * @return {Token[]}
 */
export const getVerseTargetTokens = (state, chapter, verse) => {
  const chapterId = chapter + '';
  const verseId = verse + '';
  if (chapterId in state) {
    if (verseId in state[chapterId]) {
      return state[chapterId][verseId].target.tokens.map(t => new Token(t));
    }
  }
  return [];
};

/**
 * Returns the source verse text being aligned
 * @param state
 * @param {number} chapter
 * @param {number} verse
 * @return {string}
 */
export const getVerseSourceText = (state, chapter, verse) => {
  return getVerseSourceTokens(state, chapter, verse).join(' ');
};

/**
 * Returns the target verse text being aligned
 * @param state
 * @param {number} chapter
 * @param {number} verse
 * @return {string}
 */
export const getVerseTargetText = (state, chapter, verse) => {
  return getVerseTargetTokens(state, chapter, verse).join(' ');
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
  if (chapterId in state) {
    return fromChapter.getIsVerseValid(state[chapterId], verse, sourceText,
      targetText);
  } else {
    return false;
  }
};
