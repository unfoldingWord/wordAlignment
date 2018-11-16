import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import WordList from './WordList/index';
import AlignmentGrid from './AlignmentGrid';
import isEqual from 'deep-equal';
import WordMap from 'wordmap';
import Lexer, {Token} from 'wordmap-lexer';
import Snackbar from 'material-ui/Snackbar';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {
  acceptAlignmentSuggestions,
  acceptTokenSuggestion,
  alignTargetToken,
  clearAlignmentSuggestions,
  clearState,
  moveSourceToken,
  removeTokenSuggestion,
  resetVerse,
  setAlignmentPredictions,
  unalignTargetToken
} from '../state/actions';
import {
  getChapterAlignments,
  getIsVerseAligned,
  getIsVerseAlignmentsValid,
  getRenderedVerseAlignedTargetTokens,
  getRenderedVerseAlignments,
  getVerseHasRenderedSuggestions
} from '../state/reducers';
import {connect} from 'react-redux';
import {tokenizeVerseObjects} from '../utils/verseObjects';
import {sortPanesSettings} from '../utils/panesSettingsHelper';
import {removeUsfmMarkers} from '../utils/usfmHelpers';
import MAPControls from './MAPControls';
import GroupMenuContainer from '../containers/GroupMenuContainer';
import ScripturePaneContainer from '../containers/ScripturePaneContainer';
import MissingBibleError from './MissingBibleError';
import Api from '../Api';
import {batchActions} from 'redux-batched-actions';

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
 * Generates an indexed word map
 * @param targetBook
 * @param state
 * @param {number} currentChapter
 * @param {number} currentVerse
 * @return {Promise<WordMap>}
 */
export const generateMAP = (
  targetBook, state, currentChapter, currentVerse) => {
  return new Promise(resolve => {
    setTimeout(() => {
      // TODO: determine the maximum require target ngram length from the alignment memory before creating the map
      const map = new WordMap({targetNgramLength: 5});
      for (const chapter of Object.keys(targetBook)) {
        const chapterAlignments = getChapterAlignments(state, chapter);
        for (const verse of Object.keys(chapterAlignments)) {
          if (parseInt(verse) === currentVerse && parseInt(chapter) ===
            currentChapter) {
            // exclude current verse from saved alignments
            continue;
          }
          for (const a of chapterAlignments[verse]) {
            if (a.sourceNgram.length && a.targetNgram.length) {
              const sourceText = a.sourceNgram.map(t => t.toString()).join(' ');
              const targetText = a.targetNgram.map(t => t.toString()).join(' ');
              map.appendAlignmentMemoryString(sourceText, targetText);
            }
          }
        }
      }
      resolve(map);
    }, 0);
  });
};

/**
 * Returns predictions based on the word map
 * @param {WordMap} map
 * @param sourceVerseText
 * @param targetVerseText
 * @return {Promise<any>}
 */
export const getPredictions = (map, sourceVerseText, targetVerseText) => {
  return new Promise(resolve => {
    setTimeout(() => {
      const suggestions = map.predict(sourceVerseText, targetVerseText);
      if (suggestions[0]) {
        resolve(suggestions[0].predictions);
      }
      resolve();
    }, 0);
  });
};

/**
 * The base container for this tool
 */
class Container extends Component {

  constructor(props) {
    super(props);
    this.map = new WordMap();
    this.updatePredictions = this.updatePredictions.bind(this);
    this.runMAP = this.runMAP.bind(this);
    this.initMAP = this.initMAP.bind(this);
    this.handleAlignTargetToken = this.handleAlignTargetToken.bind(this);
    this.handleUnalignTargetToken = this.handleUnalignTargetToken.bind(this);
    this.handleAlignPrimaryToken = this.handleAlignPrimaryToken.bind(this);
    this.handleRefreshSuggestions = this.handleRefreshSuggestions.bind(this);
    this.handleAcceptSuggestions = this.handleAcceptSuggestions.bind(this);
    this.handleRejectSuggestions = this.handleRejectSuggestions.bind(this);
    this.handleRemoveSuggestion = this.handleRemoveSuggestion.bind(this);
    this.handleToggleComplete = this.handleToggleComplete.bind(this);
    this.enableAutoComplete = this.enableAutoComplete.bind(this);
    this.disableAutoComplete = this.disableAutoComplete.bind(this);
    this._getIsComplete = this._getIsComplete.bind(this);
    this.handleAcceptTokenSuggestion = this.handleAcceptTokenSuggestion.bind(
      this);
    this.getLabeledTargetTokens = this.getLabeledTargetTokens.bind(this);
    this.handleSnackbarClose = this.handleSnackbarClose.bind(this);
    this.state = {
      loading: false,
      validating: false,
      prevState: undefined,
      writing: false,
      snackText: null,
      canAutoComplete: false
    };
  }

  handleSnackbarClose() {
    this.setState({
      snackText: null
    });
  }

  UNSAFE_componentWillMount() {
    // current panes persisted in the scripture pane settings.
    const {actions: {setToolSettings}, settingsReducer, resourcesReducer: {bibles}} = this.props;
    const {ScripturePane} = settingsReducer.toolsSettings || {};
    const currentPaneSettings = ScripturePane &&
    ScripturePane.currentPaneSettings ?
      ScripturePane.currentPaneSettings : [];

    sortPanesSettings(currentPaneSettings, setToolSettings, bibles);

    this.runMAP(this.props).catch(() => {
    });
  }

  componentDidUpdate(prevProps) {
    const {
      verseIsAligned,
      verseIsComplete
    } = this.props;

    const {canAutoComplete} = this.state;

    if (!Container.contextDidChange(this.props, prevProps)) {
      // auto complete the verse
      if (verseIsAligned && canAutoComplete && !verseIsComplete) {
        this.handleToggleComplete(null, true);
      }
    }
  }

  /**
   * Checks if the context has changed. e.g. the user navigated away from the previous context.
   * @param nextProps
   * @param prevProps
   * @return {boolean}
   */
  static contextDidChange(nextProps, prevProps) {
    return !isEqual(prevProps.tc.contextId, nextProps.tc.contextId);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const {
      tc: {
        contextId: nextContextId
      },
      tool: {
        api
      }
    } = nextProps;

    const {reference: {chapter, verse}} = nextContextId;

    api.setVerseInvalid(chapter, verse, false);

    if (Container.contextDidChange(nextProps, this.props)) {
      // scroll alignments to top when context changes
      let page = document.getElementById('AlignmentGrid');
      if (page) page.scrollTop = 0;

      this.runMAP(nextProps).catch(() => {
      });
      this.disableAutoComplete();
    }
  }

  runMAP(props) {
    const {
      hasSourceText,
      hasTargetText
    } = props;
    if (hasSourceText && hasTargetText) {
      return this.initMAP(props).then(map => {
        this.map = map;
        return this.updatePredictions(props);
      });
    } else {
      return Promise.reject();
    }
  }

  /**
   * Initializes the prediction engine
   * @param props
   */
  initMAP(props) {
    const {
      tc: {
        contextId: {reference: {chapter, verse}},
        targetBible,
        tools
      }
    } = props;

    const {store} = this.context;
    const state = store.getState();
    return generateMAP(targetBible, state, chapter, verse).then(map => {
      for (const key of Object.keys(tools)) {
        const alignmentMemory = tools[key].trigger('getAlignmentMemory');
        if (alignmentMemory) {
          for (const alignment of alignmentMemory) {
            map.appendAlignmentMemoryString(alignment.sourceText,
              alignment.targetText);
          }
        }
      }
      return Promise.resolve(map);
    });
  }

  /**
   * Predicts alignments
   */
  updatePredictions(props) {
    const {
      normalizedTargetVerseText,
      normalizedSourceVerseText,
      setAlignmentPredictions,
      tc: {contextId: {reference: {chapter, verse}}}
    } = props;

    return getPredictions(this.map, normalizedSourceVerseText,
      normalizedTargetVerseText).then(predictions => {
      if (predictions) {
        return setAlignmentPredictions(chapter, verse, predictions);
      }
    });
  }

  /**
   * Allows the verse to be auto completed if it is fully aligned
   */
  enableAutoComplete() {
    const {canAutoComplete} = this.state;

    if (!canAutoComplete) {
      this.setState({
        canAutoComplete: true
      });
    }
  }

  /**
   * Disables the verse from being auto completed
   */
  disableAutoComplete() {
    const {canAutoComplete} = this.state;
    if (canAutoComplete) {
      this.setState({
        canAutoComplete: false
      });
    }
  }

  /**
   * Handles adding secondary words to an alignment
   * @param {Token} token - the secondary word to move
   * @param {object} nextAlignmentIndex - the alignment to which the token will be moved
   * @param {object} [prevAlignmentIndex=null] - the alignment from which the token will be removed.
   */
  handleAlignTargetToken(token, nextAlignmentIndex, prevAlignmentIndex = null) {
    const {
      tc: {contextId: {reference: {chapter, verse}}}
    } = this.props;
    const {store} = this.context;
    const actions = [];
    if (prevAlignmentIndex !== null && prevAlignmentIndex >= 0) {
      // TRICKY: this does the same as {@link handleUnalignTargetToken} but is batchable
      actions.push(
        unalignTargetToken(chapter, verse, prevAlignmentIndex, token));
      this.handleToggleComplete(null, false);
    } else {
      // dragging an alignment from the word list can auto-complete the verse
      this.enableAutoComplete();
    }
    actions.push(alignTargetToken(chapter, verse, nextAlignmentIndex, token));
    store.dispatch(batchActions(actions));
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
    this.handleToggleComplete(null, false);
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
    this.handleToggleComplete(null, false);
  }

  handleRefreshSuggestions() {
    const {
      tool: {
        translate
      },
      tc: {contextId: {reference: {chapter, verse}}}
    } = this.props;
    const {store} = this.context;
    this.runMAP(this.props).catch(() => {
      this.setState({
        snackText: translate('suggestions.none')
      });
    }).then(() => {
      // TRICKY: suggestions may not be rendered
      const hasSuggestions = getVerseHasRenderedSuggestions(store.getState(),
        chapter, verse);
      if (!hasSuggestions) {
        this.setState({
          snackText: translate('suggestions.none')
        });
      }
    });
  }

  handleAcceptSuggestions() {
    const {
      acceptAlignmentSuggestions,
      tc: {contextId: {reference: {chapter, verse}}}
    } = this.props;
    // accepting all suggestions can auto-complete the verse
    this.enableAutoComplete();
    acceptAlignmentSuggestions(chapter, verse);
  }

  handleToggleComplete(e, isChecked) {
    const {
      tool: {
        api
      },
      tc: {
        contextId: {
          reference: {chapter, verse}
        }
      }
    } = this.props;

    api.setVerseFinished(chapter, verse, isChecked).then(() => {
      this.disableAutoComplete();
      this.forceUpdate();
    });
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
    // accepting a single suggestion can auto-complete the verse
    this.enableAutoComplete();
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

  /**
   * Checks if the verse has been completed
   * @return {Promise}
   * @private
   */
  _getIsComplete() {
    const {
      tool: {
        api
      },
      tc: {
        contextId: {reference: {chapter, verse}}
      }
    } = this.props;
    return api.getIsVerseFinished(chapter, verse);
  }

  render() {
    const {
      hasRenderedSuggestions,
      connectDropTarget,
      isOver,
      hasSourceText,
      actions,
      resourcesReducer,
      verseAlignments,
      tool: {
        api,
        translate
      },
      tc: {
        contextId,
        actions: {
          showPopover
        },
        sourceBook: {manifest: {direction : sourceDirection}},
        targetBook: {manifest: {direction : targetDirection}}
      },
      tc
    } = this.props;
    const {snackText} = this.state;
    const snackOpen = snackText !== null;

    if (!contextId) {
      return null;
    }

    // TODO: use the source book direction to correctly style the alignments

    const {lexicons} = resourcesReducer;
    const {reference: {chapter, verse}} = contextId;

    // TRICKY: do not show word list if there is no source bible.
    let words = [];
    if (hasSourceText) {
      words = this.getLabeledTargetTokens();
    }

    const isComplete = this._getIsComplete();

    return (
      <div style={styles.container}>
        <MuiThemeProvider>
          <Snackbar
            open={snackOpen}
            message={snackText ? snackText : ''}
            autoHideDuration={2000}
            onRequestClose={this.handleSnackbarClose}/>
        </MuiThemeProvider>
        <GroupMenuContainer tc={tc}
                            toolApi={api}
                            key={isComplete} // HACK to workaround anti-pattern in GroupMenu
                            translate={translate}/>
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
              sourceDirection={sourceDirection}
              targetDirection={targetDirection}
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
                       hasSuggestions={hasRenderedSuggestions}
                       complete={isComplete}
                       onToggleComplete={this.handleToggleComplete}
                       showPopover={showPopover}
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
    targetVerseText: PropTypes.string,
    contextId: PropTypes.object,
    sourceVerse: PropTypes.object,
    sourceChapter: PropTypes.object.isRequired,
    targetChapter: PropTypes.object.isRequired,
    appLanguage: PropTypes.string.isRequired
  }).isRequired,
  tool: PropTypes.shape({
    api: PropTypes.instanceOf(Api),
    translate: PropTypes.func
  }),

  // dispatch props
  acceptTokenSuggestion: PropTypes.func.isRequired,
  removeTokenSuggestion: PropTypes.func.isRequired,
  alignTargetToken: PropTypes.func.isRequired,
  unalignTargetToken: PropTypes.func.isRequired,
  moveSourceToken: PropTypes.func.isRequired,
  clearState: PropTypes.func.isRequired,
  resetVerse: PropTypes.func.isRequired,
  setAlignmentPredictions: PropTypes.func.isRequired,
  clearAlignmentSuggestions: PropTypes.func.isRequired,
  acceptAlignmentSuggestions: PropTypes.func.isRequired,

  // state props
  hasRenderedSuggestions: PropTypes.bool.isRequired,
  verseIsAligned: PropTypes.bool.isRequired,
  verseIsComplete: PropTypes.bool.isRequired,
  sourceTokens: PropTypes.arrayOf(PropTypes.instanceOf(Token)).isRequired,
  targetTokens: PropTypes.arrayOf(PropTypes.instanceOf(Token)).isRequired,
  verseAlignments: PropTypes.array.isRequired,
  alignedTokens: PropTypes.array.isRequired,
  verseIsValid: PropTypes.bool.isRequired,
  normalizedTargetVerseText: PropTypes.string.isRequired,
  normalizedSourceVerseText: PropTypes.string.isRequired,
  hasSourceText: PropTypes.bool.isRequired,
  hasTargetText: PropTypes.bool.isRequired,

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
  actions: PropTypes.object.isRequired
};

const mapDispatchToProps = ({
  alignTargetToken,
  unalignTargetToken,
  moveSourceToken,
  resetVerse,
  clearState,
  acceptTokenSuggestion,
  removeTokenSuggestion,
  acceptAlignmentSuggestions,
  setAlignmentPredictions,
  clearAlignmentSuggestions
});

const mapStateToProps = (state, props) => {
  const {tc: {contextId, targetVerseText, sourceVerse}, tool: {api}} = props;
  const {reference: {chapter, verse}} = contextId;
  // TRICKY: the target verse contains punctuation we need to remove
  let targetTokens = [];
  let sourceTokens = [];
  if (targetVerseText) {
    targetTokens = Lexer.tokenize(removeUsfmMarkers(targetVerseText));
  }
  if (sourceVerse) {
    sourceTokens = tokenizeVerseObjects(sourceVerse.verseObjects);
  }
  const normalizedSourceVerseText = sourceTokens.map(t => t.toString()).
    join(' ');
  const normalizedTargetVerseText = targetTokens.map(t => t.toString()).
    join(' ');
  return {
    hasRenderedSuggestions: getVerseHasRenderedSuggestions(state, chapter,
      verse),
    verseIsComplete: api.getIsVerseFinished(chapter, verse),
    verseIsAligned: getIsVerseAligned(state, chapter, verse),
    hasSourceText: normalizedSourceVerseText !== '',
    hasTargetText: normalizedTargetVerseText !== '',
    targetTokens,
    sourceTokens,
    alignedTokens: getRenderedVerseAlignedTargetTokens(state, chapter, verse),
    verseAlignments: getRenderedVerseAlignments(state, chapter, verse),
    verseIsValid: getIsVerseAlignmentsValid(state, chapter, verse,
      normalizedSourceVerseText, normalizedTargetVerseText),
    normalizedTargetVerseText,
    normalizedSourceVerseText
  };
};

export default DragDropContext(HTML5Backend)(
  connect(mapStateToProps, mapDispatchToProps)(Container));
