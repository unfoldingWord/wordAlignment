import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import WordList from './components/WordList';
import AlignmentGrid from './components/AlignmentGrid';
import isEqual from 'lodash/isEqual';
import {getWords, getAlignedWords, disableAlignedWords} from './utils/words';

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
      return pane !== 'targetLanguage' && pane !== 'bhp' && pane !== 'ugnt';
    });
    // getting the last pane from the panes array if it exist otherwise equal to null.
    const lastPane = panes[panes.length - 1] ? panes[panes.length - 1] : null;
    // set the ScripturePane to display targetLanguage and bhp for the word alignment tool from left to right.
    let desiredPanes = ['targetLanguage', 'ugnt'];
    // if last pane found in previous scripture pane settings then carry it over to new settings in wordAlignment.
    if (lastPane && lastPane !== 'targetLanguage' && lastPane !== 'bhp' &&
      lastPane !== 'ugnt') desiredPanes.push(lastPane);
    // set new pane settings
    this.props.actions.setToolSettings('ScripturePane', 'currentPaneSettings',
      desiredPanes);
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
    const {ScripturePane} = this.props.currentToolViews;
    let scripturePane = <div/>;
    // populate scripturePane so that when required data is preset that it renders as intended.
    if (Object.keys(this.props.resourcesReducer.bibles).length > 0) {
      scripturePane = <ScripturePane {...this.props} />;
    }

    const {moveBackToWordBank} = this.props.actions;
    const {connectDropTarget, isOver} = this.props;
    const {alignmentData} = this.props.wordAlignmentReducer;
    const {contextId} = this.props.contextIdReducer;
    const {lexicons, bibles: {ugnt, targetLanguage}} = this.props.resourcesReducer;
    let chapter, verse;
    let words = [];
    if (contextId) {
      chapter = contextId.reference.chapter;
      verse = contextId.reference.verse;

      // parse secondary text words
      const secondaryChapterText = targetLanguage[chapter];
      words = getWords(secondaryChapterText[verse]);
      const alignedWords = getAlignedWords(alignmentData, chapter, verse);
      words = disableAlignedWords(words, alignedWords);
    }

    return (
      <div style={{display: 'flex', width: '100%', height: '100%'}}>
        <WordList chapter={chapter}
                  verse={verse}
                  words={words}
                  moveBackToWordBank={moveBackToWordBank}
                  connectDropTarget={connectDropTarget}
                  isOver={isOver}/>
        <div style={{
          flex: 0.8,
          width: '100%',
          height: '100%',
          paddingBottom: '150px'
        }}>
          {scripturePane}
          <AlignmentGrid alignmentData={alignmentData}
                         lexicons={lexicons}
                         actions={this.props.actions}
                         contextId={contextId}/>
        </div>
      </div>
    );
  }
}

Container.propTypes = {
  currentToolViews: PropTypes.object.isRequired,
  resourcesReducer: PropTypes.object.isRequired,
  contextIdReducer: PropTypes.object.isRequired,
  settingsReducer: PropTypes.object.isRequired,
  wordAlignmentReducer: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,

  isOver: PropTypes.bool,
  connectDropTarget: PropTypes.func
};

export default DragDropContext(HTML5Backend)(Container);
