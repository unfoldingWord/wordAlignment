import fs from 'fs-extra';
import { batchActions } from 'redux-batched-actions';
// Helpers
import delay from '../../utils/delay';
import Repo from '../../utils/Repo';
import { findGroupDataItem } from '../../utils/groupDataHelpers';
import { getContextIdPathFromIndex, saveContextId } from '../../utils/contextIdHelpers';
import {
  shiftGroupIndex,
  shiftGroupDataItem,
  visibleGroupItems,
} from '../../utils/navigationHelpers';
import {
  getGroupsIndex,
  getGroupsData,
  getContextId,
  getGroupMenuFilters,
} from '../selectors';
import { loadComments } from './CommentsActions';
import {
  ADD_COMMENT,
  ADD_BOOKMARK,
  CHANGE_CONTEXT_ID,
  CLEAR_CONTEXT_ID,
} from './actionTypes';
import { loadBookmarks } from './BookmarksActions';

/**
 * Loads the latest contextId file from the file system.
 * @param {string} toolName - tool's name.
 * @param {string} bookId - book id code. e.g. tit.
 * @param {string} projectSaveLocation - project's absolute path.
 * @param {object} userData - user data.
 * @param {string} gatewayLanguageCode - gateway language code.
 */
export function loadCurrentContextId(toolName, bookId, projectSaveLocation, userData, gatewayLanguageCode) {
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
            const contextIdExistInGroups = groupsIndex.filter(({ id }) => id === contextId.groupId).length > 0;

            if (contextId && contextIdExistInGroups) {
              return dispatch(changeCurrentContextId(contextId, projectSaveLocation, userData, gatewayLanguageCode));
            }
          } catch (err) {
            // The object is undefined because the file wasn't found in the directory
            console.error('loadCurrentContextId() error reading contextId', err);
          }
        }
        // if we could not read contextId default to first
        contextId = firstContextId(state);
        dispatch(changeCurrentContextId(contextId, projectSaveLocation, userData, gatewayLanguageCode));
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
 */
export const changeCurrentContextId = (contextId = null, projectSaveLocation, userData, gatewayLanguageCode) => (dispatch, getState) => {
  const state = getState();
  contextId = contextId || getContextId(state);
  const groupDataLoaded = changeContextIdInReducers(contextId, dispatch, state);

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

    if (!groupDataLoaded) { // if group data not found, load from file
      dispatch(loadCheckDataOnContextIdChange(contextId, gatewayLanguageCode));
    }

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
 * @description this action changes the contextId to the first check.
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
 * change context ID and load check data in reducers from group data reducer
 * @param {Object} contextId
 * @param {Function} dispatch
 * @param {Object} state
 * @return {Boolean} true if check data found in reducers
 */
function changeContextIdInReducers(contextId, dispatch, state) {
  let oldGroupObject = {};
  const groupsData = getGroupsData(state);

  if (contextId && contextId.groupId) {
    const currentGroupData = groupsData && groupsData[contextId.groupId];

    if (currentGroupData) {
      const index = findGroupDataItem(contextId, currentGroupData);
      oldGroupObject = (index >= 0) ? currentGroupData[index] : null;
    }
  }

  // if check data not found in group data reducer, set to defaults
  const reminders = oldGroupObject['reminders'] || false;
  const comments = oldGroupObject['comments'] || '';
  const actionsBatch = [
    {
      type: CHANGE_CONTEXT_ID,
      contextId,
    },
    {
      type: ADD_BOOKMARK,
      enabled: reminders,
      modifiedTimestamp: '',
      userName: null,
      gatewayLanguageCode: null,
    },
    {
      type: ADD_COMMENT,
      modifiedTimestamp: '',
      text: comments,
      userName: null,
    },
  ];
  dispatch(batchActions(actionsBatch)); // process the batch

  return !!oldGroupObject;
}

export const changeContextId = contextId => ({
  type: CHANGE_CONTEXT_ID,
  contextId,
});

/**
 * Loads CheckData On ContextId Change.
 * @param {object} contextId
 * @param {string} gatewayLanguageCode
 */
const loadCheckDataOnContextIdChange = (contextId, gatewayLanguageCode) => dispatch => {
  const actionsBatch = [];
  actionsBatch.push(loadComments(contextId));
  actionsBatch.push(loadBookmarks(contextId, gatewayLanguageCode));
  dispatch(batchActions(actionsBatch)); // process the batch
};

export const changeToNextContextId = (projectSaveLocation, userData, gatewayLanguageCode) => ((dispatch, getState) => {
  const state = getState();
  const groupsData = getGroupsData(state);
  const groupsIndex = getGroupsIndex(state);
  const filters = getGroupMenuFilters(state);
  let contextId = getContextId(state);

  const nextGroupDataItem = shiftGroupDataItem(1, contextId, groupsData, filters); // get the next groupDataItem

  if (nextGroupDataItem === undefined) { // if it is undefined
    // End of the items in the group, need first of next group
    const nextGroupIndex = shiftGroupIndex(1, contextId, groupsIndex, groupsData, filters);

    if (nextGroupIndex !== undefined) {
      const nextGroupData = groupsData[nextGroupIndex.id]; // get the new groupData for previous group
      const visibleItems = visibleGroupItems(nextGroupData, filters);

      if (visibleItems.length) {
        contextId = visibleItems.shift().contextId;
      }
    }
  } else {
    contextId = nextGroupDataItem.contextId;
  }
  dispatch(changeCurrentContextId(contextId, projectSaveLocation, userData, gatewayLanguageCode));
});

/**
 *
 * @param {*} projectSaveLocation
 * @param {*} userData
 * @param {*} gatewayLanguageCode
 */
export const changeToPreviousContextId = (projectSaveLocation, userData, gatewayLanguageCode) => ((dispatch, getState) => {
  const state = getState();
  const groupsData = getGroupsData(state);
  const groupsIndex = getGroupsIndex(state);
  const filters = getGroupMenuFilters(state);
  let contextId = getContextId(state);
  const prevGroupDataItem = shiftGroupDataItem(-1, contextId, groupsData, filters); // get the prev groupDataItem

  if (prevGroupDataItem === undefined) { // if it is undefined
    // End of the items in the group, need first of previous group
    const prevGroupIndex = shiftGroupIndex(-1, contextId, groupsIndex, groupsData, filters);

    if (prevGroupIndex !== undefined) {
      const prevGroupData = groupsData[prevGroupIndex.id]; // get the new groupData for previous group
      const visibleItems = visibleGroupItems(prevGroupData, filters);

      if (visibleItems.length) {
        contextId = visibleItems.pop().contextId;
      }
    }
  } else {
    contextId = prevGroupDataItem.contextId;
  }
  dispatch(changeCurrentContextId(contextId, projectSaveLocation, userData, gatewayLanguageCode));
});

export const clearContextId = () => ({ type: CLEAR_CONTEXT_ID });
