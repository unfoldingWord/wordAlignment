import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import WordList from './WordList/index';
import AlignmentGrid from './AlignmentGrid';
import isEqual from 'deep-equal';
import WordMap from 'word-map';
import Lexer from 'word-map/Lexer';
import {default as aligner} from 'word-aligner';
import path from 'path-extra';
import {setChapterAlignments} from '../state/actions';
import {getAlignedVerseTokens, getVerseAlignments} from '../state/reducers';
import {connect} from 'react-redux';
import {
  checkVerseForChanges,
  cleanAlignmentData,
  getUnalignedIndex
} from '../utils/alignments';

/**
 * The base container for this tool
 */
class Container extends Component {

  constructor(props) {
    super(props);
    this.map = new WordMap();
    this.predictAlignments = this.predictAlignments.bind(this);
    this.initMAP = this.initMAP.bind(this);
    this.handleAddAlignment = this.handleAddAlignment.bind(this);
    this.handleRemoveAlignment = this.handleRemoveAlignment.bind(this);
    this.handlePrimaryAlignment = this.handlePrimaryAlignment.bind(this);
    this.loadChapterAlignments = this.loadChapterAlignments.bind(this);
  }

  /**
   * Validates the verse data and resets the alignments if needed.
   * @param props
   */
  static validateVerseData(props) {
    const {
      verseAlignments,
      originalVerse,
      targetVerse
    } = props;
    const {alignmentsInvalid, showDialog} = checkVerseForChanges(
      verseAlignments, originalVerse, targetVerse);
    if (showDialog && alignmentsInvalid) {
      // TODO: show dialog
    }
    if (alignmentsInvalid) {
      // const blankAlignments = aligner.getBlankAlignmentDataForVerse(originalVerse, targetVerse);
      // TODO: update the verse alignments
    }
  }

  componentWillMount() {
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

    this.loadChapterAlignments();
    // TODO: then load alignments for the rest of the book so we can index them in map
  }

  componentWillReceiveProps(nextProps) {
    const {
      contextId: nextContextId
    } = nextProps;
    const {
      contextId: prevContextId
    } = this.props;

    if (!isEqual(prevContextId, nextContextId)) {
      // scroll alignments to top when context changes
      let page = document.getElementById('AlignmentGrid');
      if (page) page.scrollTop = 0;
    }

    // load chapter alignment data
    const {reference: {chapter: prevChapter, verse: prevVerse}} = prevContextId;
    const {reference: {chapter: nextChapter, verse: nextVerse}} = nextContextId;
    if (prevChapter !== nextChapter) {
      this.loadChapterAlignments();
    }

    // validate verse data
    if (prevVerse !== nextVerse) {
      Container.validateVerseData(nextProps);
    }
  }

  /**
   * Loads alignment data for a chapter
   * TODO: this needs to be cleaned up a LOT
   * @return {Promise}
   */
  loadChapterAlignments() {
    const {
      contextId: {reference: {bookId, chapter}},
      readGlobalToolData,
      originalVerse,
      setChapterAlignments
    } = this.props;

    return readGlobalToolData(
      path.join('alignmentData', bookId, chapter + '.json')).
      then(async data => {
        const chapterAlignments = JSON.parse(data);
        // TODO: clean alignmentData is temporary migration step.
        await setChapterAlignments(chapter,
          cleanAlignmentData(chapterAlignments));
      }).
      catch(async () => {
        const chapterAlignments = aligner.generateBlankAlignments(
          originalVerse);
        await setChapterAlignments(chapter, chapterAlignments);
      });
  }

  /**
   * Initializes the prediction engine
   * @param alignmentData
   */
  initMAP(alignmentData) {
    // TODO: warm the index asynchronously
    for (const chapter of Object.keys(alignmentData)) {
      for (const verse of Object.keys(alignmentData[chapter])) {
        if (alignmentData[chapter][verse].alignment) {
          for (const alignment of alignmentData[chapter][verse]) {
            if (alignment.topWords.length && alignment.bottomWords.length) {
              const sourceText = alignment.topWords.map(w => w.word).join(' ');
              const targetText = alignment.bottomWords.map(w => w.word).
                join(' ');
              this.map.appendSavedAlignmentsString(sourceText, targetText);
            }
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
        const alignmentIndex = getUnalignedIndex(p.source, currentAlignments);
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
   * Handles adding secondary words to an alignment
   * @param {number} index - the alignment index
   * @param item - the secondary word to move
   */
  handleAddAlignment(index, item) {
    const {
      actions: {moveWordBankItemToAlignment},
      contextId: {reference: {bookId, chapter}},
      targetVerse,
      writeGlobalToolData
    } = this.props;
    console.log('add alignment', item);

    // TODO: get full alignment data
    const alignments = [];

    // remove word from existing alignment
    // if (typeof item.alignmentIndex === 'number') {
    //   delete item.alignmentIndex;
    //   if (alignments[index]) {
    //     alignments[index].bottomWords = alignments[index].bottomWords.filter(
    //       word => {
    //         return !(
    //           word.occurrence === item.occurrence
    //           && word.occurrences === item.occurrences
    //           && word.word === item.word);
    //       });
    //   }
    // }

    // add word to new alignment
    // alignments[index].bottomWords.push(item);
    // alignments[index].bottomWords = aligner.orderAlignments(targetVerse,
    //   alignments[index].bottomWords);

    // console.log('alignments', alignments);
    // TODO: write files
    // writeGlobalToolData(`alignmentData/${bookId}/${chapter}.json`,
    //   JSON.stringify({some: 'data'}));

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
      targetVerse,
      contextId,
      alignedTokens,
      contextIdReducer,
      verseAlignments,
      projectDetailsReducer,
      appLanguage,
      currentToolViews
    } = this.props;
    const {ScripturePane} = currentToolViews;
    let scripturePane = <div/>;
    // populate scripturePane so that when required data is preset that it renders as intended.
    if (Object.keys(resourcesReducer.bibles).length > 0) {
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

    const {lexicons} = resourcesReducer;
    const {reference: {chapter, verse}} = contextId;

    // parse secondary tokens
    let words = Lexer.tokenize(targetVerse);
    words = words.map(word => {
      let isUsed = false;
      for (const token of alignedTokens) {
        if (token.toString() === word.toString()
          && token.occurrence === word.occurrence
          && token.occurrences === word.occurrences) {
          isUsed = true;
          break;
        }
      }
      word.disabled = isUsed;
      return word;
    });

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
          <AlignmentGrid alignments={verseAlignments}
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
  writeGlobalToolData: PropTypes.func.isRequired,
  readGlobalToolData: PropTypes.func.isRequired,
  contextId: PropTypes.object,
  targetVerse: PropTypes.string,
  originalVerse: PropTypes.object,
  appLanguage: PropTypes.string.isRequired,
  setChapterAlignments: PropTypes.func.isRequired,
  verseAlignments: PropTypes.array.isRequired,
  alignedTokens: PropTypes.array.isRequired,

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

const mapDispatchToProps = ({
  setChapterAlignments
});

const mapStateToProps = (state, {contextId}) => {
  const {reference: {chapter, verse}} = contextId;
  return {
    alignedTokens: getAlignedVerseTokens(state, chapter, verse),
    verseAlignments: getVerseAlignments(state, chapter, verse)
  };
};

export default DragDropContext(HTML5Backend)(
  connect(mapStateToProps, mapDispatchToProps)(Container));
