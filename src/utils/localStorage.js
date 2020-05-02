import fs from 'fs-extra';
import path from 'path-extra';
import { PROJECT_CHECKDATA_DIRECTORY, PROJECT_INDEX_FOLDER_PATH } from '../common/constants';
import generateTimestamp from './generateTimestamp';

/**
 * Generates the output directory.
 * @param {object} contextId - context id.
 * @param {String} checkDataName - checkData folder name.
 *  @example comments, bookmarks, selections, verseEdits etc.
 * @param {String} modifiedTimestamp - timestamp.
 * that contains the specific timestamp.
 * @return {String} save path.
 */
function generateSavePath(contextId, checkDataName, modifiedTimestamp, projectSaveLocation) {
  try {
    if (projectSaveLocation && contextId && modifiedTimestamp) {
      const bookId = contextId.reference.bookId;
      const chapter = contextId.reference.chapter.toString();
      const verse = contextId.reference.verse.toString();
      const fileName = modifiedTimestamp + '.json';
      const savePath = path.join(
        projectSaveLocation,
        PROJECT_CHECKDATA_DIRECTORY,
        checkDataName,
        bookId,
        chapter,
        verse,
        fileName.replace(/[:"]/g, '_')
      );
      return savePath;
    } else {
      console.error(`projectSaveLocation is undefined`, );
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * abstracted function to handle data saving.
 * @param {object} contextId - context Id.
 * @param {string} checkDataName - checkDate folder name where data will be saved.
 *  @example 'comments', 'bookmarks', 'selections', 'verseEdits' etc
 * @param {object} payload - checkData.
 * @param {string} modifiedTimestamp - timestamp.
 * @param {string} projectSaveLocation - project directory path.
 */
function saveData(contextId, checkDataName, payload, modifiedTimestamp, projectSaveLocation) {
  try {
    const savePath = generateSavePath(contextId, checkDataName, modifiedTimestamp, projectSaveLocation);

    if (savePath) {
      fs.outputJsonSync(savePath, payload, { spaces: 2 });
      console.info(`Succesfully saved: ${checkDataName} check data item.`);
    } else {
      const errorMessage = `saveData(): savePath is undefined or path does not exists ${savePath}`;
      console.error(errorMessage);
    }
  } catch (err) {
    console.error(`saveData() Error checkDataName:${checkDataName}`);
    console.error(err);
  }
}

/**
 * Saves the bookmarks check data.
 * @param {object} contextId - context Id.
 * @param {object} bookmarkData - bookmark check Data.
 * @param {string} projectSaveLocation - project directory Path.
 */
export const saveBookmark = (contextId, bookmarkData, projectSaveLocation) => {
  try {
    const bookmarkPayload = {
      ...bookmarkData,
      contextId,
    };
    const modifiedTimestamp = bookmarkData.modifiedTimestamp || generateTimestamp();
    saveData(contextId, 'reminders', bookmarkPayload, modifiedTimestamp, projectSaveLocation);
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
};

/**
 * Save the verse Edit check data.
 * @param {object} state - store state object.
 */
export const saveVerseEdit = (contextId, verseEditData, projectSaveLocation) => {
  try {
    const verseEditPayload = {
      ...verseEditData,
      contextId,
    };
    const modifiedTimestamp = generateTimestamp();
    saveData(contextId, 'verseEdits', verseEditPayload, modifiedTimestamp, projectSaveLocation);
  } catch (err) {
    console.error(err);
  }
};

/**
 * Saves the groups data by groupId.
 * @param {object} groupsData - groups Data.
 * @param {string} projectSaveLocation - project directory path.
 * @param {string} toolName - tool Name.
 * @param {string} bookId - book Id.
 */
export const saveGroupsData = (groupsData, projectSaveLocation, toolName, bookId) => {
  try {
    if (groupsData && projectSaveLocation && toolName && bookId) {
      for (const groupID in groupsData) {
        if (groupsData[groupID]) {
          const fileName = groupID + '.json';
          const savePath = path.join(projectSaveLocation, PROJECT_INDEX_FOLDER_PATH, toolName, bookId, fileName);
          fs.outputJsonSync(savePath, groupsData[groupID], { spaces: 2 });
        }
      }
    } else {
      console.error('saveGroupsData(): missing required arguments.');
    }
  } catch (err) {
    console.error(err);
  }
};

/**
 * Saves the selections data.
 * @param {object} contextId
 * @param {object} selectionData
 * @param {string} projectSaveLocation
 */
export const saveSelections = (contextId, selectionData, projectSaveLocation) => {
  try {
    const selectionsPayload = {
      contextId,
      ...selectionData,
    };
    const modifiedTimestamp = selectionData.modifiedTimestamp;
    saveData(contextId, 'selections', selectionsPayload, modifiedTimestamp, projectSaveLocation);
  } catch (err) {
    console.error(err);
  }
};

/**
* saves selection data for a context that is not current
* @param {string} gatewayLanguageCode
* @param {string} gatewayLanguageQuote
* @param {array} selections
* @param {boolean} invalidated
* @param {string} username
* @param {object} contextId
* @param {string} projectSaveLocation
*/
export const saveSelectionsForOtherContext = (gatewayLanguageCode, gatewayLanguageQuote, selections, invalidated, username, contextId, projectSaveLocation) => {
  const selectionData = {
    modifiedTimestamp: generateTimestamp(),
    gatewayLanguageCode,
    gatewayLanguageQuote,
    selections,
    username,
  };
  saveSelections(contextId, selectionData, projectSaveLocation);
  saveInvalidatedForOtherContext(gatewayLanguageCode, gatewayLanguageQuote, invalidated, username, contextId, projectSaveLocation); // now update invalidated
};

/**
 * saves selection data for a context that is not current
 * @param {String} gatewayLanguageCode
 * @param {String} gatewayLanguageQuote
 * @param {Boolean} invalidated
 * @param {String} username
 * @param {Object} contextId
 */
export const saveInvalidatedForOtherContext = (gatewayLanguageCode, gatewayLanguageQuote, invalidated, username, contextId, projectSaveLocation) => {
  delete invalidated.invalidatedChecksTotal;
  delete invalidated.verseEditsTotal;
  delete invalidated.invalidatedAlignmentsTotal;
  const invalidatedData = {
    modifiedTimestamp: generateTimestamp(),
    gatewayLanguageCode,
    gatewayLanguageQuote,
    invalidated,
    username,
  };

  saveInvalidated(contextId, invalidatedData, projectSaveLocation);
};

/**
 * Saves the invalidated data.
 * @param {object} contextId - context id.
 * @param {object} invalidatedData - invalidated Data.
 * @param {string} projectSaveLocation - Project Directory Path.
 */
export const saveInvalidated = (contextId, invalidatedData, projectSaveLocation) => {
  try {
    const invalidatedPayload = {
      contextId,
      ...invalidatedData,
    };
    const modifiedTimestamp = invalidatedData.modifiedTimestamp;
    saveData(contextId, 'invalidated', invalidatedPayload, modifiedTimestamp, projectSaveLocation);
  } catch (err) {
    console.error(err);
  }
};


export function getMemoryUsage(object) {
  return unescape(encodeURIComponent(JSON.stringify(object))).length;
}

// noinspection JSUnusedLocalSymbols
export async function logMemory(title, intial = false) {
  const localProcess = process;

  if (localProcess.getProcessMemoryInfo) {
    const emphasis = '############\n';
    let output = `\n\n${emphasis} WA: ${title}\nlogMemory()\n`;
    output += `process.getHeapStatistics() = ${JSON.stringify(localProcess.getHeapStatistics(), null, 2)}\n`;
    output += `process.getSystemMemoryInfo() = ${JSON.stringify(localProcess.getSystemMemoryInfo(), null, 2)}\n`;
    let object = sessionStorage;
    const sessionStorageUsage = getMemoryUsage(object);
    output += `sessionStorageUsage: ${sessionStorageUsage}\n`
    output += emphasis + '\n';
    console.log(output);
    const processMemoryInfo = await localProcess.getProcessMemoryInfo();
    console.log(`\n\n${emphasis} WA: ${title}\n process.getProcessMemoryInfo() = ${JSON.stringify(processMemoryInfo, null, 2)}\n`);
  }
}
