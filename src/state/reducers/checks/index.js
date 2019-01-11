import {RECORD_CHECK} from '../../actions/actionTypes';
import check, * as fromCheck from './check';

/**
 * Reduces checks for the tool
 * @param state
 * @param action
 * @returns {{}}
 */
const checks = (state = {}, action) => {
  switch (action.type) {
    case RECORD_CHECK:
      return {
        ...state,
        [action.check]: check(state[check], action)
      };
    default:
      return state;
  }
};

export default checks;

/**
 * Returns the check data for a verse
 * @param state
 * @param {string} check - the check id
 * @param {number} chapter
 * @param {number} verse
 */
export const getVerseCheck = (state, check, chapter, verse) => {
  if(check in state) {
    return fromCheck.getVerseCheck(state[check], chapter, verse);
  } else {
    return null;
  }
};

/**
 * Returns all the recorded instances of a check
 * @param state
 * @param {string} check
 */
export const getChecks = (state, check) => {
  if(check in state) {
    return state[check];
  } else {
    return null;
  }
};
