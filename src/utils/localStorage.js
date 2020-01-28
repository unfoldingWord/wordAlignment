import fs from 'fs-extra';
import path from 'path-extra';
import { PROJECT_INDEX_FOLDER_PATH } from '../common/constants';

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
