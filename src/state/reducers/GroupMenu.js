// consts
import {
  CLEAR_GROUP_MENU,
  SET_GROUP_MENU_EDITED,
  SET_GROUP_MENU_FINISHED,
  SET_GROUP_MENU_INVALID,
  SET_GROUP_MENU_STATE,
  SET_GROUP_MENU_UNALIGNED,
  SET_GROUP_MENU_BOOKMARKED,
  SET_GROUP_MENU_COMMENT,
} from '../actions/actionTypes';
export const FINISHED_KEY = 'finished';
export const INVALID_KEY = 'invalid';
export const UNALIGNED_KEY = 'unaligned';
export const EDITED_KEY = 'edited';
export const BOOKMARKED_KEY = 'bookMarked';
export const COMMENT_KEY = 'comment';

/**
 * Reduces group data state
 * @param {Object} state
 * @param {Object} action
 * @returns {Object} new state
 */
const groupMenu = (state = {}, action) => {
  switch(action.type) {
    case CLEAR_GROUP_MENU: {
      return {};
    }
    case SET_GROUP_MENU_FINISHED: {
      return setItemValue(state, action, FINISHED_KEY, !!action.value);
    }
    case SET_GROUP_MENU_INVALID: {
      return setItemValue(state, action, INVALID_KEY, !!action.value);
    }
    case SET_GROUP_MENU_UNALIGNED: {
      return setItemValue(state, action, UNALIGNED_KEY, !!action.value);
    }
    case SET_GROUP_MENU_EDITED: {
      return setItemValue(state, action, EDITED_KEY, !!action.value);
    }
    case SET_GROUP_MENU_BOOKMARKED: {
      return setItemValue(state, action, BOOKMARKED_KEY, !!action.value);
    }
    case SET_GROUP_MENU_COMMENT: {
      return setItemValue(state, action, COMMENT_KEY, action.value);
    }
    case SET_GROUP_MENU_STATE: {
      const {chapter, verse, chapterData, itemData} = findMenuItem(state, action);
      const validObject = action.values && Object.keys(action.values).length;
      if (validObject && itemData) {
        const newItemData = {
          ...itemData,
          ...action.values
        };
        return setNewItemValue(state, chapterData, chapter, verse, newItemData);
      }
      return state; // on error return previous state
    }
    default:
      return state;
  }
};

/**
 * apply newItemData to state for chapter:verse
 * @param {Object} chapterData
 * @param {string} chapter
 * @param {string} verse
 * @param {Object} newItemData
 * @param {Object} state
 * @returns {Object} - new reducer state
 */
const setNewItemValue = (state, chapterData, chapter, verse, newItemData ) => {
  const newChapterData = {
    ...chapterData,
    [verse]: newItemData
  };
  return {
    ...state,
    [chapter]: newChapterData
  };
};

/**
 * finds the menu data for a verse in chapter, or creates new entry if not found
 * @param {Object} state
 * @param {Object} action - contains chapter, verse
 * @returns {*}
 */
const findMenuItem = (state, action) => {
  const chapter = normalizeRef(action.chapter);
  const verse = normalizeRef(action.verse);
  let chapterData = null;
  let itemData = null;
  if(chapter in state) {
    chapterData = state[chapter];
    if(verse in chapterData) {
      itemData = chapterData[verse];
    } else if (verse) {
      itemData = {};
      chapterData = {
        ...chapterData,
        [verse]: itemData
      };
    }
  } else if (chapter) {
    itemData = {};
    chapterData = {
      [verse]: itemData
    };
  }
  return {chapter, verse, chapterData, itemData};
};

/**
 * set value in group Data item
 * @param {Object} state
 * @param {Object} action - contains chapter, verse
 * @param {string} key - key for newValue
 * @param {*} newValue - value to set
 * @return {Object} - new reducer state
 */
const setItemValue = (state, action, key, newValue) => {
  const {chapter, verse, chapterData, itemData} = findMenuItem(state, action);
  if (itemData) {
    const newItemData = {
      ...itemData,
      [key]: newValue
    };
    return setNewItemValue(state, chapterData, chapter, verse, newItemData);
  }
  return state; // on error state is not changed
};

/**
 * make sure index is string
 * @param {string|number} index
 * @return {string}
 */
const normalizeRef = (index) => {
  return  index && index.toString() || "";
};

/**
 * Returns the menu data for item in chapter:verse
 * @param {Object} state
 * @param {string|number} chapter
 * @param {string|number} verse
 * @returns {Object} - item in group menu or null if not found
 */
export const getMenuItem = (state, chapter, verse) => {
  chapter = normalizeRef(chapter);
  if(chapter in state) {
    const chapterState = state[chapter];
    verse = normalizeRef(verse);
    if(verse in chapterState) {
      return chapterState[verse];
    }
  }
  return null;
};

export default groupMenu;
