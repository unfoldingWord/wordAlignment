import * as consts from '../actions/actionTypes';

const initialState = {
  text: null,
  userName: null,
  activeBook: null,
  activeChapter: null,
  activeVerse: null,
  modifiedTimestamp: null,
};

const commentsReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.LOAD_COMMENT:
      return {
        ...action.value
      };
    case consts.ADD_COMMENT:
      return Object.assign({}, state, {
        text: action.text,
        userName: action.userName,
        activeBook: action.activeBook,
        activeChapter: action.activeChapter,
        activeVerse: action.activeVerse,
        modifiedTimestamp: action.modifiedTimestamp,
      });
  default:
    return state;
  }
};

/**
 * Returns comments object
 * @param {Object} state
 * @returns {Object}
 */
export const getComments = (state) => {
  return state;
};

export default commentsReducer;
