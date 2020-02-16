import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ScripturePane } from 'tc-ui-toolkit';
import { getAvailableScripturePaneSelections } from '../utils/resourcesHelpers';
import {
  getUsername,
  getContextId,
  getSelections,
  getProjectPath,
  getCurrentToolName,
} from '../state/selectors';
import { getLexiconData } from '../utils/lexiconHelpers';
import { editTargetVerse } from '../state/actions/verseEditActions';

const ScripturePaneContainer = (props) => {
  const {
    tc: {
      showPopover,
      setToolSettings,
      projectDetailsReducer,
      makeSureBiblesLoadedForTool,
      resourcesReducer: { bibles },
      settingsReducer: { toolsSettings },
    },
    contextId,
    translate,
    selections,
    editTargetVerse,
    handleModalOpen,
  } = props;

  const currentPaneSettings = (toolsSettings && toolsSettings.ScripturePane)
    ? toolsSettings.ScripturePane.currentPaneSettings
    : [];

  // build the title
  const { target_language, project } = projectDetailsReducer.manifest;
  let expandedScripturePaneTitle = project.name;

  if (target_language && target_language.book && target_language.book.name) {
    expandedScripturePaneTitle = target_language.book.name;
  }

  if (Object.keys(bibles).length > 0 && contextId) {
    return (
      <ScripturePane
        currentPaneSettings={currentPaneSettings}
        contextId={contextId}
        bibles={bibles}
        expandedScripturePaneTitle={expandedScripturePaneTitle}
        showPopover={showPopover}
        editTargetVerse={editTargetVerse}
        projectDetailsReducer={projectDetailsReducer}
        translate={translate}
        getLexiconData={getLexiconData}
        selections={selections}
        setToolSettings={setToolSettings}
        getAvailableScripturePaneSelections={(resourceList) => {
          getAvailableScripturePaneSelections(resourceList, contextId, bibles);
        }}
        makeSureBiblesLoadedForTool={() => makeSureBiblesLoadedForTool(contextId)}
        handleModalOpen={handleModalOpen}
      />
    );
  } else {
    return <div/>;
  }
};

ScripturePaneContainer.propTypes = {
  translate: PropTypes.func.isRequired,
  contextId: PropTypes.object,
  tc: PropTypes.shape({
    settingsReducer: PropTypes.object.isRequired,
    resourcesReducer: PropTypes.object.isRequired,
    projectDetailsReducer: PropTypes.object.isRequired,
    showPopover: PropTypes.func.isRequired,
    setToolSettings: PropTypes.func.isRequired,
    makeSureBiblesLoadedForTool: PropTypes.func.isRequired,
  }).isRequired,
  handleModalOpen: PropTypes.func,
};

ScripturePaneContainer.defaultProps = { handleModalOpen: () => {} };

const mapStateToProps = (state) => ({
  contextId: getContextId(state),
  selections: getSelections(state),
});

const mapDispatchToProps = (dispatch, ownProps) => {
  const {
    tc: {
      showAlert,
      closeAlert,
      updateTargetVerse,
      showIgnorableAlert,
      gatewayLanguageCode,
    },
    toolApi,
    translate,
    gatewayLanguageQuote,
  } = ownProps;
  const username = getUsername(ownProps);
  const currentToolName = getCurrentToolName(ownProps);
  const projectSaveLocation = getProjectPath(ownProps);

  return {
    editTargetVerse: (chapter, verse, before, after, tags) => {
      dispatch(editTargetVerse(chapter, verse, before, after, tags, username, gatewayLanguageCode, gatewayLanguageQuote, projectSaveLocation, currentToolName, translate, showAlert, closeAlert, showIgnorableAlert, updateTargetVerse, toolApi));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ScripturePaneContainer);
