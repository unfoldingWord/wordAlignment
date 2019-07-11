import React from 'react';
import PropTypes from 'prop-types';
import {ScripturePane} from 'tc-ui-toolkit';

/**
 * Injects necessary data into the scripture pane.
 * @param props
 * @return {*}
 * @constructor
 */
const ScripturePaneContainer = (props) => {
  const {
    tc: {
      actions: {
        showPopover,
        editTargetVerse,
        getLexiconData,
        setToolSettings,
        getAvailableScripturePaneSelections,
        makeSureBiblesLoadedForTool
      },
      settingsReducer: {toolsSettings},
      resourcesReducer: {bibles},
      selectionsReducer: {selections},
      contextId,
      projectDetailsReducer
    },
    translate,
    handleModalOpen
  } = props;

  const currentPaneSettings = (toolsSettings && toolsSettings.ScripturePane)
    ? toolsSettings.ScripturePane.currentPaneSettings
    : [];

  // build the title
  const {target_language, project} = projectDetailsReducer.manifest;
  let expandedScripturePaneTitle = project.name;
  if (target_language && target_language.book && target_language.book.name) {
    expandedScripturePaneTitle = target_language.book.name;
  }

  if (Object.keys(bibles).length > 0) {
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
        getAvailableScripturePaneSelections={getAvailableScripturePaneSelections}
        makeSureBiblesLoadedForTool={makeSureBiblesLoadedForTool}
        handleModalOpen={handleModalOpen}
      />
    );
  } else {
    return <div/>;
  }
};

ScripturePaneContainer.propTypes = {
  translate: PropTypes.func.isRequired,
  tc: PropTypes.shape({
    actions: {
      showPopover: PropTypes.func.isRequired,
      editTargetVerse: PropTypes.func.isRequired,
      getLexiconData: PropTypes.func.isRequired,
      setToolSettings: PropTypes.func.isRequired,
      getAvailableScripturePaneSelections: PropTypes.func.isRequired,
      makeSureBiblesLoadedForTool: PropTypes.func.isRequired
    },
    settingsReducer: PropTypes.object.isRequired,
    resourcesReducer: PropTypes.object.isRequired,
    selectionsReducer: PropTypes.object.isRequired,
    contextId: PropTypes.object.isRequired,
    projectDetailsReducer: PropTypes.object.isRequired,
  }).isRequired,
  handleModalOpen: PropTypes.func
};

ScripturePaneContainer.defaultProps = {
  handleModalOpen: () => {}
};

export default ScripturePaneContainer;
