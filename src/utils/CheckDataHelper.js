import fs from 'fs-extra';
import path from 'path-extra';
import generateTimestamp from '../utils/generateTimestamp';

/**
 * Checks if the verse alignment is flagged as invalid
 * @param {Object} api - tool api for system calls
 * @param {number} chapter
 * @param {number} verse
 * @return {Boolean}
 */
export const getIsVerseInvalid = (api, chapter, verse) => {
  const { tool: { toolDataPathExistsSync } } = api.props;
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
  const { tool: { toolDataPathExistsSync } } = api.props;
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
  let {
    tc: {
      project,
      toolName,
      projectDataPathExistsSync,
      contextId: tc_contextId,
    },
    contextId,
  } = api.props;
  contextId = contextId || tc_contextId;
  if (!contextId) {
    contextId = project.readCurrentContextIdSync(toolName);
  }

  const { reference: { bookId } } = contextId;
  const dataPath = generateCheckPath('verseEdits', bookId, chapter, verse);
  return projectDataPathExistsSync(dataPath);
};

/**
 * get current comment Object for verse
 * @param {object} contextId - contextId.
 * @param {object} tc - tc.
 * @param {number} chapter
 * @param {number} verse
 * @return {object}
 */
export const getVerseCommentRecord = (contextId, tc, chapter, verse) => {
  const data = loadCheckData(contextId, 'comments', tc, chapter, verse);
  return data;
};

/**
 * get current comment String for verse
 * @param {object} contextId - contextId.
 * @param {object} tc - tc.
 * @param {object} chapter - chapter.
 * @param {object} verse - verse.
 * @return {string}
 */
export const getVerseComment = (contextId, tc, chapter, verse) => {
  const comment = getVerseCommentRecord(contextId, tc, chapter, verse);
  return (comment && comment.text) || '';
};

/**
 * get current bookmark Object for verse
 * @param {Object} contextId - contextId.
 * @param {Object} tc - tc.
 * @param {object} chapter - chapter.
 * @param {object} verse - verse.
 * @return {Object}
 */
export const getVerseBookmarkedRecord = (contextId, tc, chapter, verse) => {
  const data = loadCheckData(contextId, 'reminders', tc, chapter, verse);
  return data;
};

/**
 * get current bookmark state for verse
 * @param {object} contextId - contextId.
 * @param {object} tc - tc.
 * @param {object} chapter - chapter.
 * @param {object} verse - verse.
 * @return {boolean}
 */
export const getVerseBookmarked = (contextId, tc, chapter, verse) => {
  const bookmark = getVerseBookmarkedRecord(contextId, tc, chapter, verse);
  return !!(bookmark && bookmark.enabled);
};

/**
 * generates path to check data for verse
 * @param {String} checkType (e.g. reminders)
 * @param {String} bookId
 * @param {String|Number} chapter
 * @param {String|Number} verse
 * @return {string}
 */
export function generateCheckPath(checkType, bookId, chapter, verse) {
  const dataPath = path.join('checkData', checkType, bookId, chapter + '', verse + '');
  return dataPath;
}

/**
 * Loads checkdata based on given contextId.
 * @param {object} contextId - contextId.
 * @param {string} checkType (e.g. reminders)
 * @param {object} tc - tc.
 * @param {object} chapter - chapter.
 * @param {object} verse - verse.
 * @param {string} toolName
 * @return {object} returns the most recent object for verse loaded from the file system.
 */
export function loadCheckData(contextId, checkType, tc, chapter = null, verse = null, toolName = 'wordAlignment') {
  const {
    reference: {
      bookId, chapter: contextIdChapter, verse: contextIdVerse,
    },
  } = contextId;
  // TRICKY: In some cases we need to use a chapter and verse combo different than the one coming in the contextId.
  chapter = chapter || contextIdChapter;
  verse = verse || contextIdVerse;
  const { project: { _dataPath } } = tc;
  const loadPath = path.join(_dataPath, generateCheckPath(checkType, bookId, chapter, verse));
  let checkDataObject;

  if (loadPath && contextId && fs.existsSync(loadPath)) {
    let files = fs.readdirSync(loadPath);

    files = files.filter(file => // filter the filenames to only use .json
      path.extname(file) === '.json'
    );

    let sorted = files.sort(); // sort the files by time

    for (let i = sorted.length - 1; i >= 0; i--) { // check starting with most recent
      const file = sorted[i];

      // check each file for same current tool name
      try {
        const readPath = path.join(loadPath, file);
        let _checkDataObject = fs.readJsonSync(readPath);

        if (_checkDataObject && _checkDataObject.contextId &&
          _checkDataObject.contextId.tool === toolName) {
          checkDataObject = _checkDataObject; // return the first match since it is the latest modified one
          break;
        }
      } catch (err) {
        console.warn('File exists but could not be loaded \n', err);
      }
    }
  }
  /**
   * @description Will return undefined if checkDataObject was not populated
   * so that the load method returns and then dispatches an empty action object
   * to initialized the reducer.
   */
  return checkDataObject;
}

/**
 * persist the check data for verse
 * @param {Object} api - tool api for system calls
 * @param {String} checkType
 * @param {String|Number} chapter
 * @param {String|Number} verse
 * @param {Object} newData - base data to save
 * @param {String} timeStamp - optional timeStamp to use, if empty will get generated by current time
 */
export function writeCheckData(api, checkType, chapter, verse, newData, timeStamp) {
  const {
    tc: {
      username,
      writeProjectDataSync,
    },
    contextId,
  } = api.props;
  const { reference: { bookId } } = contextId;
  const dataFolder = generateCheckPath(checkType, bookId, chapter, verse);
  const modifiedTimestamp = timeStamp || generateTimestamp();
  const saveData = {
    contextId,
    ...newData,
    username,
    activeBook: bookId,
    activeChapter: chapter,
    activeVerse: verse,
    modifiedTimestamp,
  };
  const dataPath = path.join(dataFolder, modifiedTimestamp + '.json').replace(/[:"]/g, '_'); // make legal path for all OS's
  writeProjectDataSync(dataPath, JSON.stringify(saveData));
}
