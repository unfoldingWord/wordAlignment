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
  indexChapterAlignments,
  moveSourceToken,
  removeTokenSuggestion,
  repairVerse,
  resetVerse,
  setAlignmentPredictions,
  unalignTargetToken
} from '../state/actions';
import {
  getChapterAlignments,
  getIsVerseValid,
  getRenderedVerseAlignedTargetTokens,
  getRenderedVerseAlignments
} from '../state/reducers';
import {connect} from 'react-redux';
import {tokenizeVerseObjects} from '../utils/verseObjects';
import {sortPanesSettings} from '../utils/panesSettingsHelper';
import Token from 'word-map/structures/Token';
import MAPControls from './MAPControls';
import {ScripturePane} from 'tc-ui-toolkit';
import GroupMenuContainer from '../containers/GroupMenuContainer';

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

const MissingBibleError = ({translate}) => (
  <div id='AlignmentGrid' style={{
    display: 'flex',
    flexWrap: 'wrap',
    backgroundColor: '#ffffff',
    padding: '0px 10px 10px',
    overflowY: 'auto',
    flexGrow: 2,
    alignContent: 'flex-start'
  }}>
    <div style={{flexGrow: 1}}>
      <div style={{
        padding: '20px',
        backgroundColor: '#ccc',
        display: 'inline-block'
      }}>
        {translate('pane.missing_verse_warning')}
      </div>
    </div>
  </div>
);
MissingBibleError.propTypes = {
  translate: PropTypes.func.isRequired
};

/**
 * Injects necessary data into the scripture pane.
 * @param props
 * @return {*}
 * @constructor
 */
const ScripturePaneWrapper = props => {
  const {
    tc: {
      actions: {
        showPopover,
        editTargetVerse,
        getLexiconData,
        setToolSettings
      },
      settingsReducer: {toolsSettings},
      resourcesReducer: {bibles},
      selectionsReducer: {selections},
      contextId,
      projectDetailsReducer
    },
    translate
  } = props;

  const currentPaneSettings = (toolsSettings && toolsSettings.ScripturePane)
    ? toolsSettings.ScripturePane.currentPaneSettings
    : [];

  // build the title
  const {target_language, project} = projectDetailsReducer.manifest;
  let expandedScripturePaneTitle = project.name;
  if (target_language && target_language.book && target_language.book.name) {
    expandedScripturePaneTitle = target_language.book.name;
  }

  if (Object.keys(bibles).length > 0) {
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
        setToolSettings={setToolSettings}/>
    );
  } else {
    return <div/>;
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
      chapterAlignments,
      tc: {contextId: {reference: {verse: selectedVerse}}}
    } = props;
    // TODO: eventually we'll want to load alignments from the entire book
    // not just the current chapter
    return new Promise(resolve => {
      setTimeout(() => {
        const map = new WordMap();
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

  render() {
    // Modules not defined within translationWords
    const {
      connectDropTarget,
      isOver,
      hasSourceText,
      actions,
      translate,
      resourcesReducer,
      targetTokens,
      alignedTokens,
      verseAlignments,
      tc: {
        contextId
      }
    } = this.props;

    if (!contextId) {
      return null;
    }

    const {lexicons} = resourcesReducer;
    const {reference: {chapter, verse}} = contextId;

    let words = [];

    // TRICKY: do not show word list if there is no source bible.
    if (hasSourceText) {
      // disabled aligned target tokens
      words = targetTokens.map(token => {
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

    return (
      <div style={styles.container}>
        <GroupMenuContainer {...this.props.groupMenu} />
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
            <ScripturePaneWrapper {...this.props}/>
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

  // dispatch props
  acceptTokenSuggestion: PropTypes.func.isRequired,
  removeTokenSuggestion: PropTypes.func.isRequired,
  alignTargetToken: PropTypes.func.isRequired,
  unalignTargetToken: PropTypes.func.isRequired,
  moveSourceToken: PropTypes.func.isRequired,
  clearState: PropTypes.func.isRequired,
  resetVerse: PropTypes.func.isRequired,
  repairVerse: PropTypes.func.isRequired,
  indexChapterAlignments: PropTypes.func.isRequired,
  setAlignmentPredictions: PropTypes.func.isRequired,
  clearAlignmentSuggestions: PropTypes.func.isRequired,
  acceptAlignmentSuggestions: PropTypes.func.isRequired,

  // state props
  sourceTokens: PropTypes.arrayOf(PropTypes.instanceOf(Token)).isRequired,
  targetTokens: PropTypes.arrayOf(PropTypes.instanceOf(Token)).isRequired,
  verseAlignments: PropTypes.array.isRequired,
  alignedTokens: PropTypes.array.isRequired,
  verseIsValid: PropTypes.bool.isRequired,
  chapterAlignments: PropTypes.object.isRequired,
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
  //group menu
  groupMenu: PropTypes.object.isRequired
};

const mapDispatchToProps = ({
  alignTargetToken,
  unalignTargetToken,
  moveSourceToken,
  resetVerse,
  repairVerse,
  clearState,
  acceptTokenSuggestion,
  indexChapterAlignments,
  removeTokenSuggestion,
  acceptAlignmentSuggestions,
  setAlignmentPredictions,
  clearAlignmentSuggestions
});

const mapStateToProps = (state, props) => {
  const {tc, translate, toolApi} = props;
  const {contextId, targetVerseText, sourceVerse} = tc;
  const {reference: {chapter, verse}} = contextId;
  // TRICKY: the target verse contains punctuation we need to remove
  const targetTokens = Lexer.tokenize(targetVerseText);
  const sourceTokens = tokenizeVerseObjects(sourceVerse.verseObjects);
  const normalizedSourceVerseText = sourceTokens.map(t => t.toString()).
    join(' ');
  const normalizedTargetVerseText = targetTokens.map(t => t.toString()).
    join(' ');
  console.warn(`normalized source text "${normalizedSourceVerseText}"`);
  return {
    hasSourceText: normalizedSourceVerseText !== '',
    chapterAlignments: getChapterAlignments(state, chapter),
    targetTokens,
    sourceTokens,
    alignedTokens: getRenderedVerseAlignedTargetTokens(state, chapter, verse),
    verseAlignments: getRenderedVerseAlignments(state, chapter, verse),
    verseIsValid: getIsVerseValid(state, chapter, verse,
      normalizedSourceVerseText, normalizedTargetVerseText),
    normalizedTargetVerseText,
    normalizedSourceVerseText,
    groupMenu: {
      toolsReducer: tc.toolsReducer,
      groupsDataReducer: tc.groupsDataReducer,
      groupsIndexReducer: tc.groupsIndexReducer,
      groupMenuReducer: tc.groupMenuReducer,
      translate,
      actions: tc.actions,
      isVerseFinished: toolApi.getIsVerseFinished,
      contextId,
      manifest: tc.projectDetailsReducer.manifest,
      projectSaveLocation: tc.projectDetailsReducer.projectSaveLocation
    }
  };
};

export default DragDropContext(HTML5Backend)(
  connect(mapStateToProps, mapDispatchToProps)(Container));
