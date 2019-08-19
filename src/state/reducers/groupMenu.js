// consts
import {SET_EDITED, SET_FINISHED, SET_INVALID, SET_UNALIGNED, SET_STATE} from '../actions/actionTypes';
export const FINISHED_KEY = 'finished';
export const INVALID_KEY = 'invalid';
export const UNALIGNED_KEY = 'unaligned';
export const EDITED_KEY = 'edited';

/**
 * Reduces group data state
 * @param {Object} state
 * @param {Object} action
 * @returns {{}} new state
 */
const groupMenu = (state = {}, action) => {
  switch(action.type) {
    case SET_FINISHED: {
      return setItemValue(state, action, FINISHED_KEY, !!action.value);
    }
    case SET_INVALID: {
      return setItemValue(state, action, INVALID_KEY, !!action.value);
    }
    case SET_UNALIGNED: {
      return setItemValue(state, action, UNALIGNED_KEY, !!action.value);
    }
    case SET_EDITED: {
      return setItemValue(state, action, EDITED_KEY, !!action.value);
    }
    case SET_STATE: {
      const {chapter, verse, chapterData, itemData} = findMenuItem(state, action);
      const newValueKeys = Object.keys(action.values);
      if (newValueKeys.length) {
        const newItemData = {
          ...itemData,
          ...action.values
        };
        return setNewItemValue(state, chapterData, chapter, verse, newItemData);
      }
      return state;
    }
    default:
      return state;
  }
};

/**
 * apply new item value to state
 * @param chapterData
 * @param chapter
 * @param verse
 * @param newItemData
 * @param state
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
 * @param state
 * @param {Object} action
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
    } else {
      itemData = {};
      chapterData = {
        ...chapterData,
        [verse]: itemData
      };
    }
  } else {
    itemData = {};
    chapterData = {
      [verse]: itemData
    };
  }
  return { chapter, verse, chapterData, itemData};
};

/**
 * set value in group Data item
 * @param {Object} state
 * @param {Object} action
 * @param {string} key - key for newValue
 * @param {*} newValue - value to set
 * @return {Object} - new reducer state
 */
const setItemValue = (state, action, key, newValue) => {
  const {chapter, verse, chapterData, itemData} = findMenuItem(state, action);
  const newItemData = {
    ...itemData,
    [key]: newValue
  };
  return setNewItemValue(state, chapterData, chapter, verse, newItemData);
};

/**
 * make sure ref is string
 * @param index
 * @return {string}
 */
const normalizeRef = (index) => {
  return index.toString();
};

/**
 * Returns the menu data for item in chapter:verse
 * @param state
 * @param {string|number} chapter
 * @param {string|number} verse
 * @returns {Object} - item in group menu
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
