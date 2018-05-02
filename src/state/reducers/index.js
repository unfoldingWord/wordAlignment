import {combineReducers} from 'redux';
import alignments, * as fromAlignments from './alignments';

export default combineReducers({
  alignments
});

/**
 * Returns alignments for a chapter
 * @param {object} state - the redux state
 * @param {number} chapter - the chapter for which alignments will be returned
 * @return {*}
 */
export const getChapterAlignments = (state, chapter) => {
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
  fromAlignments.getAlignedVerseTargetTokens(state.tool.alignments, chapter, verse);

/**
 * Checks if a verse is invalid
 * @param state
 * @param {string} targetVerseText
 * @param {string} sourceVerseText
 * @param {number} chapter
 * @param {number} verse
 * @return {*}
 */
export const getIsVerseInvalid = (state, chapter, verse, sourceVerseText, targetVerseText) =>
  fromAlignments.getIsVerseInvalid(state.tool.alignments, chapter, verse, sourceVerseText, targetVerseText);
