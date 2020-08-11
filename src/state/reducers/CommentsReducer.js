import {
  LOAD_COMMENT,
  ADD_COMMENT,
} from '../actions/actionTypes';

const initialState = {
  text: null,
  userName: null,
  modifiedTimestamp: null,
};

const commentsReducer = (state = initialState, action) => {
  switch (action.type) {
  case LOAD_COMMENT:
    return { ...action.value };
  case ADD_COMMENT:
    return {
      text: action.text,
      userName: action.userName,
      modifiedTimestamp: action.modifiedTimestamp,
    };
  default:
    return state;
  }
};

/**
 * Returns comments object
 * @param {Object} state
 * @returns {Object}
 */
export const getComments = (state) => state;

export default commentsReducer;
