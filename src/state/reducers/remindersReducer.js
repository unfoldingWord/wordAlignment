import * as consts from '../actions/actionTypes';

const initialState = {
  enabled: false,
  userName: null,
  modifiedTimestamp: null,
};

const remindersReducer = (state = initialState, action) => {
  switch (action.type) {
  case consts.LOAD_REMINDER:
    return {
      ...action.value
    };
  case consts.ADD_REMINDER:
    return {
      enabled: !!action.enabled,
      userName: action.userName,
      modifiedTimestamp: action.modifiedTimestamp,
    };
  default:
    return state;
  }
};

/**
 * Returns reminders object
 * @param {Object} state
 * @returns {Object} - entire
 */
export const getReminder = (state) => {
  return state;
};

export default remindersReducer;
