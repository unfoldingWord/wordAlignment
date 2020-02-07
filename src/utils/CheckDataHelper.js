import fs from 'fs-extra';
import path from 'path-extra';
import {
  ADD_COMMENT,
  SET_INVALIDATED,
  SET_BOOKMARK,
  CHANGE_SELECTIONS,
} from '../state/actions/actionTypes';
import generateTimestamp from '../utils/generateTimestamp';
import { PROJECT_CHECKDATA_DIRECTORY } from '../common/constants';

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
  const {
    tc: {
      projectDataPathExistsSync,
    },
    contextId,
  } = api.props;
  const { reference: { bookId } } = contextId;
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
 * @return {string}
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
 * @return {boolean}
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
 * Loads checkdata based on given contextId.
 * @param {object} api - tool api for system calls
 * @param {string} checkType (e.g. reminders)
 * @param {string|number} chapter
 * @param {string|number} verse
 * @param {string} toolName
 * @return {object} returns the most recent object for verse loaded from the file system.
 */
export function loadCheckData(api, checkType, chapter, verse, toolName = 'wordAlignment') {
  const { contextId } = api.props;
  const { reference: { bookId } } = contextId;
  let checkDataObject;
  const loadPath = generateCheckPath(checkType, bookId, chapter, verse);

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
 * Loads checkdata based on given contextId.
 * @param {string} loadPath - loadPath.
 * @param {string} contextId - contextId.
 * @return {Object} returns the most recent object for verse loaded from the file system.
 */
export function loadCheckData2(loadPath, contextId) {
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

        if (_checkDataObject) {
          _checkDataObject = JSON.parse(_checkDataObject);
        }

        if (_checkDataObject && _checkDataObject.contextId &&
          _checkDataObject.contextId.tool === contextId.tool) {
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
 * Generates the output directory.
 * @param {string} projectSaveLocation - Project's absolute path.
 * @param {object} contextId - context id.
 * @param {string} checkDataName - checkData folder name.
 * @return {string} save path
 * e.g. /translationCore/ar_eph_text_ulb/.apps/translationCore/checkData/comments/eph/1/3
 */
export function generateLoadPath(projectSaveLocation, contextId, checkDataName) {
  if (projectSaveLocation) {
    const bookAbbreviation = contextId.reference.bookId;
    const chapter = contextId.reference.chapter.toString();
    const verse = contextId.reference.verse.toString();
    const loadPath = path.join(
      projectSaveLocation,
      PROJECT_CHECKDATA_DIRECTORY,
      checkDataName,
      bookAbbreviation,
      chapter,
      verse
    );
    return loadPath;
  } else {
    console.warn('projectSaveLocation is undefined');
  }
}

/**
 * Loads the latest comment file from the file system for the specify contextID.
 * @param {string} projectSaveLocation - Project's absolute path.
 * @param {object} contextId - context id.
 * @return {Object} Dispatches an action that loads the commentsReducer with data.
 */
export function loadComments(projectSaveLocation, contextId) {
  const loadPath = generateLoadPath(projectSaveLocation, contextId, 'comments');
  const commentsObject = loadCheckData(loadPath, contextId);

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

/**
 * Loads the latest invalidated file from the file system for the specify contextID.
 * @param {string} projectSaveLocation - project path.
 * @param {object} contextId - context id.
 * @param {string} gatewayLanguageCode - gateway language code.
 */
export function loadInvalidated(projectSaveLocation, contextId, gatewayLanguageCode) {
  const loadPath = generateLoadPath(projectSaveLocation, contextId, 'invalidated');
  const invalidatedObject = loadCheckData(loadPath, contextId);

  if (invalidatedObject) {
    return {
      type: SET_INVALIDATED,
      enabled: invalidatedObject.enabled,
      username: invalidatedObject.userName || invalidatedObject.username,
      modifiedTimestamp: invalidatedObject.modifiedTimestamp,
      gatewayLanguageCode,
    };
  } else {
    // The object is undefined because the file wasn't found in the directory thus we init the reducer to a default value.
    return {
      type: SET_INVALIDATED,
      enabled: false,
      modifiedTimestamp: '',
      username: '',
      gatewayLanguageCode: null,
    };
  }
}

/**
 * Loads the latest bookmarks file from the file system for the specify contextID.
 * @param {string} projectSaveLocation - project path.
 * @param {object} contextId - context id.
 * @param {string} gatewayLanguageCode - gateway language code.
 */
export function loadBookmarks(projectSaveLocation, contextId, gatewayLanguageCode) {
  const loadPath = generateLoadPath(projectSaveLocation, contextId, 'reminders');
  const remindersObject = loadCheckData(loadPath, contextId);

  if (remindersObject) {
    return {
      type: SET_BOOKMARK,
      enabled: remindersObject.enabled,
      username: remindersObject.userName || remindersObject.username,
      modifiedTimestamp: remindersObject.modifiedTimestamp,
      gatewayLanguageCode,
    };
  } else {
    // The object is undefined because the file wasn't found in the directory thus we init the reducer to a default value.
    return {
      type: SET_BOOKMARK,
      enabled: false,
      modifiedTimestamp: '',
      username: '',
      gatewayLanguageCode: null,
    };
  }
}

/**
 * Loads the latest selections file from the file system for the specific contextID.
 * @param {Object} state - store state object.
 * @return {Object} Dispatches an action that loads the selectionsReducer with data.
 */
export function loadSelections(projectSaveLocation, contextId) {
  const loadPath = generateLoadPath(projectSaveLocation, contextId, 'selections');
  const selectionsObject = loadCheckData(loadPath, contextId);

  if (selectionsObject) {
    let {
      selections,
      modifiedTimestamp,
      nothingToSelect,
      username,
      userName, // for old project data
      gatewayLanguageCode,
      gatewayLanguageQuote,
    } = selectionsObject;
    username = username || userName;

    return {
      type: CHANGE_SELECTIONS,
      selections: selections,
      nothingToSelect: nothingToSelect,
      username,
      modifiedTimestamp: modifiedTimestamp,
      gatewayLanguageCode: gatewayLanguageCode,
      gatewayLanguageQuote: gatewayLanguageQuote,
    };
  } else {
    // The object is undefined because the file wasn't found in the directory thus we init the reducer to a default value.
    return {
      type: CHANGE_SELECTIONS,
      modifiedTimestamp: null,
      selections: [],
      username: null,
    };
  }
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
      contextId,
      writeProjectDataSync,
    },
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
