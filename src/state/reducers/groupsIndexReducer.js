import {
  LOAD_GROUPS_INDEX,
  UPDATE_REFRESH_COUNT_GROUPS_INDEX,
  CLEAR_PREVIOUS_GROUPS_INDEX,
} from '../actions/actionTypes';
import { sortIndex } from '../../utils/groupsIndexHelpers';

const initialState = {
  groupsIndex: [],
  loadedFromFileSystem: false,
  refreshCount: 0,
};

const groupsIndexReducer = (state = initialState, action) => {
  switch (action.type) {
  case LOAD_GROUPS_INDEX: {
    return {
      ...state,
      groupsIndex: [...action.groupsIndex].sort(sortIndex),
      loadedFromFileSystem: true,
    };
  }
  case UPDATE_REFRESH_COUNT_GROUPS_INDEX: {
    return {
      ...state,
      refreshCount: state.refreshCount+1,
    };
  }
  case CLEAR_PREVIOUS_GROUPS_INDEX:
    return initialState;
  default:
    return state;
  }
};

export const getGroupsIndex = (state) =>
  state.groupsIndex;

export default groupsIndexReducer;
