import path from "path-extra";

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
 * get current comment Object for verse
 * @param {Object} api - tool api for system calls
 * @param {String|Number} chapter
 * @param {String|Number} verse
 * @return {Object}
 */
export const getVerseCommentRecord = (api, chapter, verse) => {
  const data = loadCheckData(api, 'comments', chapter, verse);
  return data;
};

/**
 * get current comment String for verse
 * @param {Object} api - tool api for system calls
 * @param {String|Number} chapter
 * @param {String|Number} verse
 * @return {String}
 */
export const getVerseComment = (api, chapter, verse) => {
  const comment = getVerseCommentRecord(api, chapter, verse);
  return (comment && comment.text) || '';
};

/**
 * get current bookmark Object for verse
 * @param {Object} api - tool api for system calls
 * @param {String|Number} chapter
 * @param {String|Number} verse
 * @return {Object}
 */
export const getVerseBookmarkedRecord = (api, chapter, verse) => {
  const data = loadCheckData(api, 'reminders', chapter, verse);
  return data;
};

/**
 * get current bookmark state for verse
 * @param {Object} api - tool api for system calls
 * @param {String|Number} chapter
 * @param {String|Number} verse
 * @return {Boolean}
 */
export const getVerseBookmarked = (api, chapter, verse) => {
  const bookmark = getVerseBookmarkedRecord(api, chapter, verse);
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
 * @description loads checkdata based on given contextId.
 * @param {Object} api - tool api for system calls
 * @param {String} checkType (e.g. reminders)
 * @param {String|Number} chapter
 * @param {String|Number} verse
 * @param {String} toolName
 * @return {Object} returns the most recent object for verse loaded from the file system.
 */
export function loadCheckData(api, checkType, chapter, verse,
                              toolName = 'wordAlignment') {
  const {
    projectDataPathExistsSync,
    readProjectDataSync,
    readProjectDirSync,
    contextId
  } = api.props.tc;
  const {reference: {bookId}} = contextId;
  let checkDataObject;
  const loadPath = generateCheckPath(checkType, bookId, chapter, verse);

  if (loadPath && contextId && projectDataPathExistsSync(loadPath)) {
    let files = readProjectDirSync(loadPath);

    files = files.filter(file => // filter the filenames to only use .json
      path.extname(file) === '.json'
    );

    let sorted = files.sort(); // sort the files by time

    for (let i = sorted.length - 1; i >= 0; i--) { // check starting with most recent
      const file = sorted[i];

      // check each file for same current tool name
      try {
        const readPath = path.join(loadPath, file);
        let _checkDataObject = readProjectDataSync(readPath);
        if (_checkDataObject) {
          _checkDataObject = JSON.parse(_checkDataObject);
        }

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
export function writeCheckData(api, checkType, chapter, verse, newData,
                               timeStamp ) {
  const {
    tc: {
      username,
      contextId,
      writeProjectDataSync
    }
  } = api.props;
  const {reference: { bookId }} = contextId;
  const dataFolder = generateCheckPath(checkType, bookId, chapter, verse);
  const modifiedTimestamp = timeStamp || generateTimestamp();
  const saveData = {
    contextId,
    ...newData,
    username,
    activeBook: bookId,
    activeChapter: chapter,
    activeVerse: verse,
    modifiedTimestamp
  };
  const dataPath = path.join(dataFolder, modifiedTimestamp + '.json').replace(/[:"]/g, '_'); // make legal path for all OS's
  writeProjectDataSync(dataPath, JSON.stringify(saveData));
}

/**
 * @description This helper method generates a timestamp in milliseconds for use
 *              in the storing of data in the app. Timestamps will be used to
 *              generate filenames and modified dates.
 * @param {String|null} str A date string to use. If null, will be current date
 * @return {String} The timestamp in milliseconds
 ******************************************************************************/
export const generateTimestamp = (str = null) => {
  if (!str) {
    return (new Date()).toJSON();
  } else {
    return (new Date(str)).toJSON();
  }
};
