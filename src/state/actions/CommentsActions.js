import * as consts from '../actions/actionTypes';
import * as Actions from '../actions/index';
import {
  generateTimestamp,
  writeCheckData,
} from '../../utils/CheckDataHelper';

/**
 * set new comment in reducer
 * @param {String} text
 * @param {String} username
 * @param {Object} contextId
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
      contextId,
      text,
    });
  });
}

/**
 * Add a comment for the current check - also updates group menu and persists change.
 * @param {Object} api - tool api for system calls
 * @param {String} text - comment text.
 * @param {String} username
 * @param {Object} contextId
 * @return {Object} New state for comment reducer.
 */
export const addComment = (api, text, username, contextId) => ((dispatch) => {
  const {
    reference: {
      bookId, chapter, verse,
    }
  } = contextId;

  const timestamp = generateTimestamp();
  dispatch(setComment(text, username, contextId, timestamp));
  dispatch(Actions.setGroupMenuItemComment(chapter, verse, text));
  const newData = {
    text,
    userName: username,
    activeBook: bookId,
    activeChapter: chapter,
    activeVerse: verse,
    modifiedTimestamp: timestamp,
    contextId,
  };
  writeCheckData(api, 'comments', chapter, verse, newData);
});
