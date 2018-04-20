/* eslint-disable no-debugger */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import WordList from './WordList/index';
import AlignmentGrid from './AlignmentGrid';
import isEqual from 'deep-equal';
import {disableAlignedWords, getAlignedWords, getWords} from '../utils/words';
import WordMap from 'word-map';

/**
 * The base container for this tool
 */
class Container extends Component {

  constructor(props) {
    super(props);
    this.predictAlignments = this.predictAlignments.bind(this);
    this.updatePredictionEngine = this.updatePredictionEngine.bind(this);
    this.initPredictionEngine = this.initPredictionEngine.bind(this);
    this.handleAddAlignment = this.handleAddAlignment.bind(this);
    this.handleRemoveAlignment = this.handleRemoveAlignment.bind(this);
    this.handlePrimaryAlignment = this.handlePrimaryAlignment.bind(this);
    this.getAvailableAlignmentIndex = this.getAvailableAlignmentIndex.bind(
      this);
  }

  componentWillMount() {
    const {
      wordAlignmentReducer: {alignmentData}
    } = this.props;
    // current panes persisted in the scripture pane settings.
    const {ScripturePane} = this.props.settingsReducer.toolsSettings;
    let panes = [];
    if (ScripturePane) panes = ScripturePane.currentPaneSettings;
    // filter out targetLanguage and bhp
    panes = panes.filter((pane) => {
      return pane.languageId !== 'targetLanguage' && pane.bibleId !== 'bhp' &&
        pane.bibleId !== 'ugnt';
    });
    // getting the last pane from the panes array if it exist otherwise equal to null.
    const lastPane = panes[panes.length - 1] ? panes[panes.length - 1] : null;
    // set the ScripturePane to display targetLanguage and bhp for the word alignment tool from left to right.
    let desiredPanes = [
      {
        languageId: 'targetLanguage',
        bibleId: 'targetBible'
      },
      {
        languageId: 'originalLanguage',
        bibleId: 'ugnt'
      }
    ];
    // if last pane found in previous scripture pane settings then carry it over to new settings in wordAlignment.
    const carryOverPane = lastPane && lastPane.languageId !==
      'targetLanguage' && lastPane.bibleId !== 'bhp' && lastPane.bibleId !==
      'ugnt';
    if (carryOverPane) desiredPanes.push(lastPane);
    // set new pane settings
    this.props.actions.setToolSettings('ScripturePane', 'currentPaneSettings',
      desiredPanes);

    // MAP
    this.map = new WordMap();
    this.initPredictionEngine(alignmentData);
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.contextIdReducer.contextId,
      nextProps.contextIdReducer.contextId)) {
      let page = document.getElementById('AlignmentGrid');
      if (page) page.scrollTop = 0;
    }
  }

  /**
   * Appends new saved alignments to the prediction engine
   * @param alignmentData
   */
  updatePredictionEngine(alignmentData) {
    // TODO: append data to index when new alignments are made
    // we will need to intercept the alignment creation before it
    // goes to tC.
  }

  /**
   * Initializes the prediction engine
   * @param alignmentData
   */
  initPredictionEngine(alignmentData) {
    // TODO: warm the index asynchronously
    for (const chapter of Object.keys(alignmentData)) {
      for (const verse of Object.keys(alignmentData[chapter])) {
        for (const alignment of alignmentData[chapter][verse].alignments) {
          if (alignment.topWords.length && alignment.bottomWords.length) {
            const sourceText = alignment.topWords.map(w => w.word).join(' ');
            const targetText = alignment.bottomWords.map(w => w.word).join(' ');
            this.map.appendSavedAlignmentsString(sourceText, targetText);
          }
        }
      }
    }
  }

  /**
   * Predicts alignments
   * @param primaryVerse - the primary verse text
   * @param secondaryVerse - the secondary verse text
   * @param currentAlignments - a list of existing alignments
   */
  predictAlignments(primaryVerse, secondaryVerse, currentAlignments) {
    const suggestions = this.map.predict(primaryVerse, secondaryVerse);
    for (const p of suggestions[0].predictions) {
      if (p.confidence > 1) {
        // console.log(currentAlignments);
        // console.log(p.toString(), p.source.tokenPosition);

        const alignmentIndex = this.getAvailableAlignmentIndex(p.source,
          currentAlignments);
        if (alignmentIndex >= 0) {
          // TODO: check if the secondary word has already been aligned.
          console.log('valid alignment!', p.toString());
          for (const token of p.target.getTokens()) {
            this.handleAddAlignment(alignmentIndex, {
              alignmentIndex: undefined,
              occurrence: 1, // TODO: get token occurrence
              occurrences: 1, // TODO: get token occurrences
              type: 'bottomWord',
              word: token.toString()
            });
            // TODO: inject suggestions into alignments
          }
        } else {
          // TODO: if all the source words are available but not merged we need to merge them!
        }
      }
    }
  }

  /**
   * Looks for a matching alignment index if it is not already aligned
   * @param sourceToken
   * @param alignments
   * @return {number}
   */
  getAvailableAlignmentIndex(sourceToken, alignments) {
    let pos = 0;
    for (const alignment of alignments) {
      if (pos > sourceToken.tokenPosition) {
        break;
      }
      const numBottomWords = alignment.bottomWords.length;
      const numTopWords = alignment.topWords.length;
      if (numBottomWords === 0 && numTopWords === sourceToken.tokenLength) {
        for (let i = 0; i < numTopWords; i++) {
          // find matching primary word
          if (pos === sourceToken.tokenPosition) {
            // validate text matches
            if (alignment.topWords[i].word !==
              sourceToken.getTokens()[i].toString()) {
              console.error('primary words appear to be out of order.');
            }
            return pos;
          }
          pos++;
        }
      } else {
        // skip primary words that have already been aligned
        pos += numTopWords;
      }
    }
    return -1;
  }

  /**
   * Handles adding secondary words to an alignment
   * @param {number} index - the alignment index
   * @param item - the secondary word to move
   */
  handleAddAlignment(index, item) {
    const {
      actions: {moveWordBankItemToAlignment},
      contextIdReducer: {contextId: {reference: {bookId, chapter}}},
      writeToolData
    } = this.props;
    console.log('add alignment', item);
    writeToolData(`alignments/${bookId}/${chapter}.json`, JSON.stringify({some: 'data'}));

    // TODO: add to map index
    moveWordBankItemToAlignment(index, item);
  }

  /**
   * Handles removing secondary words from an alignment
   * @param item - the secondary word to remove
   */
  handleRemoveAlignment(item) {
    const {actions: {moveBackToWordBank}} = this.props;
    console.log('remove alignment', item);
    // TODO: remove from map index
    moveBackToWordBank(item);
  }

  /**
   * Handles (un)merging primary words
   * @param item - the primary word to move
   * @param {number} previousIndex - the previous alignment index
   * @param {number} nextIndex - the next alignment index
   */
  handlePrimaryAlignment(item, previousIndex, nextIndex) {
    const {actions: {moveTopWordItemToAlignment}} = this.props;
    console.log('remove alignments to primary', item);
    // TODO: remove from map index
    moveTopWordItemToAlignment(item, previousIndex, nextIndex);
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
      scripturePane =
        <ScripturePane projectDetailsReducer={projectDetailsReducer}
                       appLanguage={appLanguage}
                       selectionsReducer={selectionsReducer}
                       currentToolViews={currentToolViews}
                       resourcesReducer={resourcesReducer}
                       contextIdReducer={contextIdReducer}
                       settingsReducer={settingsReducer}
                       actions={actions}/>;
    }

    const {alignmentData} = wordAlignmentReducer;
    const {contextId} = contextIdReducer;
    const {lexicons, bibles: {targetLanguage, originalLanguage}} = resourcesReducer;
    let chapter, verse;
    let words = [];
    if (contextId) {
      chapter = contextId.reference.chapter;
      verse = contextId.reference.verse;

      // parse primary text
      const primaryVerseObjects = originalLanguage['ugnt'][chapter][verse].verseObjects;
      const primaryVerseTextArray = [];
      for (const v of primaryVerseObjects) {
        if (v.type === 'text' || v.type === 'word') {
          primaryVerseTextArray.push(v.text);
        } else if (v.type === 'milestone') {
          for (const child of v.children) {
            if (child.type === 'text' || child.type === 'word') {
              primaryVerseTextArray.push(child.text);
            }
          }
        }
      }
      const primaryVerseText = primaryVerseTextArray.join(' ');

      // parse secondary text words
      const secondaryChapterText = targetLanguage['targetBible'][chapter];
      words = getWords(secondaryChapterText[verse]);
      const alignedWords = getAlignedWords(alignmentData, chapter, verse);
      words = disableAlignedWords(words, alignedWords);

      // pass aligned words to prediction so we can filter those out.
      // tokens in suggestion will need to have occurrence information.
      console.log(alignmentData);
      this.predictAlignments(primaryVerseText, secondaryChapterText[verse],
        alignmentData[chapter][verse].alignments);
    }

    return (
      <div style={{display: 'flex', width: '100%', height: '100%'}}>
        <WordList
          chapter={chapter}
          verse={verse}
          words={words}
          moveBackToWordBank={this.handleRemoveAlignment}
          connectDropTarget={connectDropTarget}
          isOver={isOver}/>
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
                         onAlign={this.handleAddAlignment}
                         onMerge={this.handlePrimaryAlignment}
                         actions={actions}
                         contextId={contextId}/>
        </div>
      </div>
    );
  }
}

Container.propTypes = {
  writeToolData: PropTypes.func.isRequired,
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
