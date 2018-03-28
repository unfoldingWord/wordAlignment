/* eslint-disable no-debugger */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import WordList from './WordList/index';
import AlignmentGrid from './AlignmentGrid';
import isEqual from 'deep-equal';
import {getWords, getAlignedWords, disableAlignedWords} from '../utils/words';

/**
 * The base container for this tool
 */
class Container extends Component {

  componentWillMount() {
    // current panes persisted in the scripture pane settings.
    const {ScripturePane} = this.props.settingsReducer.toolsSettings;
    let panes = [];
    if (ScripturePane) panes = ScripturePane.currentPaneSettings;
    // filter out targetLanguage and bhp
    panes = panes.filter((pane) => {
      return pane.languageId !== "targetLanguage" && pane.bibleId !== "bhp" && pane.bibleId !== "ugnt";
    });
    // getting the last pane from the panes array if it exist otherwise equal to null.
    const lastPane = panes[panes.length - 1] ? panes[panes.length - 1] : null;
    // set the ScripturePane to display targetLanguage and bhp for the word alignment tool from left to right.
    let desiredPanes = [
      {
        languageId: "targetLanguage",
        bibleId: "targetBible"
      },
      {
        languageId: "originalLanguage",
        bibleId: "ugnt"
      }
    ];
    // if last pane found in previous scripture pane settings then carry it over to new settings in wordAlignment.
    const carryOverPane = lastPane && lastPane.languageId !== "targetLanguage" && lastPane.bibleId !== "bhp" && lastPane.bibleId !== "ugnt";
    if (carryOverPane) desiredPanes.push(lastPane);
    // set new pane settings
    this.props.actions.setToolSettings("ScripturePane", "currentPaneSettings", desiredPanes);
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.contextIdReducer.contextId,
        nextProps.contextIdReducer.contextId)) {
      let page = document.getElementById('AlignmentGrid');
      if (page) page.scrollTop = 0;
    }
  }

  render() {
    // Modules not defined within translationWords
    const {
      connectDropTarget,
      isOver,
      actions,
      translate,
      settingsReducer,
      resourcesReducer,
      selectionsReducer,
      contextIdReducer,
      wordAlignmentReducer,
      projectDetailsReducer,
      appLanguage,
      currentToolViews
    } = this.props;
    const {ScripturePane} = currentToolViews;
    let scripturePane = <div/>;
    // populate scripturePane so that when required data is preset that it renders as intended.
    if (Object.keys(this.props.resourcesReducer.bibles).length > 0) {
      scripturePane = <ScripturePane projectDetailsReducer={projectDetailsReducer}
                                     appLanguage={appLanguage}
                                     selectionsReducer={selectionsReducer}
                                     currentToolViews={currentToolViews}
                                     resourcesReducer={resourcesReducer}
                                     contextIdReducer={contextIdReducer}
                                     settingsReducer={settingsReducer}
                                     actions={actions} />;
    }

    const {moveBackToWordBank} = actions;
    const {alignmentData} = wordAlignmentReducer;
    const {contextId} = contextIdReducer;
    const {lexicons, bibles: {targetLanguage}} = resourcesReducer;
    let chapter, verse;
    let words = [];
    if (contextId) {
      chapter = contextId.reference.chapter;
      verse = contextId.reference.verse;

      // parse secondary text words
      const secondaryChapterText = targetLanguage['targetBible'][chapter];
      words = getWords(secondaryChapterText[verse]);
      const alignedWords = getAlignedWords(alignmentData, chapter, verse);
      words = disableAlignedWords(words, alignedWords);
    }

    return (
      <div style={{display: 'flex', width: '100%', height: '100%'}}>
        <WordList
          chapter={chapter}
          verse={verse}
          words={words}
          moveBackToWordBank={moveBackToWordBank}
          connectDropTarget={connectDropTarget}
          isOver={isOver} />
        <div style={{
          flex: 0.8,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%'
        }}>
          {scripturePane}
          <AlignmentGrid alignmentData={alignmentData}
            translate={translate}
            lexicons={lexicons}
            actions={actions}
            contextId={contextId}/>
        </div>
      </div>
    );
  }
}

Container.propTypes = {
  appLanguage: PropTypes.string.isRequired,
  selectionsReducer: PropTypes.object.isRequired,
  projectDetailsReducer: PropTypes.object.isRequired,
  currentToolViews: PropTypes.object.isRequired,
  resourcesReducer: PropTypes.object.isRequired,
  contextIdReducer: PropTypes.object.isRequired,
  settingsReducer: PropTypes.shape({
    toolsSettings: PropTypes.object.required
  }).isRequired,
  wordAlignmentReducer: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  translate: PropTypes.func,
  isOver: PropTypes.bool,
  connectDropTarget: PropTypes.func
};

export default DragDropContext(HTML5Backend)(Container);
