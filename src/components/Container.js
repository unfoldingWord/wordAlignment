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
  acceptAlignmentSuggestions,
  acceptTokenSuggestion,
  alignTargetToken,
  clearAlignmentSuggestions,
  clearState,
  moveSourceToken,
  removeTokenSuggestion,
  repairVerse,
  resetVerse,
  setAlignmentPredictions,
  unalignTargetToken
} from '../state/actions';
import {
  getIsVerseValid,
  getRenderedVerseAlignedTargetTokens,
  getRenderedVerseAlignments,
  getChapterAlignments,
} from '../state/reducers';
import {connect} from 'react-redux';
import {tokenizeVerseObjects} from '../utils/verseObjects';
import {sortPanesSettings} from '../utils/panesSettingsHelper';
import Token from 'word-map/structures/Token';
import MAPControls from './MAPControls';
import GroupMenuContainer from '../containers/GroupMenuContainer';
import ScripturePaneContainer from '../containers/ScripturePaneContainer';
import MissingBibleError from './MissingBibleError';
import Api from '../Api';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    width: '100vw',
    height: 'var(--tool-max-height)'
  },
  groupMenuContainer: {
    width: '250px',
    height: '100%'
  },
  wordListContainer: {
    width: '160px',
    height: '100%'
  },
  alignmentAreaContainer: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    width: 'calc(100vw - 410px)',
    height: '100%'
  },
  scripturePaneWrapper: {
    height: '250px',
    marginBottom: '20px'
  }
};

/**
 * The base container for this tool
 */
class Container extends Component {

  constructor(props) {
    super(props);
    this.map = new WordMap();
    this.predictAlignments = this.predictAlignments.bind(this);
    this.runMAP = this.runMAP.bind(this);
    this.initMAP = this.initMAP.bind(this);
    this.handleAlignTargetToken = this.handleAlignTargetToken.bind(this);
    this.handleUnalignTargetToken = this.handleUnalignTargetToken.bind(this);
    this.handleAlignPrimaryToken = this.handleAlignPrimaryToken.bind(this);
    this.handleRefreshSuggestions = this.handleRefreshSuggestions.bind(this);
    this.handleAcceptSuggestions = this.handleAcceptSuggestions.bind(this);
    this.handleRejectSuggestions = this.handleRejectSuggestions.bind(this);
    this.handleRemoveSuggestion = this.handleRemoveSuggestion.bind(this);
    this.handleAcceptTokenSuggestion = this.handleAcceptTokenSuggestion.bind(
      this);
    this.getLabeledTargetTokens = this.getLabeledTargetTokens.bind(this);
    this.state = {
      loading: false,
      validating: false,
      prevState: undefined,
      writing: false
    };
  }

  componentWillMount() {
    // current panes persisted in the scripture pane settings.
    const {actions: {setToolSettings}, settingsReducer, resourcesReducer: {bibles}} = this.props;
    const {ScripturePane} = settingsReducer.toolsSettings || {};
    const currentPaneSettings = ScripturePane &&
    ScripturePane.currentPaneSettings ?
      ScripturePane.currentPaneSettings : [];

    sortPanesSettings(currentPaneSettings, setToolSettings, bibles);

    this.runMAP(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const {
      tc: {
        contextId: nextContextId
      }
    } = nextProps;
    const {
      tc: {contextId: prevContextId}
    } = this.props;

    if (!isEqual(prevContextId, nextContextId)) {
      // scroll alignments to top when context changes
      let page = document.getElementById('AlignmentGrid');
      if (page) page.scrollTop = 0;

      this.runMAP(nextProps);
    }
  }

  runMAP(props) {
    const {
      hasSourceText
    } = props;
    if (hasSourceText) {
      return this.initMAP(props).then(() => {
        return this.predictAlignments(props);
      });
    }
  }

  /**
   * Initializes the prediction engine
   * @param props
   */
  initMAP(props) {
    const {
      tc: {
        contextId: {reference: {verse: selectedVerse}},
        targetBible
      }
    } = props;

    const {store} = this.context;
    return new Promise(resolve => {
      setTimeout(() => {
        const map = new WordMap();
        const state = store.getState();
        for (const chapter of Object.keys(targetBible)) {
          const chapterAlignments = getChapterAlignments(state, chapter);
          for (const verse of Object.keys(chapterAlignments)) {
            if (parseInt(verse) === selectedVerse) {
              // exclude current verse from saved alignments
              continue;
            }
            for (const a of chapterAlignments[verse]) {
              if (a.sourceNgram.length && a.targetNgram.length) {
                const sourceText = a.sourceNgram.map(t => t.toString()).join(' ');
                const targetText = a.targetNgram.map(t => t.toString()).join(' ');
                map.appendSavedAlignmentsString(sourceText, targetText);
              }
            }
          }
        }
        this.map = map;
        resolve(map);
      }, 0);

    });

  }

  /**
   * Predicts alignments
   */
  predictAlignments(props) {
    const {
      normalizedTargetVerseText,
      normalizedSourceVerseText,
      setAlignmentPredictions,
      tc: {contextId: {reference: {chapter, verse}}}
    } = props;
    return new Promise(resolve => {
      const suggestions = this.map.predict(normalizedSourceVerseText,
        normalizedTargetVerseText);
      if (suggestions[0]) {
        setAlignmentPredictions(chapter, verse, suggestions[0].predictions);
      }
      resolve();
    });
  }

  /**
   * Handles adding secondary words to an alignment
   * @param {Token} token - the secondary word to move
   * @param {object} nextAlignmentIndex - the alignment to which the token will be moved
   * @param {object} [prevAlignmentIndex=null] - the alignment from which the token will be removed.
   */
  handleAlignTargetToken(token, nextAlignmentIndex, prevAlignmentIndex = null) {
    const {
      tc: {contextId: {reference: {chapter, verse}}},
      alignTargetToken,
      unalignTargetToken
    } = this.props;
    if (prevAlignmentIndex && prevAlignmentIndex >= 0) {
      unalignTargetToken(chapter, verse, prevAlignmentIndex, token);
    }
    alignTargetToken(chapter, verse, nextAlignmentIndex, token);
  }

  /**
   * Handles removing secondary words from an alignment
   * @param {Token} token - the secondary word to remove
   * @param {object} prevAlignmentIndex - the alignment from which the token will be removed.
   */
  handleUnalignTargetToken(token, prevAlignmentIndex) {
    const {
      tc: {contextId: {reference: {chapter, verse}}},
      unalignTargetToken
    } = this.props;
    unalignTargetToken(chapter, verse, prevAlignmentIndex, token);
  }

  /**
   * Handles (un)merging primary words
   * @param {Token} token - the primary word to move
   * @param {object} nextAlignmentIndex - the alignment to which the token will be moved.
   * @param {object} prevAlignmentIndex - the alignment from which the token will be removed.
   */
  handleAlignPrimaryToken(token, nextAlignmentIndex, prevAlignmentIndex) {
    const {
      moveSourceToken,
      tc: {contextId: {reference: {chapter, verse}}}
    } = this.props;
    moveSourceToken(chapter, verse, nextAlignmentIndex, prevAlignmentIndex,
      token);
  }

  handleRefreshSuggestions() {
    this.runMAP(this.props);
  }

  handleAcceptSuggestions() {
    const {
      acceptAlignmentSuggestions,
      tc: {contextId: {reference: {chapter, verse}}}
    } = this.props;
    acceptAlignmentSuggestions(chapter, verse);
  }

  handleRejectSuggestions() {
    const {
      clearAlignmentSuggestions,
      tc: {contextId: {reference: {chapter, verse}}}
    } = this.props;
    clearAlignmentSuggestions(chapter, verse);
  }

  handleRemoveSuggestion(alignmentIndex, token) {
    const {
      removeTokenSuggestion,
      tc: {contextId: {reference: {chapter, verse}}}
    } = this.props;
    removeTokenSuggestion(chapter, verse, alignmentIndex, token);
  }

  handleAcceptTokenSuggestion(alignmentIndex, token) {
    const {
      acceptTokenSuggestion,
      tc: {contextId: {reference: {chapter, verse}}}
    } = this.props;
    acceptTokenSuggestion(chapter, verse, alignmentIndex, token);
  }

  /**
   * Returns the target tokens with used tokens labeled as disabled
   * @return {*}
   */
  getLabeledTargetTokens() {
    const {
      targetTokens,
      alignedTokens
    } = this.props;
    return targetTokens.map(token => {
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
  }

  render() {
    const {
      connectDropTarget,
      isOver,
      hasSourceText,
      actions,
      toolApi,
      translate,
      resourcesReducer,
      verseAlignments,
      tc: {
        contextId
      },
      tc
    } = this.props;

    if (!contextId) {
      return null;
    }

    const {lexicons} = resourcesReducer;
    const {reference: {chapter, verse}} = contextId;

    // TRICKY: do not show word list if there is no source bible.
    let words = [];
    if (hasSourceText) {
      words = this.getLabeledTargetTokens();
    }

    return (
      <div style={styles.container}>
        <GroupMenuContainer tc={tc} toolApi={toolApi} translate={translate}/>
        <div style={styles.wordListContainer}>
          <WordList
            chapter={chapter}
            verse={verse}
            words={words}
            onDropTargetToken={this.handleUnalignTargetToken}
            connectDropTarget={connectDropTarget}
            isOver={isOver}/>
        </div>
        <div style={styles.alignmentAreaContainer}>
          <div style={styles.scripturePaneWrapper}>
            <ScripturePaneContainer {...this.props}/>
          </div>
          {hasSourceText ? (
            <AlignmentGrid
              alignments={verseAlignments}
              translate={translate}
              lexicons={lexicons}
              onDropTargetToken={this.handleAlignTargetToken}
              onDropSourceToken={this.handleAlignPrimaryToken}
              onCancelSuggestion={this.handleRemoveSuggestion}
              onAcceptTokenSuggestion={this.handleAcceptTokenSuggestion}
              actions={actions}
              contextId={contextId}/>
          ) : (
            <MissingBibleError translate={translate}/>
          )}
          <MAPControls onAccept={this.handleAcceptSuggestions}
                       onRefresh={this.handleRefreshSuggestions}
                       onReject={this.handleRejectSuggestions}
                       translate={translate}/>
        </div>
      </div>
    );
  }
}

Container.contextTypes = {
  store: PropTypes.any.isRequired
};

Container.propTypes = {
  tc: PropTypes.shape({
    writeProjectData: PropTypes.func.isRequired,
    readProjectData: PropTypes.func.isRequired,
    showDialog: PropTypes.func.isRequired,
    showLoading: PropTypes.func.isRequired,
    closeLoading: PropTypes.func.isRequired,

    targetVerseText: PropTypes.string,
    contextId: PropTypes.object,
    sourceVerse: PropTypes.object,
    sourceChapter: PropTypes.object.isRequired,
    targetChapter: PropTypes.object.isRequired,
    appLanguage: PropTypes.string.isRequired
  }).isRequired,
  toolIsReady: PropTypes.bool.isRequired,

  toolApi: PropTypes.instanceOf(Api),

  // dispatch props
  acceptTokenSuggestion: PropTypes.func.isRequired,
  removeTokenSuggestion: PropTypes.func.isRequired,
  alignTargetToken: PropTypes.func.isRequired,
  unalignTargetToken: PropTypes.func.isRequired,
  moveSourceToken: PropTypes.func.isRequired,
  clearState: PropTypes.func.isRequired,
  resetVerse: PropTypes.func.isRequired,
  repairVerse: PropTypes.func.isRequired,
  setAlignmentPredictions: PropTypes.func.isRequired,
  clearAlignmentSuggestions: PropTypes.func.isRequired,
  acceptAlignmentSuggestions: PropTypes.func.isRequired,

  // state props
  sourceTokens: PropTypes.arrayOf(PropTypes.instanceOf(Token)).isRequired,
  targetTokens: PropTypes.arrayOf(PropTypes.instanceOf(Token)).isRequired,
  verseAlignments: PropTypes.array.isRequired,
  alignedTokens: PropTypes.array.isRequired,
  verseIsValid: PropTypes.bool.isRequired,
  normalizedTargetVerseText: PropTypes.string.isRequired,
  normalizedSourceVerseText: PropTypes.string.isRequired,
  hasSourceText: PropTypes.bool.isRequired,

  // tc-tool props
  translate: PropTypes.func,

  // drag props
  isOver: PropTypes.bool,
  connectDropTarget: PropTypes.func,

  // old properties
  selectionsReducer: PropTypes.object.isRequired,
  projectDetailsReducer: PropTypes.object.isRequired,
  currentToolViews: PropTypes.object.isRequired,
  resourcesReducer: PropTypes.object.isRequired,
  contextIdReducer: PropTypes.object.isRequired,
  settingsReducer: PropTypes.shape({
    toolsSettings: PropTypes.object.required
  }).isRequired,
  actions: PropTypes.object.isRequired,
};

const mapDispatchToProps = ({
  alignTargetToken,
  unalignTargetToken,
  moveSourceToken,
  resetVerse,
  repairVerse,
  clearState,
  acceptTokenSuggestion,
  removeTokenSuggestion,
  acceptAlignmentSuggestions,
  setAlignmentPredictions,
  clearAlignmentSuggestions
});

const mapStateToProps = (state, props) => {
  const {tc: {contextId, targetVerseText, sourceVerse}} = props;
  const {reference: {chapter, verse}} = contextId;
  // TRICKY: the target verse contains punctuation we need to remove
  const targetTokens = Lexer.tokenize(targetVerseText);
  const sourceTokens = tokenizeVerseObjects(sourceVerse.verseObjects);
  const normalizedSourceVerseText = sourceTokens.map(t => t.toString()).
    join(' ');
  const normalizedTargetVerseText = targetTokens.map(t => t.toString()).
    join(' ');
  return {
    hasSourceText: normalizedSourceVerseText !== '',
    targetTokens,
    sourceTokens,
    alignedTokens: getRenderedVerseAlignedTargetTokens(state, chapter, verse),
    verseAlignments: getRenderedVerseAlignments(state, chapter, verse),
    verseIsValid: getIsVerseValid(state, chapter, verse,
      normalizedSourceVerseText, normalizedTargetVerseText),
    normalizedTargetVerseText,
    normalizedSourceVerseText
  };
};

export default DragDropContext(HTML5Backend)(
  connect(mapStateToProps, mapDispatchToProps)(Container));
