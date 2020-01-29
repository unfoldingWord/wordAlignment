import {getGroupMenuItem, getIsVerseAligned} from "../reducers";
import {BOOKMARKED_KEY, COMMENT_KEY, EDITED_KEY, FINISHED_KEY, INVALID_KEY, UNALIGNED_KEY} from "../reducers/GroupMenu";
import * as CheckDataHelper from "../../utils/CheckDataHelper";
import * as types from "./actionTypes";

/**
 * empties the group menu
 * @returns {Object}
 */
export const clearGroupMenu = () => ({
  type: types.CLEAR_GROUP_MENU
});

/**
 * load items that may have been changed externally
 * @param {Object} api - tool api for system calls
 * @param {number|string} chapter
 * @param {number|string} verse
 * @param {Boolean} force - if true, reload data, otherwise data will only be loaded if no current data for verse
 * @return {Object}
 */
export const loadGroupMenuItem = (api, chapter, verse, force = false) => ((dispatch, getState) => {
  const state = getState();
  // reload verse data if force or if no data found for this verse
  if (force || !getGroupMenuItem(state, chapter, verse)) {
    const itemState = {};
    itemState[FINISHED_KEY] = CheckDataHelper.getIsVerseFinished(api, chapter, verse);
    itemState[INVALID_KEY] = CheckDataHelper.getIsVerseInvalid(api, chapter, verse);
    itemState[UNALIGNED_KEY] = !getIsVerseAligned(state, chapter, verse);
    itemState[EDITED_KEY] = CheckDataHelper.getIsVerseEdited(api, chapter, verse);
    itemState[BOOKMARKED_KEY] = CheckDataHelper.getVerseBookmarked(api, chapter, verse);
    itemState[COMMENT_KEY] = CheckDataHelper.getVerseComment(api, chapter, verse);
    dispatch(setGroupMenuItemState(chapter, verse, itemState));
  }
});

/**
 * updates the finished state for new group menu item.
 * @param {number|string} chapter - the chapter number
 * @param {number|string} verse - the verse number
 * @param {*} value - the new value for finished state
 * @returns {Object}
 */
export const setGroupMenuItemFinished = (chapter, verse, value) => ({
  type: types.SET_GROUP_MENU_FINISHED,
  chapter,
  verse,
  value
});

/**
 * updates the invalid state for group menu item.
 * @param {number|string} chapter - the chapter number
 * @param {number|string} verse - the verse number
 * @param {*} value - the new value for invalid state
 * @returns {Object}
 */
export const setGroupMenuItemInvalid = (chapter, verse, value) => ({
  type: types.SET_GROUP_MENU_INVALID,
  chapter,
  verse,
  value
});

/**
 * updates the Unaligned state for group menu item.
 * @param {number|string} chapter - the chapter number
 * @param {number|string} verse - the verse number
 * @param {*} value - the new value for Unaligned state
 * @returns {Object}
 */
export const setGroupMenuItemUnaligned = (chapter, verse, value) => ({
  type: types.SET_GROUP_MENU_UNALIGNED,
  chapter,
  verse,
  value
});

/**
 * updates the Edited state for group menu item.
 * @param {number|string} chapter - the chapter number
 * @param {number|string} verse - the verse number
 * @param {*} value - the new value for edited state
 * @returns {Object}
 */
export const setGroupMenuItemEdited = (chapter, verse, value) => ({
  type: types.SET_GROUP_MENU_EDITED,
  chapter,
  verse,
  value
});

/**
 * updates the Bookmarked state for group menu item.
 * @param {number|string} chapter - the chapter number
 * @param {number|string} verse - the verse number
 * @param {Boolean} value - the new value for Bookmarked state
 * @returns {Object}
 */
export const setGroupMenuItemBookmarked = (chapter, verse, value) => ({
  type: types.SET_GROUP_MENU_BOOKMARKED,
  chapter,
  verse,
  value
});

/**
 * updates the comment state for group menu item.
 * @param {number|string} chapter - the chapter number
 * @param {number|string} verse - the verse number
 * @param {string} value - the new value for comment
 * @returns {Object}
 */
export const setGroupMenuItemComment = (chapter, verse, value) => ({
  type: types.SET_GROUP_MENU_COMMENT,
  chapter,
  verse,
  value
});

/**
 * updates the Edited state for new group menu item - to set multiple values
 * @param {number|string} chapter - the chapter number
 * @param {number|string} verse - the verse number
 * @param {Object} values - new state values for item
 * @returns {Object}
 */
export const setGroupMenuItemState = (chapter, verse, values) => ({
  type: types.SET_GROUP_MENU_STATE,
  chapter,
  verse,
  values
});
