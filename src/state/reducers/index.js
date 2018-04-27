import {combineReducers} from 'redux';
import alignments, * as fromAlignments from './alignments';
import tokens, * as fromTokens from './tokens';

export default combineReducers({
  alignments,
  tokens
});

/**
 * Returns alignments for a chapter
 * @param {object} state - the redux state
 * @param {number} chapter - the chapter for which alignments will be returned
 * @return {*}
 */
export const getChapterAlignments = (state, chapter) => {
  console.log('get alignments', state);
  return fromAlignments.getChapterAlignments(state.tool.alignments, chapter);
};

/**
 * Returns alignments for a verse
 * @param state
 * @param chapter
 * @param verse
 * @return {*}
 */
export const getVerseAlignments = (state, chapter, verse) =>
  fromAlignments.getVerseAlignments(state.tool.alignments, chapter, verse);

/**
 * Returns an array of tokens that have been aligned to the verse
 * @param state
 * @param {number} chapter
 * @param {number} verse
 * @return {Array}
 */
export const getAlignedVerseTokens = (state, chapter, verse) =>
  fromAlignments.getAlignedVerseTokens(state.tool.alignments, chapter, verse);

/**
 * Returns the source tokens for a verse
 * @param state
 * @param {number} chapter
 * @param {number} verse
 * @return {object[]}
 */
export const getVerseSourceTokens = (state, chapter, verse) =>
  fromTokens.getVerseSourceTokens(state.tool.tokens, chapter, verse);

/**
 * Returns the source tokens for a chapter.
 *
 * @param state
 * @param {number} chapter
 * @return {{}} - a dictionary of verse source tokens
 */
export const getChapterSourceTokens = (state, chapter) =>
  fromTokens.getChapterSourceTokens(state.tool.tokens, chapter);
