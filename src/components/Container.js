import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import WordList from './WordList/index';
import AlignmentGrid from './AlignmentGrid';
import isEqual from 'deep-equal';
import WordMap from 'word-map';
import Lexer from 'word-map/Lexer';
import {VerseObjectUtils} from 'word-aligner';
import path from 'path-extra';
import Token from 'word-map/structures/Token';
import {
  alignTargetToken,
  clearState,
  indexChapterAlignments,
  moveSourceToken,
  setChapterAlignments,
  setSourceTokens,
  setTargetTokens,
  unalignTargetToken
} from '../state/actions';
import {getAlignedVerseTokens, getVerseAlignments} from '../state/reducers';
import {connect} from 'react-redux';
import {checkVerseForChanges, getUnalignedIndex} from '../utils/alignments';

/**
 * The base container for this tool
 */
class Container extends Component {

  const;

  constructor(props) {
    super(props);
    this.map = new WordMap();
    this.predictAlignments = this.predictAlignments.bind(this);
    this.initMAP = this.initMAP.bind(this);
    this.handleAlignTargetToken = this.handleAlignTargetToken.bind(this);
    this.handleUnalignTargetToken = this.handleUnalignTargetToken.bind(this);
    this.handleAlignPrimaryToken = this.handleAlignPrimaryToken.bind(this);
    this.loadAlignments = this.loadAlignments.bind(this);
  }

  /**
   * Validates the verse data and resets the alignments if needed.
   * @param props
   */
  static validateVerseData(props) {
    const {
      verseAlignments,
      sourceVerse,
      targetVerse
    } = props;
    const {alignmentsInvalid, showDialog} = checkVerseForChanges(
      verseAlignments, sourceVerse, targetVerse);
    if (showDialog && alignmentsInvalid) {
      // TODO: show dialog
    }
    if (alignmentsInvalid) {
      // const blankAlignments = aligner.getBlankAlignmentDataForVerse(sourceVerse, targetVerse);
      // TODO: update the verse alignments
    }
  }

  /**
   * Converts verse objects (as in from the source language verse) into {@link Token}s.
   * @deprecated
   * @param sourceVerse
   */
  static tokenizeVerseObjects(sourceVerse) {
    const tokens = [];
    const completeTokens = []; // includes occurrences
    const occurrences = {};
    let position = 0;
    const words = VerseObjectUtils.getWordList(sourceVerse.verseObjects);
    for (const word of words) {
      if (typeof occurrences[word.text] === 'undefined') {
        occurrences[word.text] = 0;
      }
      occurrences[word.text]++;
      tokens.push(new Token({
        text: word.text,
        strong: (word.strong || word.strongs),
        morph: word.morph,
        lemma: word.lemma,
        position: position,
        occurrence: occurrences[word.text]
      }));
      position++;
    }
    // inject occurrences
    for (const token of tokens) {
      completeTokens.push(new Token({
        text: token.toString(),
        strong: token.strong,
        morph: token.morph,
        lemma: token.lemma,
        position: token.position,
        occurrence: token.occurrence,
        occurrences: occurrences[token.toString()]
      }));
    }
    return completeTokens;
  }

  /**
   * Loads the target language tokens.
   * This is a temporary step when loading the alignment data.
   * Eventually the target verse will be part of the saved alignment data.
   * @deprecated just use {@link loadAlignments}
   * @param {object} props - the component props
   */
  static loadTokens(props) {
    const {
      sourceVerse,
      targetVerse,
      contextId,
      setSourceTokens,
      setTargetTokens
    } = props;
    // TODO: load tokens for the entire book (for map)
    // TODO: at least load tokens for the entire chapter
    // load the tokens being aligned
    if (!contextId) {
      console.error('no context id. skipping tokenizing');
      return;
    }

    const {reference: {chapter, verse}} = contextId;
    const sourceTokens = Container.tokenizeVerseObjects(sourceVerse);
    const targetTokens = Lexer.tokenize(targetVerse);
    setSourceTokens(chapter, verse, sourceTokens);
    setTargetTokens(chapter, verse, targetTokens);

    return sourceTokens;
  }

  /**
   * Checks if the chapter context changed
   * @param prevContext
   * @param nextContext
   * @return {boolean}
   */
  static chapterContextChanged(prevContext, nextContext) {
    if (!prevContext && nextContext) {
      return true;
    }
    if (prevContext && nextContext) {
      const {reference: {bookId: prevBook, chapter: prevChapter}} = prevContext;
      const {reference: {bookId: nextBook, chapter: nextChapter}} = nextContext;
      if (prevBook !== nextBook || prevChapter !== nextChapter) {
        return true;
      }
    }
    return false;
  }

  /**
   * Loads alignment data
   * @param {object} props - the container props
   * @return {Promise}
   */
  async loadAlignments(props) {
    const {
      contextId,
      readGlobalToolData,
      targetChapter,
      sourceChapter,
      indexChapterAlignments
    } = props;

    if (!contextId) {
      console.warn('Missing context id. Alignments not loaded.');
      return;
    }

    const {reference: {bookId, chapter}} = contextId;

    try {
      const dataPath = path.join('alignmentData', bookId, chapter + '.json');
      const data = await readGlobalToolData(dataPath);
      const rawChapterData = JSON.parse(data);
      await indexChapterAlignments(chapter, rawChapterData, sourceChapter,
        targetChapter);
    } catch (e) {
      console.log('failed to read alignment data', e);
      // TODO: reset alignment data to default state
      // we can create a new action that will receive the source and target chapters.
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

    this.loadAlignments(this.props);
  }

  componentWillUnmount() {
    const {clearState} = this.props;
    clearState();
    console.error('un-mounting');
  }

  componentWillReceiveProps(nextProps) {
    const {
      contextId: nextContextId
    } = nextProps;
    const {
      contextId: prevContextId
    } = this.props;

    console.warn('on receive props: context', nextContextId);

    if (!isEqual(prevContextId, nextContextId)) {
      // scroll alignments to top when context changes
      let page = document.getElementById('AlignmentGrid');
      if (page) page.scrollTop = 0;

      if (Container.chapterContextChanged(prevContextId, nextContextId)) {
        this.loadAlignments(nextProps);
      } else {
        Container.loadTokens(nextProps);
      }
      Container.validateVerseData(nextProps);
    }
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
            this.handleAlignTargetToken(alignmentIndex, {
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
   * @param item - the secondary word to move
   * @param {number} nextIndex - the index to which the token will be moved
   * @param {number} [prevIndex=-1] - the index from which the token will be moved
   */
  handleAlignTargetToken(item, nextIndex, prevIndex = -1) {
    const {
      contextId: {reference: {chapter, verse}},
      alignTargetToken,
      unalignTargetToken
      // writeGlobalToolData
    } = this.props;

    let token = token = new Token({
      text: item.word,
      occurrence: item.occurrence,
      occurrences: item.occurrences,
      position: item.position
    });
    if (prevIndex >= 0) {
      unalignTargetToken(chapter, verse, prevIndex, token);
    }
    alignTargetToken(chapter, verse, nextIndex, token);

    // TODO: write files
    // writeGlobalToolData(`alignmentData/${bookId}/${chapter}.json`,
    //   JSON.stringify({some: 'data'}));
  }

  /**
   * Handles removing secondary words from an alignment
   * @param item - the secondary word to remove
   * @param {number} prevIndex - the index from which this token will be moved
   */
  handleUnalignTargetToken(item, prevIndex) {
    const {
      contextId: {reference: {chapter, verse}},
      unalignTargetToken
    } = this.props;

    let token = new Token({
      text: item.word,
      occurrence: item.occurrence,
      occurrences: item.occurrences,
      position: item.position
    });
    unalignTargetToken(chapter, verse, prevIndex, token);

    // console.log('remove alignment', item);
    // TODO: remove from map index
    // moveBackToWordBank(item);
  }

  /**
   * Handles (un)merging primary words
   * @param item - the primary word to move
   * @param {number} prevIndex - the previous alignment index
   * @param {number} nextIndex - the next alignment index
   */
  handleAlignPrimaryToken(item, nextIndex, prevIndex) {
    const {
      moveSourceToken,
      contextId: {reference: {chapter, verse}}
    } = this.props;

    let token = new Token({
      text: item.word,
      occurrence: item.occurrence,
      occurrences: item.occurrences,
      lemma: item.lemma,
      morph: item.morph,
      strong: item.strong,
      position: item.position
    });

    moveSourceToken(chapter, verse, nextIndex, prevIndex, token);

    // const {actions: {moveTopWordItemToAlignment}} = this.props;
    // console.log('remove alignments to primary', item);
    // TODO: remove from map index
    // moveTopWordItemToAlignment(item, prevIndex, nextIndex);
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

    if (!contextId) {
      return null;
    }

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
          moveBackToWordBank={this.handleUnalignTargetToken}
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
                         onAlign={this.handleAlignTargetToken}
                         onMerge={this.handleAlignPrimaryToken}
                         actions={actions}
                         contextId={contextId}/>
        </div>
      </div>
    );
  }
}

Container.contextTypes = {
  store: PropTypes.object.isRequired
};

Container.propTypes = {
  writeGlobalToolData: PropTypes.func.isRequired,
  readGlobalToolData: PropTypes.func.isRequired,
  contextId: PropTypes.object,
  targetVerse: PropTypes.string,
  sourceVerse: PropTypes.object,
  sourceChapter: PropTypes.object,
  targetChapter: PropTypes.object,
  appLanguage: PropTypes.string.isRequired,
  verseAlignments: PropTypes.array.isRequired,
  alignedTokens: PropTypes.array.isRequired,
  alignTargetToken: PropTypes.func.isRequired,
  unalignTargetToken: PropTypes.func.isRequired,
  moveSourceToken: PropTypes.func.isRequired,
  setSourceTokens: PropTypes.func.isRequired,
  setTargetTokens: PropTypes.func.isRequired,
  clearState: PropTypes.func.isRequired,
  setChapterAlignments: PropTypes.func.isRequired,
  indexChapterAlignments: PropTypes.func.isRequired,

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
  alignTargetToken,
  unalignTargetToken,
  moveSourceToken,
  setSourceTokens,
  setTargetTokens,
  setChapterAlignments,
  clearState,
  indexChapterAlignments
});

const mapStateToProps = (state, {contextId}) => {
  if (contextId) {
    const {reference: {chapter, verse}} = contextId;
    return {
      alignedTokens: getAlignedVerseTokens(state, chapter, verse),
      verseAlignments: getVerseAlignments(state, chapter, verse)
    };
  } else {
    return {
      alignedTokens: [],
      verseAlignments: []
    };
  }
};

export default DragDropContext(HTML5Backend)(
  connect(mapStateToProps, mapDispatchToProps)(Container));
