import {RECORD_CHECK} from '../../actions/actionTypes';
import check, * as fromCheck from './check';

// TODO: the "checks" reducer is the beginning concept of a generic checks handler that could be used for all tools.
// The basic idea is that the tc-tool could provide utility actions and selectors for managing state within a tool.
// We'll need to figure out some more complicated things like how to represent multiple checks for a single verse.
// Also, this check model is following an incorrect structure. See https://github.com/unfoldingWord-dev/translationCore/issues/5592
// For example tW could have checks for multiple instances of a word or phrase within the same verse.
// @example
// const {tool: {
//    recordCheck, // this is an action
//    getCheck // this is a selector
//  }
// } = this.props;
// recordCheck("invalidated", "some data"); // the new check record will be stored in redux and return immediately (fast). Check state will be written to disk asynchronously without blocking the ui.
// const verseChecks = getChecks("invalidated", 1, 1); // returns the latest checks for the verse from redux (fast)
//
//

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
        [action.check]: check(state[action.check], action)
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
  if (check in state) {
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
  if (check in state) {
    return state[check];
  } else {
    return null;
  }
};
