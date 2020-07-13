import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ScripturePane } from 'tc-ui-toolkit';
import { getAvailableScripturePaneSelections } from '../utils/resourcesHelpers';
import {
  getContextId,
  getSelections,
} from '../state/selectors';
import { getLexiconData } from '../utils/lexiconHelpers';

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
    complexScriptFonts,
    addObjectPropertyToManifest,
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
        handleModalOpen={handleModalOpen}
        complexScriptFonts={complexScriptFonts}
        addObjectPropertyToManifest={addObjectPropertyToManifest}
        getAvailableScripturePaneSelections={(resourceList) => {
          getAvailableScripturePaneSelections(resourceList, contextId, bibles);
        }}
        makeSureBiblesLoadedForTool={() => makeSureBiblesLoadedForTool(contextId)}
      />
    );
  } else {
    return <div/>;
  }
};

ScripturePaneContainer.propTypes = {
  translate: PropTypes.func.isRequired,
  contextId: PropTypes.object,
  editTargetVerse: PropTypes.func.isRequired,
  tc: PropTypes.shape({
    settingsReducer: PropTypes.object.isRequired,
    resourcesReducer: PropTypes.object.isRequired,
    projectDetailsReducer: PropTypes.object.isRequired,
    showPopover: PropTypes.func.isRequired,
    setToolSettings: PropTypes.func.isRequired,
    makeSureBiblesLoadedForTool: PropTypes.func.isRequired,
  }).isRequired,
  handleModalOpen: PropTypes.func,
  complexScriptFonts: PropTypes.array,
};

ScripturePaneContainer.defaultProps = { handleModalOpen: () => {} };

const mapStateToProps = (state, ownProps) => ({
  contextId: getContextId(state),
  selections: getSelections(state),
  addObjectPropertyToManifest: ownProps.tc.addObjectPropertyToManifest,
});

export default connect( mapStateToProps )(ScripturePaneContainer);
