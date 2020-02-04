import { getGroupMenuItem, getIsVerseAligned } from '../reducers';
import * as CheckDataHelper from '../../utils/CheckDataHelper';
import {
  BOOKMARKED_KEY,
  COMMENT_KEY,
  EDITED_KEY,
  FINISHED_KEY,
  INVALID_KEY,
  UNALIGNED_KEY,
} from '../reducers/GroupMenu';
import {
  CLEAR_GROUP_MENU,
  GROUP_MENU_EXPAND_SUBMENU,
  GROUP_MENU_SET_FILTER,
  SET_GROUP_MENU_FINISHED,
  SET_GROUP_MENU_INVALID,
  SET_GROUP_MENU_UNALIGNED,
  SET_GROUP_MENU_EDITED,
  SET_GROUP_MENU_BOOKMARKED,
  SET_GROUP_MENU_COMMENT,
  SET_GROUP_MENU_STATE,
} from './actionTypes';
import { changeCurrentContextId } from './contextIdActions';

/**
 * empties the group menu
 * @returns {Object}
 */
export const clearGroupMenu = () => ({ type: CLEAR_GROUP_MENU });

/**
 * load items that may have been changed externally
 * @param {Object} api - tool api for system calls
 * @param {number|string} chapter
 * @param {number|string} verse
 * @param {Boolean} force - if true, reload data, otherwise data will only be loaded if no current data for verse
 * @return {Object}
 */
export const loadGroupMenuItem = (api, chapter, verse, force = false, contextId, projectSaveLocation) => ((dispatch, getState) => {
  try {
    const state = getState();

    // reload verse data if force or if no data found for this verse
    if (force || !getGroupMenuItem(state, chapter, verse)) {
      const itemState = {};
      itemState[FINISHED_KEY] = CheckDataHelper.getIsVerseFinished(api, chapter, verse);
      itemState[INVALID_KEY] = CheckDataHelper.getIsVerseInvalid(api, chapter, verse);
      itemState[UNALIGNED_KEY] = !getIsVerseAligned(state, chapter, verse);
      itemState[EDITED_KEY] = CheckDataHelper.getIsVerseEdited(api, chapter, verse);
      itemState[BOOKMARKED_KEY] = CheckDataHelper.getVerseBookmarked(contextId, projectSaveLocation);
      itemState[COMMENT_KEY] = CheckDataHelper.getVerseComment(contextId, projectSaveLocation);
      dispatch(setGroupMenuItemState(chapter, verse, itemState));
    }
  } catch (error) {
    console.error('loadGroupMenuItem() error');
    console.error(error);
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
  type: SET_GROUP_MENU_FINISHED,
  chapter,
  verse,
  value,
});

/**
 * updates the invalid state for group menu item.
 * @param {number|string} chapter - the chapter number
 * @param {number|string} verse - the verse number
 * @param {*} value - the new value for invalid state
 * @returns {Object}
 */
export const setGroupMenuItemInvalid = (chapter, verse, value) => ({
  type: SET_GROUP_MENU_INVALID,
  chapter,
  verse,
  value,
});

/**
 * updates the Unaligned state for group menu item.
 * @param {number|string} chapter - the chapter number
 * @param {number|string} verse - the verse number
 * @param {*} value - the new value for Unaligned state
 * @returns {Object}
 */
export const setGroupMenuItemUnaligned = (chapter, verse, value) => ({
  type: SET_GROUP_MENU_UNALIGNED,
  chapter,
  verse,
  value,
});

/**
 * updates the Edited state for group menu item.
 * @param {number|string} chapter - the chapter number
 * @param {number|string} verse - the verse number
 * @param {*} value - the new value for edited state
 * @returns {Object}
 */
export const setGroupMenuItemEdited = (chapter, verse, value) => ({
  type: SET_GROUP_MENU_EDITED,
  chapter,
  verse,
  value,
});

/**
 * updates the Bookmarked state for group menu item.
 * @param {number|string} chapter - the chapter number
 * @param {number|string} verse - the verse number
 * @param {Boolean} value - the new value for Bookmarked state
 * @returns {Object}
 */
export const setGroupMenuItemBookmarked = (chapter, verse, value) => ({
  type: SET_GROUP_MENU_BOOKMARKED,
  chapter,
  verse,
  value,
});

/**
 * updates the comment state for group menu item.
 * @param {number|string} chapter - the chapter number
 * @param {number|string} verse - the verse number
 * @param {string} value - the new value for comment
 * @returns {Object}
 */
export const setGroupMenuItemComment = (chapter, verse, value) => ({
  type: SET_GROUP_MENU_COMMENT,
  chapter,
  verse,
  value,
});

/**
 * updates the Edited state for new group menu item - to set multiple values
 * @param {number|string} chapter - the chapter number
 * @param {number|string} verse - the verse number
 * @param {Object} values - new state values for item
 * @returns {Object}
 */
export const setGroupMenuItemState = (chapter, verse, values) => ({
  type: SET_GROUP_MENU_STATE,
  chapter,
  verse,
  values,
});

/**
 * This action expands/collapses the submenu in the group menu
 * @param {bool} isSubMenuExpanded - true or false
 */
export const expandSubMenu = isSubMenuExpanded => ({
  type: GROUP_MENU_EXPAND_SUBMENU,
  isSubMenuExpanded,
});

/**
 * Changes the group in the group menu
 * @param {Object} contextId
 * @param {string} projectSaveLocation
 * @param {Object} userData
 * @param {string} gatewayLanguageCode
 * @param {string} gatewayLanguageQuote
 */
export const changeGroup = (projectSaveLocation, userData, gatewayLanguageCode, gatewayLanguageQuote) => dispatch => {
  dispatch(changeCurrentContextId(projectSaveLocation, userData, gatewayLanguageCode, gatewayLanguageQuote));
  dispatch(expandSubMenu(true));
};

/**
 * Sets filter for what items to show.
 * @param {string} name - name of filter to toggle.
 */
export const setFilter = (name, value) => ({
  type: GROUP_MENU_SET_FILTER,
  name,
  value,
});
