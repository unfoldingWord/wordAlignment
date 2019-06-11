import {RECORD_CHECK} from '../../actions/actionTypes';
import verse, * as fromVerse from "./verse";

/**
 * Reduces chapter check state
 * @param state
 * @param action
 * @returns {{}}
 */
const chapter = (state = {}, action) => {
  switch(action.type) {
    case RECORD_CHECK: {
      const verseId = `${action.verse}`;
      return {
        ...state,
        [verseId]: verse(state[verseId], action)
      };
    }
    default:
      return state;
  }
};

export default chapter;

/**
 * Returns the check data for a verse in this chapter
 * @param state
 * @param {number} verse
 * @returns {*}
 */
export const getVerseCheck = (state, verse) => {
  const verseId = `${verse}`;
  if(verseId in state) {
    return fromVerse.getCheck(state[verseId]);
  } else {
    return null;
  }
};
