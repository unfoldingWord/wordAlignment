import {combineReducers} from 'redux';
import alignments, * as fromAlignments from './alignments';

export default combineReducers({
  alignments
});

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
 * Returns an array of target tokens that have been aligned to the verse
 * @param state
 * @param {number} chapter
 * @param {number} verse
 * @return {Array}
 */
export const getVerseAlignedTargetTokens = (state, chapter, verse) =>
  fromAlignments.getVerseAlignedTargetTokens(state.tool.alignments, chapter, verse);

/**
 * Checks if the verses being aligned are valid
 * @param state
 * @param {string} targetText - the target text used as a baseline
 * @param {string} sourceText - the source text used as a baseline
 * @param {number} chapter
 * @param {number} verse
 * @return {*}
 */
export const getIsVerseValid = (state, chapter, verse, sourceText, targetText) =>
  fromAlignments.getIsVerseValid(state.tool.alignments, chapter, verse, sourceText, targetText);
