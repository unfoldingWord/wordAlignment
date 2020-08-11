import fs from 'fs-extra';
import path from 'path-extra';
import isEqual from 'deep-equal';
import { PROJECT_INDEX_FOLDER_PATH } from '../common/constants';

/**
 * find path in index for current contextId
 * @param {String} projectSaveLocation
 * @param {String} toolName
 * @param {String} bookId
 */
export function getContextIdPathFromIndex(projectSaveLocation, toolName, bookId) {
  return path.join(projectSaveLocation, PROJECT_INDEX_FOLDER_PATH, toolName, bookId, 'currentContextId', 'contextId.json');
}

/**
 * Writes the context id to the disk.
 * @param {object} state - store state object.
 * @param {object} contextId
 */
export const saveContextId = (contextId, projectSaveLocation) => {
  try {
    const toolName = contextId ? contextId.tool : undefined;
    const bookId = contextId ? contextId.reference.bookId : undefined;

    if (projectSaveLocation && toolName && bookId) {
      const savePath = getContextIdPathFromIndex(projectSaveLocation, toolName, bookId);
      fs.outputJson(savePath, contextId, { spaces: 2 });
    } else {
      // saveCurrentContextId: missing required data
    }
  } catch (err) {
    console.error(err);
  }
};

/**
 * returns true if contextIds are a match for reference and groupId
 * @param {Object} contextId1
 * @param {Object} contextId2
 * @return {boolean}
 */
export const sameContext = (contextId1, contextId2) => {
  if (contextId1 && contextId2) {
    return isEqual(contextId1.reference, contextId2.reference) &&
      (contextId1.groupId === contextId2.groupId) &&
      (contextId1.occurrence === contextId2.occurrence);
  }
  return false;
};
