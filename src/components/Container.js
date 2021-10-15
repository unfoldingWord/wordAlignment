import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import isEqual from 'deep-equal';
import WordMap, { Alignment, Ngram } from 'wordmap';
import Lexer, { Token } from 'wordmap-lexer';
import {
  CommentsDialog,
  VerseEditor,
  getReferenceStr,
  getTitleWithId,
  getTitleStr,
} from 'tc-ui-toolkit';
import Snackbar from 'material-ui/Snackbar';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { connect } from 'react-redux';
import { batchActions } from 'redux-batched-actions';
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
  unalignTargetToken,
} from '../state/actions';
import { addComment } from '../state/actions/CommentsActions';
import { addBookmark } from '../state/actions/BookmarksActions';
import { editTargetVerse } from '../state/actions/verseEditActions';
import {
  getChapterAlignments,
  getCurrentComments,
  getCurrentBookmarks,
  getIsVerseAligned,
  getIsVerseAlignmentsValid,
  getRenderedVerseAlignedTargetTokens,
  getRenderedVerseAlignments,
  getVerseHasRenderedSuggestions,
} from '../state/reducers';
import { tokenizeVerseObjects } from '../utils/verseObjects';
import { sortPanesSettings } from '../utils/panesSettingsHelper';
import { removeUsfmMarkers } from '../utils/usfmHelpers';
import GroupMenuContainer from '../containers/GroupMenuContainer';
import ScripturePaneContainer from '../containers/ScripturePaneContainer';
import Api from '../Api';
import * as GroupMenu from '../state/reducers/GroupMenu';
import {
  getContextId,
  getGatewayLanguageCode,
  getSelectedTargetVerse,
  getSelectedSourceVerse,
  getSourceChapter,
  getTargetChapter,
  getUsername,
  getCurrentToolName,
  getProjectPath,
} from '../state/selectors';
import MAPControls from './MAPControls';
import MissingBibleError from './MissingBibleError';
import AlignmentGrid from './AlignmentGrid';
import WordList from './WordList/index';
import IconIndicators from './IconIndicators';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    width: '100vw',
    height: '100%',
  },
  groupMenuContainer: {
    width: '250px',
    height: '100%',
  },
  wordListContainer: {
    minWidth: '100px',
    maxWidth: '400px',
    height: '100%',
    display: 'flex',
  },
  alignmentAreaContainer: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    width: 'calc(100vw - 650px)',
    height: '100%',
  },
  scripturePaneWrapper: {
    minHeight: '250px',
    marginBottom: '20px',
    maxHeight: '310px',
  },
  alignmentGridWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    overflow: 'auto',
    boxSizing: 'border-box',
    margin: '0 10px 6px 10px',
    boxShadow: '0 3px 10px var(--background-color)',
  },
};

/**
 * Generates an indexed word map
 * @param targetBook
 * @param state
 * @param {number} currentChapter
 * @param {number|string} currentVerse
 * @return {Promise<WordMap>}
 */
export const generateMAP = (
  targetBook, state, currentChapter, currentVerse) => new Promise(resolve => {
  setTimeout(() => {
    // TODO: determine the maximum require target ngram length from the alignment memory before creating the map
    const map = new WordMap({ targetNgramLength: 5, warnings: false });

    for (const chapter of Object.keys(targetBook)) {
      const chapterAlignments = getChapterAlignments(state, chapter);

      for (const verse of Object.keys(chapterAlignments)) {
        if (verse === currentVerse && parseInt(chapter) ===
            currentChapter) {
          // exclude current verse from saved alignments
          continue;
        }

        for (const a of chapterAlignments[verse]) {
          if (a.sourceNgram.length && a.targetNgram.length) {
            map.appendAlignmentMemory(new Alignment(new Ngram(a.sourceNgram), new Ngram(a.targetNgram)));
          }
        }
      }
    }
    resolve(map);
  }, 0);
});

/**
 * Returns predictions based on the word map
 * @param {WordMap} map
 * @param sourceVerseText
 * @param targetVerseText
 * @return {Promise<*>}
 */
export const getPredictions = (map, sourceVerseText, targetVerseText) => new Promise(resolve => {
  setTimeout(() => {
    const suggestions = map.predict(sourceVerseText, targetVerseText);

    if (suggestions[0]) {
      resolve(suggestions[0].predictions);
    }
    resolve();
  }, 0);
});

/**
 * The base container for this tool
 */
export class Container extends Component {
  constructor(props) {
    super(props);
    this.globalWordAlignmentMemory = null;
    this.globalToolsMemory = null;
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
    this.handleAcceptTokenSuggestion = this.handleAcceptTokenSuggestion.bind(
      this);
    this.getLabeledTargetTokens = this.getLabeledTargetTokens.bind(this);
    this.handleSnackbarClose = this.handleSnackbarClose.bind(this);
    this.handleModalOpen = this.handleModalOpen.bind(this);
    this.handleResetWordList = this.handleResetWordList.bind(this);
    this.handleBookmarkClick = this.handleBookmarkClick.bind(this);
    this.handleVerseEditClick = this.handleVerseEditClick.bind(this);
    this.handleVerseEditClose = this.handleVerseEditClose.bind(this);
    this.handleVerseEditSubmit = this.handleVerseEditSubmit.bind(this);
    this.handleCommentClick = this.handleCommentClick.bind(this);
    this.handleCommentClose = this.handleCommentClose.bind(this);
    this.handleCommentSubmit = this.handleCommentSubmit.bind(this);
    this.state = {
      loading: false,
      validating: false,
      prevState: undefined,
      writing: false,
      snackText: null,
      canAutoComplete: false,
      resetWordList: false,
      showVerseEditor: false,
      showComments: false,
    };
  }

  handleSnackbarClose() {
    this.setState({ snackText: null });
  }

  handleModalOpen(isOpen) {
    if (isOpen) {
      this.handleResetWordList();
    }
  }

  handleResetWordList() {
    this.setState( { resetWordList: true });
  }

  UNSAFE_componentWillMount() {
    // current panes persisted in the scripture pane settings.
    const {
      setToolSettings,
      settingsReducer,
      resourcesReducer: { bibles },
    } = this.props;
    const { ScripturePane } = settingsReducer.toolsSettings || {};
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
      verseIsComplete,
    } = this.props;

    const {
      canAutoComplete,
      resetWordList,
    } = this.state;

    if (!Container.contextDidChange(this.props, prevProps)) {
      // auto complete the verse
      if (verseIsAligned && canAutoComplete && !verseIsComplete) {
        this.handleToggleComplete(null, true);
      }
    }

    if (resetWordList) {
      this.setState({ resetWordList: false });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // When resetWordList goes from true to false, we don't need to render again
    return !(this.state.resetWordList && !nextState.resetWordList);
  }

  /**
   * Checks if the context has changed. e.g. the user navigated away from the previous context.
   * @param nextProps
   * @param prevProps
   * @return {boolean}
   */
  static contextDidChange(nextProps, prevProps) {
    return !isEqual(prevProps.contextId, nextProps.contextId);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.contextId && Container.contextDidChange(nextProps, this.props)) {
      // scroll alignments to top when context changes
      let page = document.getElementById('AlignmentGrid');

      if (page) {
        page.scrollTop = 0;
      }

      this.runMAP(nextProps).catch(() => {
      });
      this.disableAutoComplete();
    }
  }

  runMAP(props) {
    const {
      hasSourceText,
      hasTargetText,
      contextId,
    } = props;

    if (contextId && hasSourceText && hasTargetText) {
      return this.initMAP(props).then(map => {
        this.map = map;
        return this.updatePredictions(props);
      });
    } else {
      return Promise.reject();
    }
  }

  /**
   * Initializes the prediction engine.
   * Note: this uses two types of alignment memory. Global and local alignment memory.
   * Global alignment memory is cached. The local memory is volatile and therefore not cached.
   * @param props
   */
  initMAP(props) {
    let {
      tc: {
        targetBook,
        tools,
        project,
      },
      tool: { api },
      contextId,
    } = props;
    // TRICKY:
    contextId = contextId || { reference: { chapter: 1, verse: 1 } };
    const { reference: { chapter, verse } } = contextId;

    const { store } = this.context;
    const state = store.getState();
    return generateMAP(targetBook, state, chapter, verse).then(map => {
      let toolsMemory = [];

      try {
        for (const key of Object.keys(tools)) {
          const alignmentMemory = tools[key].trigger('getAlignmentMemory');

          if (alignmentMemory) {
            for (const alignment of alignmentMemory) {
              try {
                map.appendAlignmentMemoryString(alignment.sourceText,
                  alignment.targetText);
              } catch (e) {
                console.warn(`"WA.initMAP() - Broken alignment for ${key}: ${JSON.stringify(alignment)}`, e);
              }
            }
          }

          // collect global tools memory
          if (this.globalToolsMemory === null) {
            try {
              const memory = tools[key].trigger(
                'getGlobalAlignmentMemory',
                project.getLanguageId(),
                project.getResourceId(),
                project.getOriginalLanguageId(),
                project.getBookId(),
              );

              if (memory) {
                toolsMemory.push.appy(toolsMemory, memory);
              }
            } catch (e) {
              console.warn(`"WA.initMAP() - Failed to collect global alignment memory from ${key}`, e);
            }
          }
        }

        // cache global memory
        if (this.globalToolsMemory === null) {
          this.globalToolsMemory = toolsMemory;
        }

        if (this.globalWordAlignmentMemory === null) {
          this.globalWordAlignmentMemory = api.getGlobalAlignmentMemory(
            project.getLanguageId(),
            project.getResourceId(),
            project.getOriginalLanguageId(),
            project.getBookId(),
          );
        }

        // append global memory
        for (const alignment of this.globalToolsMemory) {
          map.appendAlignmentMemoryString(alignment.sourceText, alignment.targetText);
        }

        for (const alignment of this.globalWordAlignmentMemory) {
          map.appendAlignmentMemory(alignment);
        }

        return Promise.resolve(map);
      } catch (e) {
        console.warn('WA.initMAP() - Failed to init wordMap', e);
      }
    });
  }

  /**
   * Predicts alignments
   */
  updatePredictions(props) {
    const {
      normalizedTargetVerseText,
      sourceTokens,
      setAlignmentPredictions,
      contextId: { reference: { chapter, verse } },
    } = props;

    return getPredictions(this.map, sourceTokens,
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
    const { canAutoComplete } = this.state;

    if (!canAutoComplete) {
      this.setState({ canAutoComplete: true });
    }
  }

  /**
   * Disables the verse from being auto completed
   */
  disableAutoComplete() {
    const { canAutoComplete } = this.state;

    if (canAutoComplete) {
      this.setState({ canAutoComplete: false });
    }
  }

  /**
   * Handles adding secondary words to an alignment
   * @param {Token} token - the secondary word to move
   * @param {object} nextAlignmentIndex - the alignment to which the token will be moved
   * @param {object} [prevAlignmentIndex=null] - the alignment from which the token will be removed.
   */
  handleAlignTargetToken(token, nextAlignmentIndex, prevAlignmentIndex = null) {
    const { contextId: { reference: { chapter, verse } } } = this.props;
    const { store } = this.context;
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
      contextId: { reference: { chapter, verse } },
      unalignTargetToken,
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
      contextId: { reference: { chapter, verse } },
    } = this.props;

    moveSourceToken(chapter, verse, nextAlignmentIndex, prevAlignmentIndex,
      token);
    this.handleToggleComplete(null, false);
  }

  handleRefreshSuggestions() {
    const {
      tool: { translate },
      contextId: { reference: { chapter, verse } },
    } = this.props;
    const { store } = this.context;

    this.runMAP(this.props).catch(() => {
      this.setState({ snackText: translate('suggestions.none') });
    }).then(() => {
      // TRICKY: suggestions may not be rendered
      const hasSuggestions = getVerseHasRenderedSuggestions(store.getState(),
        chapter, verse);

      if (!hasSuggestions) {
        this.setState({ snackText: translate('suggestions.none') });
      }
    });
    this.handleResetWordList();
  }

  handleAcceptSuggestions() {
    const {
      acceptAlignmentSuggestions,
      contextId: { reference: { chapter, verse } },
    } = this.props;
    // accepting all suggestions can auto-complete the verse
    this.enableAutoComplete();
    acceptAlignmentSuggestions(chapter, verse);
    this.handleResetWordList();
  }

  handleToggleComplete(e, isChecked) {
    const {
      tool: { api },
      contextId: { reference: { chapter, verse } },
    } = this.props;

    api.setVerseFinished(chapter, verse, isChecked).then(() => {
      this.disableAutoComplete();
      this.forceUpdate();
    });
    this.handleResetWordList();
  }

  handleRejectSuggestions() {
    const {
      clearAlignmentSuggestions,
      contextId: { reference: { chapter, verse } },
    } = this.props;
    clearAlignmentSuggestions(chapter, verse);
    this.handleResetWordList();
  }

  handleRemoveSuggestion(alignmentIndex, token) {
    const {
      removeTokenSuggestion,
      contextId: { reference: { chapter, verse } },
    } = this.props;
    removeTokenSuggestion(chapter, verse, alignmentIndex, token);
  }

  handleAcceptTokenSuggestion(alignmentIndex, token) {
    const {
      acceptTokenSuggestion,
      contextId: { reference: { chapter, verse } },
    } = this.props;
    // accepting a single suggestion can auto-complete the verse
    this.enableAutoComplete();
    acceptTokenSuggestion(chapter, verse, alignmentIndex, token);
  }

  /**
   * will toggle bookmark on click
   */
  handleBookmarkClick() {
    const {
      username,
      contextId,
      addBookmark,
      currentBookmarks,
      tool: { api },
    } = this.props;
    addBookmark(api, !currentBookmarks, username, contextId); // toggle bookmark
  }

  /**
   * will show verse editor on click
   */
  handleVerseEditClick() {
    this.setState({ showVerseEditor: true });
  }

  handleVerseEditClose() {
    this.setState({ showVerseEditor: false });
  }

  handleVerseEditSubmit(before, after, reasons) {
    const {
      contextId,
      editTargetVerse,
    } = this.props;
    const { reference: { chapter, verse } } = contextId;
    editTargetVerse(chapter, verse, before, after, reasons, contextId);
    this.handleVerseEditClose();
  }

  /**
   * will show comment editor on click
   */
  handleCommentClick() {
    this.setState({ showComments: true });
  }

  /**
   * will close comment editor
   */
  handleCommentClose() {
    this.setState({ showComments: false });
  }

  /**
   * will update comment and close comment editor
   */
  handleCommentSubmit(newComment) {
    const {
      username,
      contextId,
      addComment,
      tool: { api },
    } = this.props;
    addComment(api, newComment, username, contextId);
    this.handleCommentClose();
  }

  /**
   * Returns the target tokens with used tokens labeled as disabled
   * @return {*}
   */
  getLabeledTargetTokens() {
    const {
      targetTokens,
      alignedTokens,
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
      tc,
      isOver,
      bookId,
      contextId,
      showPopover,
      hasSourceText,
      verseAlignments,
      currentComments,
      setToolSettings,
      currentBookmarks,
      resourcesReducer,
      loadLexiconEntry,
      connectDropTarget,
      hasRenderedSuggestions,
      settingsReducer,
      tool: {
        api,
        translate,
      },
      tc: {
        sourceBook: { manifest: { direction : sourceDirection, language_id: sourceLanguage } },
        targetBook: { manifest: { direction : targetDirection } },
        projectDetailsReducer: { manifest },
      },
    } = this.props;
    const { toolsSettings = {} } = settingsReducer;
    const { projectFont: targetLanguageFont = '' } = manifest;
    const {
      snackText, showComments, showVerseEditor,
    } = this.state;
    const snackOpen = snackText !== null;
    const targetLanguage = manifest && manifest.target_language;
    let bookName = targetLanguage && targetLanguage.book && targetLanguage.book.name;

    if (!bookName) {
      bookName = bookId; // fall back to book id
    }


    // TODO: use the source book direction to correctly style the alignments

    const { lexicons } = resourcesReducer;

    // TRICKY: do not show word list if there is no source bible.
    let words = [];

    if (hasSourceText) {
      words = this.getLabeledTargetTokens();
    }

    let verseTitle = ''; //Empty verse title.
    let verseState = {};
    let targetLanguageStr = '';
    let verseText = '';
    const { reference: { chapter, verse } } = contextId || { reference: { chapter: 1, verse: 1 } };

    if (contextId) {
      const refStr = getReferenceStr(chapter, verse);
      verseTitle = getTitleStr(bookName, refStr, targetDirection);
      targetLanguageStr = getTitleWithId(targetLanguage.name, targetLanguage.id, targetDirection);
      verseText = api.getVerseRawText(chapter, verse);
      verseState = api.getVerseData(chapter, verse, contextId);
    }

    const isComplete = !!verseState[GroupMenu.FINISHED_KEY];
    const algnGridFontSize = (toolsSettings['AlignmentGrid'] && toolsSettings['AlignmentGrid'].fontSize) || 100;

    // TRICKY: make hebrew text larger
    let sourceStyle = { fontSize: '100%' };
    const isHebrew = sourceLanguage === 'hbo';

    if (isHebrew) {
      sourceStyle = {
        fontSize: '175%', paddingTop: '2px', paddingBottom: '2px', lineHeight: 'normal', WebkitFontSmoothing: 'antialiased',
      };
    }

    return (
      <div style={styles.container}>
        <MuiThemeProvider>
          <Snackbar
            open={snackOpen}
            message={snackText ? snackText : ''}
            autoHideDuration={2000}
            onRequestClose={this.handleSnackbarClose}/>
        </MuiThemeProvider>
        <GroupMenuContainer
          tc={tc}
          toolApi={api}
          gatewayLanguageCode={this.props.gatewayLanguageCode}
          translate={translate}
          direction={targetDirection}
        />
        <div style={styles.wordListContainer}>
          <WordList
            words={words}
            verse={verse}
            isOver={isOver}
            chapter={chapter}
            direction={targetDirection}
            toolsSettings={toolsSettings}
            reset={this.state.resetWordList}
            setToolSettings={setToolSettings}
            connectDropTarget={connectDropTarget}
            targetLanguageFont={targetLanguageFont}
            onDropTargetToken={this.handleUnalignTargetToken}
          />
        </div>
        <div style={styles.alignmentAreaContainer}>
          <div style={styles.scripturePaneWrapper}>
            <ScripturePaneContainer handleModalOpen={this.handleModalOpen} toolApi={api} {...this.props}/>
          </div>
          <div style={styles.alignmentGridWrapper}>
            <div className='title-bar' style={{ marginTop: '2px', marginBottom: `10px` }}>
              <span>{translate('align_title')}</span>
              <IconIndicators
                translate={translate}
                commentIconEnable={true}
                bookmarkIconEnable={true}
                verseEditIconEnable={true}
                toolsSettings={toolsSettings}
                setToolSettings={setToolSettings}
                commentStateSet={!!currentComments}
                bookmarkStateSet={currentBookmarks}
                commentClickAction={this.handleCommentClick}
                bookmarkClickAction={this.handleBookmarkClick}
                verseEditClickAction={this.handleVerseEditClick}
                verseEditStateSet={!!verseState[GroupMenu.EDITED_KEY]}
              />
            </div>
            {hasSourceText ? (
              <AlignmentGrid
                sourceStyle={sourceStyle}
                sourceDirection={sourceDirection}
                targetDirection={targetDirection}
                alignments={verseAlignments}
                translate={translate}
                lexicons={lexicons}
                toolsSettings={toolsSettings}
                onDropTargetToken={this.handleAlignTargetToken}
                onDropSourceToken={this.handleAlignPrimaryToken}
                onCancelSuggestion={this.handleRemoveSuggestion}
                onAcceptTokenSuggestion={this.handleAcceptTokenSuggestion}
                contextId={contextId}
                isHebrew={isHebrew}
                verseState={verseState}
                showPopover={showPopover}
                loadLexiconEntry={loadLexiconEntry}
                targetLanguageFont={targetLanguageFont}
              />
            ) : (
              <MissingBibleError translate={translate}/>
            )}
            <MAPControls
              onAccept={this.handleAcceptSuggestions}
              hasSuggestions={hasRenderedSuggestions}
              complete={isComplete}
              onToggleComplete={this.handleToggleComplete}
              showPopover={showPopover}
              onRefresh={this.handleRefreshSuggestions}
              onReject={this.handleRejectSuggestions}
              translate={translate}
            />
          </div>
        </div>
        {
          showVerseEditor &&
          <VerseEditor
            verseText={verseText}
            translate={translate}
            open={showVerseEditor}
            verseTitle={verseTitle}
            targetLanguage={targetLanguageStr}
            onCancel={this.handleVerseEditClose}
            onSubmit={this.handleVerseEditSubmit}
            targetLanguageFont={targetLanguageFont}
            targetLanguageFontSize={`${algnGridFontSize}%`}
            direction={targetDirection}
          />
        }
        {
          showComments &&
          <CommentsDialog
            open={showComments}
            verseTitle={verseTitle}
            comment={currentComments}
            translate={translate}
            onClose={this.handleCommentClose}
            onSubmit={this.handleCommentSubmit}
          />
        }
      </div>
    );
  }
}

Container.contextTypes = { store: PropTypes.any.isRequired };

Container.propTypes = {
  tc: PropTypes.shape({
    appLanguage: PropTypes.string.isRequired,
    sourceBook: PropTypes.object.isRequired,
    targetBook: PropTypes.object.isRequired,
    projectDetailsReducer: PropTypes.object.isRequired,
  }).isRequired,
  tool: PropTypes.shape({
    api: PropTypes.instanceOf(Api),
    translate: PropTypes.func,
  }),
  contextId: PropTypes.object,
  sourceVerse: PropTypes.object,
  sourceChapter: PropTypes.object,
  targetChapter: PropTypes.object,
  bookId: PropTypes.string.isRequired,
  gatewayLanguageCode: PropTypes.string.isRequired,

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
  addComment: PropTypes.func.isRequired,
  addBookmark: PropTypes.func.isRequired,
  editTargetVerse: PropTypes.func.isRequired,

  // state props
  username: PropTypes.string.isRequired,
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
  currentBookmarks: PropTypes.bool.isRequired,
  currentComments: PropTypes.string.isRequired,

  // drag props
  isOver: PropTypes.bool,
  connectDropTarget: PropTypes.func,

  // tc actions
  showPopover: PropTypes.func.isRequired,
  setToolSettings: PropTypes.func.isRequired,
  loadLexiconEntry: PropTypes.func.isRequired,

  // old properties
  projectDetailsReducer: PropTypes.object.isRequired,
  resourcesReducer: PropTypes.object.isRequired,
  settingsReducer: PropTypes.shape({ toolsSettings: PropTypes.object.isRequired }).isRequired,
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const methods = {
    alignTargetToken,
    unalignTargetToken,
    moveSourceToken,
    resetVerse,
    clearState,
    acceptTokenSuggestion,
    removeTokenSuggestion,
    acceptAlignmentSuggestions,
    setAlignmentPredictions,
    clearAlignmentSuggestions,
    addComment,
    addBookmark,
  };

  const dispatchedMethods = {};

  // eslint-disable-next-line array-callback-return
  Object.keys(methods).map(key => {
    dispatchedMethods[key] = (...args) => dispatch(methods[key](...args));
  });

  const {
    tc: {
      showAlert,
      closeAlert,
      updateTargetVerse,
      showIgnorableAlert,
      gatewayLanguageCode,
    },
    toolApi,
    translate,
    gatewayLanguageQuote,
  } = ownProps;
  const username = getUsername(ownProps);
  const currentToolName = getCurrentToolName(ownProps);
  const projectSaveLocation = getProjectPath(ownProps);

  dispatchedMethods.editTargetVerse = (chapter, verse, before, after, tags) => {
    dispatch(editTargetVerse(chapter, verse, before, after, tags, username, gatewayLanguageCode, gatewayLanguageQuote, projectSaveLocation, currentToolName, translate, showAlert, closeAlert, showIgnorableAlert, updateTargetVerse, toolApi));
  };

  return dispatchedMethods;
};

const mapStateToProps = (state, props) => {
  const { tool: { api } } = props;
  const targetVerseText = getSelectedTargetVerse(state, props);
  const sourceVerse = getSelectedSourceVerse(state, props);
  const contextId = getContextId(state);
  const { reference: { chapter, verse } } = contextId || { reference: { chapter: 1, verse: 1 } };
  let verseState = {};

  if (contextId) {
    verseState = api.getVerseData(chapter, verse, contextId);
  }

  const isFinished = !!verseState[GroupMenu.FINISHED_KEY];
  // TRICKY: the target verse contains punctuation we need to remove
  let targetTokens = [];
  let sourceTokens = [];

  if (targetVerseText) {
    targetTokens = Lexer.tokenize(removeUsfmMarkers(targetVerseText));
  }

  if (sourceVerse) {
    sourceTokens = tokenizeVerseObjects(sourceVerse.verseObjects);
  }

  const normalizedSourceVerseText = sourceTokens.map(t => t.toString()).join(' ');
  const normalizedTargetVerseText = targetTokens.map(t => t.toString()).join(' ');
  const gatewayLanguageCode = getGatewayLanguageCode(props);

  return {
    sourceChapter: getSourceChapter(state, props),
    targetChapter: getTargetChapter(state, props),
    contextId,
    gatewayLanguageCode,
    hasRenderedSuggestions: getVerseHasRenderedSuggestions(state, chapter, verse),
    verseIsComplete: isFinished,
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
    normalizedSourceVerseText,
    currentBookmarks: !!getCurrentBookmarks(state),
    currentComments: getCurrentComments(state) || '',
  };
};

export default DragDropContext(HTML5Backend)(
  connect(mapStateToProps, mapDispatchToProps)(Container),
);
