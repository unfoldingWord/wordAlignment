import {RECORD_CHECK} from '../../actions/actionTypes';
import chapter, * as fromChapter from "./chapter";

/**
 * Reduces the check state
 * @param state
 * @param action
 * @returns {{}}
 */
const check = (state = {}, action) => {
  switch (action.type) {
    case RECORD_CHECK: {
      const chapterId = `${action.chapter}`;
      return {
        ...state,
        [chapterId]: chapter(state[chapterId], action)
      };
    }
    default:
      return state;
  }
};

export default check;

/**
 * Returns the check data for a verse.
 * @param state
 * @param {number} chapter
 * @param {number} verse
 */
export const getVerseCheck = (state, chapter, verse) => {
  const chapterId = `${chapter}`;
  if(chapterId in state) {
    return fromChapter.getVerseCheck(state[chapterId], verse);
  } else {
    return null;
  }
};
