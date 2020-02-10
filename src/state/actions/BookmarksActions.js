import { ADD_BOOKMARK } from '../actions/actionTypes';
import * as GroupMenuActions from '../actions/GroupMenuActions';
import { writeCheckData, loadCheckData } from '../../utils/CheckDataHelper';
import generateTimestamp from '../../utils/generateTimestamp';

/**
 * set bookmark state in reducer
 * @param {Boolean} enabled
 * @param {String} username
 * @param {Object} contextId
 * @param {String} timestamp
 * @return {function(...[*]=)}
 */
export function setBookmark(enabled, username, contextId, timestamp) {
  return ((dispatch) => {
    const {
      bookId, chapter, verse,
    } = contextId;
    timestamp = timestamp || generateTimestamp();

    dispatch({
      type: ADD_BOOKMARK,
      userName: username,
      activeBook: bookId,
      activeChapter: chapter,
      activeVerse: verse,
      modifiedTimestamp: timestamp,
      contextId,
      enabled,
    });
  });
}

/**
 * Set Bookmark state for the current check - also updates group menu and persists change.
 * @param {Object} api - tool api for system calls
 * @param {Boolean} enabled
 * @param {String} username
 * @param {Object} contextId
 * @return {Object} New state for comment reducer.
 */
export const addBookmark = (api, enabled, username, contextId) => ((dispatch) => {
  const {
    reference: {
      bookId, chapter, verse,
    },
  } = contextId;

  enabled = !!enabled;
  const timestamp = generateTimestamp();
  dispatch(setBookmark(enabled, username, contextId, timestamp));
  dispatch(GroupMenuActions.setGroupMenuItemBookmarked(chapter, verse, enabled));
  const newData = {
    enabled: enabled,
    userName: username,
    activeBook: bookId,
    activeChapter: chapter,
    activeVerse: verse,
    contextId,
  };
  writeCheckData(api, 'reminders', chapter, verse, newData, timestamp);
});

/**
 * Loads the latest bookmarks file from the file system for the specify contextID.
 * @param {object} contextId - context id.
 * @param {string} gatewayLanguageCode - gateway language code.
 */
export function loadBookmarks(contextId, gatewayLanguageCode) {
  const remindersObject = loadCheckData(contextId, 'reminders');

  if (remindersObject) {
    return {
      type: ADD_BOOKMARK,
      enabled: remindersObject.enabled,
      userName: remindersObject.userName || remindersObject.username,
      modifiedTimestamp: remindersObject.modifiedTimestamp,
      gatewayLanguageCode,
    };
  } else {
    // The object is undefined because the file wasn't found in the directory thus we init the reducer to a default value.
    return {
      type: ADD_BOOKMARK,
      enabled: false,
      modifiedTimestamp: '',
      username: '',
      gatewayLanguageCode: null,
    };
  }
}
