import * as consts from '../actions/actionTypes';
import * as Actions from '../actions/index';
import { generateTimestamp } from '../../utils/CheckDataHelper';

/**
 *
 * @param text
 * @param username
 * @param contextId
 * @param {String} timestamp
 * @return {function(...[*]=)}
 */
export function setComment(text, username, contextId, timestamp) {
  return ((dispatch) => {
    const {
      bookId, chapter, verse,
    } = contextId;
    timestamp = timestamp || generateTimestamp();

    dispatch({
      type: consts.ADD_COMMENT,
      userName: username,
      activeBook: bookId,
      activeChapter: chapter,
      activeVerse: verse,
      modifiedTimestamp: timestamp,
      text,
    });
  });
}

/**
 * Add a comment for the current check.
 * @param {String} text - comment text.
 * @return {Object} New state for comment reducer.
 */
export const addComment = (text) => ((dispatch, getState) => {
  const state = getState();
  const {
    contextId: {
      reference: {
        chapter, verse,
      }
    }
  } = state.contextIdReducer;
  const username = state.loginReducer.userdata.username;

  dispatch(setComment(text, username, generateTimestamp()));
  dispatch(Actions.setGroupMenuItemComment(chapter, verse, text));
});
