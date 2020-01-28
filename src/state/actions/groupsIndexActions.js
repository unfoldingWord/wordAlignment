import { loadProjectGroupIndex } from '../../utils/groupsIndexHelpers';
import {
  LOAD_GROUPS_INDEX,
  CLEAR_PREVIOUS_GROUPS_INDEX,
  UPDATE_REFRESH_COUNT_GROUPS_INDEX,
} from './actionTypes';

/**
 * Loads all of the group Ids and group names to the groupsIndexReducer
 * @param {string} gatewayLanguage - gateway Language.
 * @param {string} toolName - tool Name.
 * @param {string} projectDir - project Directory path.
 * @param {function} translate - locale transtale.
 * @return {object} action object.
 */
export const loadGroupsIndex = (gatewayLanguage, toolName, projectDir, translate) => ((dispatch, getState) => {
  const groupsIndex = loadProjectGroupIndex(gatewayLanguage, toolName, projectDir, translate);

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
