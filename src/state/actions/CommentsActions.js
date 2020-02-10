import * as GroupMenuActions from '../actions/GroupMenuActions';
import { writeCheckData, loadCheckData } from '../../utils/CheckDataHelper';
import generateTimestamp from '../../utils/generateTimestamp';
import { ADD_COMMENT } from '../actions/actionTypes';

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
      type: ADD_COMMENT,
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
    },
  } = contextId;

  const timestamp = generateTimestamp();
  dispatch(setComment(text, username, contextId, timestamp));
  dispatch(GroupMenuActions.setGroupMenuItemComment(chapter, verse, text));
  const newData = {
    text,
    userName: username,
    activeBook: bookId,
    activeChapter: chapter,
    activeVerse: verse,
    contextId,
  };
  writeCheckData(api, 'comments', chapter, verse, newData, timestamp);
});

/**
 * Loads the latest comment file from the file system for the specify contextID.
 * @param {object} contextId - context id.
 * @return {Object} Dispatches an action that loads the commentsReducer with data.
 */
export function loadComments(contextId) {
  const commentsObject = loadCheckData(contextId, 'comments');

  if (commentsObject) {
    return {
      type: ADD_COMMENT,
      modifiedTimestamp: commentsObject.modifiedTimestamp,
      text: commentsObject.text,
      userName: commentsObject.userName,
    };
  } else {
    // The object is undefined because the file wasn't found in the directory thus we init the reducer to a default value.
    return {
      type: ADD_COMMENT,
      modifiedTimestamp: '',
      text: '',
      userName: '',
    };
  }
}
