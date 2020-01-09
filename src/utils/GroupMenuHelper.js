import path from "path-extra";
import {generateCheckPath, loadCheckData} from "./CheckDataHelper";

/**
 * Checks if the verse alignment is flagged as invalid
 * @param {Object} api - tool api for system calls
 * @param {number} chapter
 * @param {number} verse
 * @return {Boolean}
 */
export const getIsVerseInvalid = (api, chapter, verse) => {
  const {
    tool: {
      toolDataPathExistsSync
    }
  } = api.props;
  const dataPath = path.join('invalid', chapter + '', verse + '.json');
  return toolDataPathExistsSync(dataPath);
};

/**
 * Checks if a verse has been completed.
 * @param {Object} api - tool api for system calls
 * @param {number} chapter
 * @param {number} verse
 * @return {Boolean}
 */
export const getIsVerseFinished = (api, chapter, verse) => {
  const {
    tool: {
      toolDataPathExistsSync
    }
  } = api.props;
  const dataPath = path.join('completed', chapter + '', verse + '.json');
  return toolDataPathExistsSync(dataPath);
};

/**
 * check if verse edits for verse
 * @param {Object} api - tool api for system calls
 * @param {String|Number} chapter
 * @param {String|Number} verse
 * @return {Boolean}
 */
export const getIsVerseEdited = (api, chapter, verse) => {
  const {
    tc: {
      projectDataPathExistsSync,
      contextId
    }
  } = api.props;
  const {reference: {bookId}} = contextId;
  const dataPath = generateCheckPath('verseEdits', bookId, chapter, verse);
  return projectDataPathExistsSync(dataPath);
};

/**
 * get current comment for verse
 * @param {Object} api - tool api for system calls
 * @param {String|Number} chapter
 * @param {String|Number} verse
 * @return {String}
 */
export const getVerseComment = (api, chapter, verse) => {
  const comment = loadCheckData(api,'comments',  chapter, verse );
  return (comment && comment.text) || '';
};

/**
 * get current bookmark state for verse
 * @param {Object} api - tool api for system calls
 * @param {String|Number} chapter
 * @param {String|Number} verse
 * @return {Boolean}
 */
export const getVerseBookmarked = (api, chapter, verse) => {
  const bookmark = loadCheckData(api,'reminders', chapter, verse);
  return !!(bookmark && bookmark.enabled);
};

