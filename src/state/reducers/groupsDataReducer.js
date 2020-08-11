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

export const getGroupsData = (state) =>
  state.groupsData;

export default groupsDataReducer;
