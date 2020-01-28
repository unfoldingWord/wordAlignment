import isEqual from 'deep-equal';
import _ from 'lodash';
import {
  CLEAR_PREVIOUS_GROUPS_DATA,
  SET_BOOKMARKS_IN_GROUPDATA,
  SET_REMINDERS_IN_GROUPDATA,
  SET_INVALIDATION_IN_GROUPDATA,
  LOAD_GROUPS_DATA_FROM_FS,
  TOGGLE_VERSE_EDITS_IN_GROUPDATA,
  TOGGLE_BOOKMARKS_IN_GROUPDATA,
  TOGGLE_COMMENTS_IN_GROUPDATA,
  TOGGLE_SELECTIONS_IN_GROUPDATA,
  TOGGLE_MULTIPLE_VERSE_EDITS_IN_GROUPDATA,
} from '../actions/actionTypes';
import { getToggledGroupData } from '../../utils/groupDataHelpers';

const initialState = {
  groupsData: {},
  loadedFromFileSystem: false,
};

const groupsDataReducer = (state = initialState, action) => {
  switch (action.type) {
  case LOAD_GROUPS_DATA_FROM_FS:
    return {
      ...state,
      groupsData: {
        ...state.groupsData,
        ...action.groupsData,
      },
      loadedFromFileSystem: true,
    };
  case TOGGLE_BOOKMARKS_IN_GROUPDATA:
    return {
      ...state,
      groupsData: {
        ...state.groupsData,
        [action.contextId.groupId]: getToggledGroupData(state, action, 'reminders'),
      },
    };
  case TOGGLE_COMMENTS_IN_GROUPDATA:
    return {
      ...state,
      groupsData: {
        ...state.groupsData,
        [action.contextId.groupId]: getToggledGroupData(state, action, 'comments'),
      },
    };
  case TOGGLE_SELECTIONS_IN_GROUPDATA:
    return {
      ...state,
      groupsData: {
        ...state.groupsData,
        [action.contextId.groupId]: getToggledGroupData(state, action, 'selections'),
      },
    };
  case TOGGLE_VERSE_EDITS_IN_GROUPDATA:
    return {
      ...state,
      groupsData: {
        ...state.groupsData,
        [action.contextId.groupId]: getToggledGroupData(state, action, 'verseEdits'),
      },
    };
  case TOGGLE_MULTIPLE_VERSE_EDITS_IN_GROUPDATA:
    return {
      ...state,
      groupsData: {
        ...state.groupsData,
        [action.groupId]: setMultipleVerseEdits(state, action),
      },
    };
  case SET_INVALIDATION_IN_GROUPDATA:
    return {
      ...state,
      groupsData: {
        ...state.groupsData,
        [action.contextId.groupId]: getToggledGroupData(state, action, 'invalidated'),
      },
    };
  case SET_REMINDERS_IN_GROUPDATA:
  case SET_BOOKMARKS_IN_GROUPDATA:
    return {
      ...state,
      groupsData: {
        ...state.groupsData,
        [action.contextId.groupId]: getToggledGroupData(state, action, 'reminders'),
      },
    };
  case CLEAR_PREVIOUS_GROUPS_DATA:
    return initialState;
  default:
    return state;
  }
};

/**
 * Sets Multiple Verse Edits.
 * @param {Object} state
 * @param {{groupId:String, references:Array, type:String}} action
 * @return {*} updated group data for groupId
 */
function setMultipleVerseEdits(state, action) {
  let groupData = state.groupsData[action.groupId];

  if (!groupData) {
    return groupData;
  }

  const newGroupData = _.cloneDeep(groupData);

  for (let i = 0, l = action.references.length; i < l; i++) {
    const reference = action.references[i];

    for (let k = 0, lGD = newGroupData.length; k < lGD; k++) {
      const item = newGroupData[k];

      if (isEqual(item.contextId.reference, reference)) {
        item.verseEdits = true;
      }
    }
  }
  return newGroupData;
}

export const getGroupsData = (state) =>
  state.groupsData;

export default groupsDataReducer;
