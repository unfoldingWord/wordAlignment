import * as consts from '../actions/actionTypes';
import * as GroupMenuActions from '../actions/GroupMenuActions';
import {
  generateTimestamp,
  writeCheckData,
} from '../../utils/CheckDataHelper';

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
      type: consts.ADD_BOOKMARK,
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
    }
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
