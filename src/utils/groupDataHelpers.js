import isEqual from 'deep-equal';
import { saveGroupsData } from '../utils/localStorage';

/**
 * Loads all of a tool's group data from the project.
 * @param {string} toolName - the name of the tool who's helps will be loaded
 * @param {string} projectDir - the absolute path to the project
 * @param {class} ProjectAPI - ProjectAPI.
 * @returns {*}
 */
export function loadProjectGroupData(toolName, projectDir, ProjectAPI) {
  const project = new ProjectAPI(projectDir);
  return project.getGroupsData(toolName);
}

/**
 * searches groupData for a match for contextId (groupData must be for same groupId)
 * @param {Object} contextId
 * @param {Array} groupData for same groupId as contextId
 * @return {number} - returns index of match or -1
 */
export const findGroupDataItem = (contextId, groupData) => {
  let index = -1;
  const isQuoteString = typeof contextId.quote === 'string';

  for (let i = groupData.length - 1; i >= 0; i--) {
    const grpContextId = groupData[i].contextId;

    if (isSameVerse(grpContextId, contextId) &&
      (grpContextId.occurrence === contextId.occurrence) &&
      (isQuoteString ? (grpContextId.quote === contextId.quote) :
        isEqual(grpContextId.quote, contextId.quote))) {
      index = i;
      break;
    }
  }
  return index;
};

/**
 * make sure context IDs are for same verse.  Optimized over isEqual()
 * @param {Object} contextId1
 * @param {Object} contextId2
 * @return {boolean} returns true if context IDs are for same verse
 */
export function isSameVerse(contextId1, contextId2) {
  return (contextId1.reference.chapter === contextId2.reference.chapter) &&
    (contextId1.reference.verse === contextId2.reference.verse);
}

/**
 * Returns the toggled group data based on the key name passed in.
 * @param {object} state - app store state.
 * @param {object} action - action object being dispatch by the action method.
 * @param {string} key - object key. ex. "comments", "bookmarks", "selections" or "verseEdits".
 */
export const getToggledGroupData = (state, action, key) => {
  let groupData = state.groupsData[action.contextId.groupId];

  if (groupData == undefined) {
    return groupData;
  }

  let index = -1;

  for (let i = 0, l = groupData.length; i < l; i++) {
    if (isEqual(groupData[i].contextId, action.contextId)) {
      index = i;
      break;
    }
  }

  const oldGroupObject = (index >= 0) ? groupData[index] : null;

  if (oldGroupObject) {
    groupData = [...groupData]; // create new array from old one (shallow copy)
    let groupObject = { ...oldGroupObject }; // create new object from old one (shallow copy)
    groupData[index] = groupObject; // replace original object

    switch (key) {
    case 'comments':
      if (action.text.length > 0) {
        groupObject[key] = action.text;
      } else {
        groupObject[key] = false;
      }
      break;
    case 'invalidated':
      if (action.boolean) {
        groupObject[key] = true;
      } else {
        groupObject[key] = false;
      }
      break;
    case 'reminders':
      if (action.boolean) {
        groupObject[key] = action.boolean;
      } else {
        groupObject[key] = !groupData[index][key];
      }
      break;
    case 'selections':
      if (action.selections.length > 0) {
        groupObject[key] = action.selections; // we save the selections for quick invalidation checking
        groupObject['nothingToSelect'] = !!action.nothingToSelect;
      } else {
        groupObject[key] = null;
        groupObject['nothingToSelect'] = !!action.nothingToSelect;
      }
      break;
    default:
      groupObject[key] = true;
      break;
    }
  }

  const { groupsData } = state;
  const { projectSaveLocation } = action;
  const {
    tool: toolName,
    reference: { bookId },
  } = action.contextId;
  const updatedGroupsData = {
    ...groupsData,
    [action.contextId.groupId]: groupData,
  };
  // Persisting groupsData in filesystem
  saveGroupsData(updatedGroupsData, projectSaveLocation, toolName, bookId);

  return groupData;
};

/**
 * Generates a chapter-based group index.
 * Most tools will use a chapter based-index.
 * TODO: do not localize the group name here. Instead localize it as needed. See todo on {@link loadProjectGroupIndex}
 * @param {function} translate - the locale function
 * @param {number} [numChapters=150] - the number of chapters to generate
 * @return {*}
 */
export const generateChapterGroupIndex = (translate, numChapters = 150) => {
  const chapterLocalized = translate('tools.chapter') || 'Chapter';

  return Array(numChapters).fill().map((_, i) => {
    let chapter = i + 1;
    return {
      id: 'chapter_' + chapter,
      name: chapterLocalized + ' ' + chapter,
    };
  });
};
