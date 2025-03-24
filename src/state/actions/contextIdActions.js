import fs from 'fs-extra';
import isEqual from 'deep-equal';
// Helpers
import delay from '../../utils/delay';
import Repo from '../../utils/Repo';
import { getContextIdPathFromIndex, saveContextId } from '../../utils/contextIdHelpers';
import {
  getGroupsIndex,
  getGroupsData,
  getContextId,
} from '../selectors';
import {
  CHANGE_CONTEXT_ID,
  CLEAR_CONTEXT_ID,
} from './actionTypes';
import { loadNewContext } from './CheckDataActions';

/**
 * Loads the latest contextId file from the file system.
 * @param {string} toolName - tool's name.
 * @param {string} bookId - book id code. e.g. tit.
 * @param {string} projectSaveLocation - project's absolute path.
 * @param {object} userData - user data.
 * @param {string} gatewayLanguageCode - gateway language code.
 */
export function loadCurrentContextId(toolName, bookId, projectSaveLocation, userData, gatewayLanguageCode, tc) {
  return (dispatch, getState) => {
    const state = getState();
    const groupsIndex = getGroupsIndex(state);

    if (projectSaveLocation && toolName && bookId) {
      let contextId = {};

      try {
        let loadPath = getContextIdPathFromIndex(projectSaveLocation, toolName, bookId);

        if (fs.existsSync(loadPath)) {
          try {
            contextId = fs.readJsonSync(loadPath);

            if (contextId) {
              const contextIdExistInGroups = groupsIndex.filter(({id}) => id === contextId.groupId).length > 0;

              if (contextIdExistInGroups) {
                return dispatch(changeCurrentContextId(contextId, projectSaveLocation, userData, gatewayLanguageCode, tc));
              }
            }
          } catch (err) {
            // The object is undefined because the file wasn't found in the directory
            console.error('loadCurrentContextId() error reading contextId', err);
          }
        }
        // if we could not read contextId default to first
        contextId = firstContextId(state);
        dispatch(changeCurrentContextId(contextId, projectSaveLocation, userData, gatewayLanguageCode, tc));
      } catch (err) {
        // The object is undefined because the file wasn't found in the directory or other error
        console.error('loadCurrentContextId() error loading contextId', err);
      }
    } else {
      console.warn('projectSaveLocation || toolName || bookId is undefined');
    }
  };
}

/**
 * Changes the contextId to the current check.
 * @param {object} contextId - context Id.
 * @param {string} projectSaveLocation - project's absolute path.
 * @param {object} userData - user data.
 * @param {string} gatewayLanguageCode - gateway language code.
 * @param {object} tc - tc.
 */
export const changeCurrentContextId = (contextId = null, projectSaveLocation, userData, gatewayLanguageCode, tc) => (dispatch, getState) => {
  const state = getState();
  contextId = contextId || getContextId(state);

  if (contextId) {
    const {
      reference: {
        bookId,
        chapter,
        verse,
      },
      tool,
      groupId,
    } = contextId;
    const refStr = `${tool} ${groupId} ${bookId} ${chapter}:${verse}`;
    console.info(`changeCurrentContextId() - setting new contextId to: ${refStr}`);

    dispatch(loadNewContext(contextId, tc));
    dispatch(changeContextId(contextId));
    // save current contextId to filesystem.
    saveContextId(contextId, projectSaveLocation);

    // commit project changes after delay
    delay(500).then(async () => {
      try {
        const repo = await Repo.open(projectSaveLocation, userData);
        const saveStarted = await repo.saveDebounced(`Auto saving at ${refStr}`);

        if (!saveStarted) {
          console.info(`changeCurrentContextId() - GIT Save already running, skipping save after ${refStr}`);
        }
      } catch (e) {
        console.error(`changeCurrentContextId() - Failed to auto save ${refStr}`, e);
      }
    });
  }
};

/**
 * @description this action returns the contextId of the first check.
 * @return {object} New state for contextId reducer.
 */
function firstContextId(state) {
  let contextId;
  const groupsIndex = getGroupsIndex(state);
  const groupsData = getGroupsData(state);
  let groupsIndexEmpty = groupsIndex.length === 0;
  let groupsDataEmpty = Object.keys(groupsData).length === 0;

  if (!groupsIndexEmpty && !groupsDataEmpty) {
    let valid = false, i = 0;

    while (!valid && i < groupsIndex.length - 1 || i === 0) {
      let groupId = groupsIndex[i].id;
      let data = groupsData[groupId];

      if (!!data && !!data[0]) {
        contextId = data[0].contextId;
      }
      valid = !!contextId;
      i++;
    }
    return contextId;
  }
}

/**
 * Changes the contextId to the next check.
 * @param {string} projectSaveLocation - project's absolute path.
 * @param {object} userData - user data.
 * @param {string} gatewayLanguageCode - gateway language code.
 * @param {object} tc - tc.
 */
export const changeToNextContextId = (projectSaveLocation, userData, gatewayLanguageCode, tc) => (dispatch, getState) => {
  const state = getState();
  const contextId = getNextContextId(state)
  if (contextId) {
    dispatch(changeCurrentContextId(contextId, projectSaveLocation, userData, gatewayLanguageCode, tc));
  }
}

/**
 * Sorts an array of chapter strings based on specific rules. Chapters with the prefix "chapter_" followed by a number
 * are sorted numerically based on the number. Entries without the "chapter_" prefix are sorted alphabetically,
 * with entries starting with "chapter_" coming after other entries.
 *
 * @param {string[]} chapters - An array of chapter strings to be sorted.
 * @return {string[]} A new array of sorted chapter strings.
 */
function sortChapters(chapters) {
  return chapters.sort((a, b) => {
    // Check if both start with 'chapter_'
    const aIsChapter = a.startsWith('chapter_');
    const bIsChapter = b.startsWith('chapter_');
    if (aIsChapter && bIsChapter) {
      // Extract the number after the underscore in each chapter string and compare numerically
      const numA = parseInt(a.split('_')[1]);
      const numB = parseInt(b.split('_')[1]);
      return numA - numB;
    } else if (aIsChapter) {
      // If only 'a' starts with 'chapter_', it should come after 'b'
      return 1;
    } else if (bIsChapter) {
      // If only 'b' starts with 'chapter_', it should come before 'a'
      return -1;
    } else {
      // Neither starts with 'chapter_', sort alphabetically
      return a.localeCompare(b);
    }
  });
}

/**
 * @description this action returns the contextId of the next check.
 * @return {object} New state for contextId reducer.
 */
function getNextContextId(state) {
  const currentContextId = getContextId(state) || {}
  let foundMatch = false
  const groupsIndex = getGroupsIndex(state);
  const groupsData = getGroupsData(state);
  let groupsIndexEmpty = groupsIndex.length === 0;
  let chapters = Object.keys(groupsData);
  let groupsDataEmpty = chapters.length === 0;

  if (!groupsIndexEmpty && !groupsDataEmpty) {

    chapters = sortChapters(chapters)
    for (const groupId of chapters) {
      let groupItems = groupsData[groupId] || [];

      for (const item of groupItems) {
        if (foundMatch) { // if previous item was a match, then this item is the next
          return item.contextId
        }

        if (isEqual(item.contextId, currentContextId)) {
          foundMatch = true
        }
      }
    }
  }
  return null;
}

/**
 * Change Context Id action creator
 * @param {object} contextId
 */
export const changeContextId = contextId => ({
  type: CHANGE_CONTEXT_ID,
  contextId,
});

export const clearContextId = () => ({ type: CLEAR_CONTEXT_ID });
