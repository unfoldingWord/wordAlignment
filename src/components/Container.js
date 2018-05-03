import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import WordList from './WordList/index';
import AlignmentGrid from './AlignmentGrid';
import isEqual from 'deep-equal';
import WordMap from 'word-map';
import Lexer from 'word-map/Lexer';
import {
  alignTargetToken,
  clearState,
  moveSourceToken,
  setChapterAlignments,
  setSourceTokens,
  setTargetTokens,
  unalignTargetToken,
  loadChapterAlignments
} from '../state/actions';
import {
  getAlignedVerseTokens,
  getVerseAlignments,
  getIsVerseValid
} from '../state/reducers';
import {connect} from 'react-redux';
import {tokenizeVerseObjects} from '../utils/verseObjects';
import Token from 'word-map/structures/Token';

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
      loadChapterAlignments
    } = props;

    if (!contextId) {
      console.warn('Missing context id. Alignments not loaded.');
      return;
    }

    const {reference: {bookId, chapter}} = contextId;

    try {
      await loadChapterAlignments(readGlobalToolData, bookId, chapter);
      Container.validate(props);
    } catch (e) {
      console.error('The alignment data is corrupt', e);
      // TODO: reset alignment data to default state
      // we can create a new action that will receive the source and target chapters
      // for generating the new alignments.
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

    if (!isEqual(prevContextId, nextContextId)) {
      // scroll alignments to top when context changes
      let page = document.getElementById('AlignmentGrid');
      if (page) page.scrollTop = 0;

      if (Container.chapterContextChanged(prevContextId, nextContextId)) {
        this.loadAlignments(nextProps);
        // TODO: this should trigger a loading state so we know to wait for certain things until we are ready.
        // maybe display some nice loading animation.
      }
    }

    Container.validate(nextProps);
  }

  static validate(props) {
    const {
      verseIsValid,
      alignedTokens,
      verseAlignments,
      sourceTokens,
      targetTokens,
      setSourceTokens,
      setTargetTokens,
      contextId
    } = props;
    // TRICKY: if there are no verse alignments the data has not been loaded yet.
    if(!verseIsValid && verseAlignments.length) {
      const {reference: {chapter, verse}} = contextId;
      if(alignedTokens.length) {
        // update alignment tokens and reset alignments
        // TODO: notify the user
        console.error('The verse is invalid',
          'We need to reset all alignments and tokens');
      } else {
        // update alignment tokens
        setSourceTokens(chapter, verse, sourceTokens);
        setTargetTokens(chapter, verse, targetTokens);
      }
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
   * @param [currentAlignments] - a list of existing alignments
   */
  predictAlignments(primaryVerse, secondaryVerse) {
    const suggestions = this.map.predict(primaryVerse, secondaryVerse);
    for (const p of suggestions[0].predictions) {
      if (p.confidence > 1) {
        // TODO:  find the unused alignment index
        const alignmentIndex = -1;
        if (alignmentIndex >= 0) {
          // TODO: check if the secondary word has already been aligned.
          console.log('valid alignment!', p.toString());
          for (const token of p.target.getTokens()) {
            this.handleAlignTargetToken(alignmentIndex, {
              alignmentIndex: undefined,
              occurrence: 1, // TODO: get token occurrence
              occurrences: 1, // TODO: get token occurrences
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
   * @param {Token} token - the secondary word to move
   * @param {number} nextIndex - the index to which the token will be moved
   * @param {number} [prevIndex=-1] - the index from which the token will be moved
   */
  handleAlignTargetToken(token, nextIndex, prevIndex = -1) {
    console.log('aligning token', token);
    const {
      contextId: {reference: {chapter, verse}},
      alignTargetToken,
      unalignTargetToken
      // writeGlobalToolData
    } = this.props;
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
   * @param {Token} token - the secondary word to remove
   * @param {number} prevIndex - the index from which this token will be moved
   */
  handleUnalignTargetToken(token, prevIndex) {
    console.log('un-aligning token', token);
    const {
      contextId: {reference: {chapter, verse}},
      unalignTargetToken
    } = this.props;
    unalignTargetToken(chapter, verse, prevIndex, token);
    // TODO: write files
  }

  /**
   * Handles (un)merging primary words
   * @param {Token} token - the primary word to move
   * @param {number} prevIndex - the previous alignment index
   * @param {number} nextIndex - the next alignment index
   */
  handleAlignPrimaryToken(token, nextIndex, prevIndex) {
    console.log('aligning primary token', token);
    const {
      moveSourceToken,
      contextId: {reference: {chapter, verse}}
    } = this.props;
    moveSourceToken({chapter, verse, nextIndex, prevIndex, token});
    // TODO: write files
  }

  componentWillUpdate() {

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
      targetTokens,
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

    // disabled aligned target tokens
    console.log('aligned tokens', alignedTokens);
    const words = targetTokens.map(token => {
      let isUsed = false;
      for (const usedToken of alignedTokens) {
        if (token.toString() === usedToken.toString()
          && token.occurrence === usedToken.occurrence
          && token.occurrences === usedToken.occurrences) {
          isUsed = true;
          break;
        }
      }
      token.disabled = isUsed;
      return token;
    });

    return (
      <div style={{display: 'flex', width: '100%', height: '100%'}}>
        <WordList
          chapter={chapter}
          verse={verse}
          words={words}
          onDropTargetToken={this.handleUnalignTargetToken}
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
                         onDropTargetToken={this.handleAlignTargetToken}
                         onDropSourceToken={this.handleAlignPrimaryToken}
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
  targetVerseText: PropTypes.string,
  targetTokens: PropTypes.arrayOf(PropTypes.instanceOf(Token)).isRequired,
  sourceVerse: PropTypes.object,
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
  verseIsValid: PropTypes.bool.isRequired,

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
  loadChapterAlignments
});

const mapStateToProps = (state, {contextId, targetVerseText, sourceVerse}) => {
  if (contextId) {
    const {reference: {chapter, verse}} = contextId;
    // TRICKY: the target verse contains punctuation we need to remove
    const targetTokens = Lexer.tokenize(targetVerseText);
    const sourceTokens = tokenizeVerseObjects(sourceVerse.verseObjects);
    const normalizedSourceVerseText = sourceTokens.map(t=>t.toString()).join(' ');
    const normalizedTargetVerseText = targetTokens.map(t=>t.toString()).join(' ');
    return {
      targetTokens,
      sourceTokens,
      alignedTokens: getAlignedVerseTokens(state, chapter, verse),
      verseAlignments: getVerseAlignments(state, chapter, verse),
      verseIsValid: getIsVerseValid(state, chapter, verse, normalizedSourceVerseText, normalizedTargetVerseText)
    };
  } else {
    return {
      targetTokens: [],
      sourceTokens: [],
      alignedTokens: [],
      verseAlignments: [],
      verseIsValid: true
    };
  }
};

export default DragDropContext(HTML5Backend)(
  connect(mapStateToProps, mapDispatchToProps)(Container));
