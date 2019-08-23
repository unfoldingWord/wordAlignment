import {combineReducers} from 'redux';
import alignments, * as fromAlignments from './alignments';
import checks, * as fromChecks from './checks';
import groupMenu, * as fromGroupMenu from "./groupMenu";

export default combineReducers({
  alignments,
  checks,
  groupMenu
});

/**
 * Returns the check data for a verse
 * @param state
 * @param check
 * @param chapter
 * @param verse
 * @returns {*}
 */
export const getVerseCheck = (state, check, chapter, verse) =>
  fromChecks.getVerseCheck(state.tool.checks, chapter, verse);

/**
 * Returns all the recorded instances of a check
 * @param state
 * @param {string} check - the check id
 * @returns {object} - a dictionary of chapters and verses that contain check data.
 */
export const getChecks = (state, check) =>
  fromChecks.getChecks(state.tool.checks, check);

/**
 * Returns alignments in the chapter
 * @param state
 * @param chapter
 * @return {{}}
 */
export const getChapterAlignments = (state, chapter) => {
  return fromAlignments.getChapterAlignments(state.tool.alignments, chapter);
};

/**
 * Checks if data for the chapter has been loaded
 * @param state
 * @param {number} chapter
 * @return {boolean}
 */
export const getIsChapterLoaded = (state, chapter) =>
  fromAlignments.getIsChapterLoaded(state.tool.alignments, chapter);

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
 * Returns rendered alignments for a verse
 * @param state
 * @param chapter
 * @param verse
 * @return {Array}
 */
export const getRenderedVerseAlignments = (state, chapter, verse) => {
  if (state.tool) {
    return fromAlignments.getRenderedVerseAlignments(state.tool.alignments,
      chapter,
      verse);
  } else {
    return [];
  }
};

/**
 * Returns an array of target tokens that have been aligned to the verse
 * @param state
 * @param {number} chapter
 * @param {number} verse
 * @return {Array}
 */
export const getVerseAlignedTargetTokens = (state, chapter, verse) =>
  fromAlignments.getVerseAlignedTargetTokens(state.tool.alignments, chapter,
    verse);

/**
 * Returns an array of target tokens that have been visually aligned to the verse
 * @param state
 * @param chapter
 * @param verse
 * @return {Array}
 */
export const getRenderedVerseAlignedTargetTokens = (state, chapter, verse) =>
  fromAlignments.getRenderedVerseAlignedTargetTokens(state.tool.alignments,
    chapter, verse);

/**
 * Checks if the verses being aligned are valid
 * @param state
 * @param {string} targetText - the target text used as a baseline
 * @param {string} sourceText - the source text used as a baseline
 * @param {number} chapter
 * @param {number} verse
 * @return {*}
 */
export const getIsVerseAlignmentsValid = (
  state, chapter, verse, sourceText, targetText) =>
  fromAlignments.getIsVerseValid(state.tool.alignments, chapter, verse,
    sourceText, targetText);

/**
 * Returns the chapter alignments in the legacy format
 * @param state
 * @param chapter
 */
export const getLegacyChapterAlignments = (state, chapter) =>
  fromAlignments.getLegacyChapterAlignments(state.tool.alignments, chapter);

/**
 * Checks if a verse has been fully aligned
 * @param state
 * @param chapter
 * @param verse
 * @return {*}
 */
export const getIsVerseAligned = (state, chapter, verse) =>
  fromAlignments.getIsVerseAligned(state.tool.alignments, chapter, verse);

/**
 * Checks if the verse has any rendered (display to the user) alignment suggestions.
 * @param state
 * @param {number} chapter
 * @param {number} verse
 * @return {boolean}
 */
export const getVerseHasRenderedSuggestions = (state, chapter, verse) =>
  fromAlignments.getVerseHasRenderedSuggestions(state.tool.alignments, chapter,
    verse);

/**
 * get the group menu data for chapter:verse.
 * @param state
 * @param {string|number} chapter
 * @param {string|number} verse
 * @returns {Object} - item in group menu
 */
export const getGroupMenuItem = (state, chapter, verse) =>
  fromGroupMenu.getMenuItem(state.tool.groupMenu, chapter, verse);
