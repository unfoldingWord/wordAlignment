import * as fromGrouspIndex from './reducers/groupsIndexReducer';
import * as fromGroupsData from './reducers/groupsDataReducer';
import * as fromContextId from './reducers/contextIdReducer';

export const getGroupsIndex = (state) =>
  fromGrouspIndex.getGroupsIndex(state.tool.groupsIndexReducer);

export const getGroupsData = (state) =>
  fromGroupsData.getGroupsData(state.tool.groupsDataReducer);

export const getContextId = (state) =>
  fromContextId.getContext(state.tool.contextIdReducer);

export const getCommentsReducer = (state) =>
  state.tool.commentsReducer;

export const getSelectionsReducer = (state) =>
  state.tool.selectionsReducer;

export const getBookmarksReducer = (state) =>
  state.tool.bookmarksReducer;

export const getSelections = (state) =>
  state.tool.selectionsReducer.selections;

export const getProjectManifest = (ownProps) => ownProps.tc.projectDetailsReducer.manifest;
export const getGatewayLanguageCode = (ownProps) => ownProps.tc.gatewayLanguageCode;
export const getCurrentToolName = (ownProps) => ownProps.tc.currentToolName;
export const getProjectPath = (ownProps) => ownProps.tc.projectSaveLocation;
export const getUserData = (ownProps) => ownProps.tc.loginReducer.userdata;
export const getGatewayLanguageBibles = (ownProps) => ownProps.tc.resourcesReducer.bibles[getGatewayLanguageCode(ownProps)];
export const getBookName = (ownProps) => ownProps.tc.project.getBookName();
export const getResourcesReducer = (ownProps) => ownProps.tc.resourcesReducer;
export const getBibles = (ownProps) => ownProps.tc.resourcesReducer.bibles;
export const getCurrentPaneSettings = (ownProps) => {
  const { ScripturePane } = ownProps.tc.settingsReducer.toolsSettings;
  return ScripturePane ? ScripturePane.currentPaneSettings : [];
};
export const getUsername = (ownProps) => ownProps.tc.username;

/**
 * Returns a chapter in the target language bible
 * @param {object} state
 * @param {object} ownProps
 * @param {number} chapter - the chapter number
 */
export const getTargetChapter = (state, ownProps, chapter) => {
  const contextId = getContextId(state);

  if (!chapter && contextId) {
    const { reference: { chapter: _chapter } } = contextId;
    chapter = _chapter;
  } else if (!chapter && !contextId) {
    return null;
  }

  return ownProps.tc.resourcesReducer.bibles.targetLanguage.targetBible[chapter + ''];
};

/**
 * Returns the currently selected verse in the target language bible
 * @param {object} state
 * @param {object} ownProps
 * @return {*}
 */
export const getSelectedTargetVerse = (state, ownProps) => {
  const contextId = getContextId(state);

  if (!contextId) {
    return null;
  }

  const { reference: { chapter, verse } } = contextId;
  const targetChapter = getTargetChapter(state, ownProps, chapter);

  if (targetChapter) {
    return targetChapter[verse + ''];
  } else {
    return null;
  }
};

/**
 * Returns a chapter in the original language bible
 * @param {object} state
 * @param {object} ownProps
 * @param {number} chapter - the chapter number
 * @return {*}
 */
export const getSourceChapter = (state, ownProps, chapter) => {
  const { sourceBook } = ownProps.tc;
  const contextId = getContextId(state);

  if (!chapter && contextId) {
    const { reference: { chapter: _chapter } } = contextId;
    chapter = _chapter;
  } else if (!chapter && !contextId) {
    return null;
  }

  return sourceBook && sourceBook[chapter + ''];
};

/**
 * Returns the currently selected verse in the original language bible
 * @param {object} state
 * @param {object} ownProps
 * @return {*}
 */
export const getSelectedSourceVerse = (state, ownProps) => {
  const contextId = getContextId(state);

  if (!contextId) {
    return null;
  }

  const { reference: { chapter, verse } } = contextId;
  const sourceChapter = getSourceChapter(state, ownProps, chapter);

  if (sourceChapter) {
    return sourceChapter[verse + ''];
  } else {
    return null;
  }
};
