import isEqual from 'deep-equal';
import _ from 'lodash';
import {
  CLEAR_PREVIOUS_GROUPS_DATA,
  LOAD_GROUPS_DATA_FROM_FS,
} from '../actions/actionTypes';

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
