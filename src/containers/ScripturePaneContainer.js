import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ScripturePane } from 'tc-ui-toolkit';
import { getAvailableScripturePaneSelections } from '../utils/resourcesHelpers';
import { getContextId } from '../state/selectors';
import { getLexiconData } from '../utils/lexiconHelpers';

const ScripturePaneContainer = (props) => {
  const {
    tc: {
      settingsReducer: { toolsSettings },
      resourcesReducer: { bibles },
      selectionsReducer: { selections },// TODO: Create a selectionsReducer
      projectDetailsReducer,
      showPopover,
      setToolSettings,
      editTargetVerse,// TODO: Create a local version using the tools redux implementation.
      makeSureBiblesLoadedForTool,
    },
    contextId,
    translate,
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
        editTargetVerse={(chapter, verse, before, after, tags) => {
          editTargetVerse(chapter, verse, before, after, tags, contextId);
        }}
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
    selectionsReducer: PropTypes.object.isRequired,
    projectDetailsReducer: PropTypes.object.isRequired,
    showPopover: PropTypes.func.isRequired,
    editTargetVerse: PropTypes.func.isRequired,
    setToolSettings: PropTypes.func.isRequired,
    makeSureBiblesLoadedForTool: PropTypes.func.isRequired,
  }).isRequired,
  handleModalOpen: PropTypes.func,
};

ScripturePaneContainer.defaultProps = { handleModalOpen: () => {} };

const mapStateToProps = (state) => ({ contextId: getContextId(state) });

export default connect(
  mapStateToProps,
)(ScripturePaneContainer);
