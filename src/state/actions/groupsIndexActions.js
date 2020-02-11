import { loadProjectGroupIndex } from '../../utils/groupsIndexHelpers';
import {
  LOAD_GROUPS_INDEX,
  CLEAR_PREVIOUS_GROUPS_INDEX,
  UPDATE_REFRESH_COUNT_GROUPS_INDEX,
} from './actionTypes';

/**
 * Loads all of the group Ids and group names to the groupsIndexReducer
 * @param {function} translate - locale transtale.
 * @return {object} action object.
 */
export const loadGroupsIndex = (translate) => ((dispatch) => {
  const groupsIndex = loadProjectGroupIndex(translate);

  dispatch({
    type: LOAD_GROUPS_INDEX,
    groupsIndex,
  });
});

export const updateRefreshCount = () => ((dispatch) => {
  dispatch({ type: UPDATE_REFRESH_COUNT_GROUPS_INDEX });
});

/**
 * Clears the GroupsIndexReducer to its inital state.
 */
export const clearGroupsIndex = () => ({ type: CLEAR_PREVIOUS_GROUPS_INDEX });
