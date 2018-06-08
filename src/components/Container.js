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
  clearAlignmentSuggestions,
  clearState,
  indexChapterAlignments,
  moveSourceToken,
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
import Token from 'word-map/structures/Token';
import MAPControls from './MAPControls';

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
    this.state = {
      loading: false,
      validating: false,
      prevState: undefined,
      writing: false
    };
  }

  componentWillMount() {
    // TODO: the following code needs to be cleaned up

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
    const {chapterAlignments} = props;
    return this.initMAP(chapterAlignments).then(() => {
      return this.predictAlignments(props);
    });
  }

  /**
   * Initializes the prediction engine
   * @param chapterAlignments
   */
  initMAP(chapterAlignments) {
    // TODO: eventually we'll want to load alignments from the entire book
    // not just the current chapter
    return new Promise(resolve => {
      const map = new WordMap();
      for (const verse of Object.keys(chapterAlignments)) {
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
      setAlignmentPredictions(chapter, verse, suggestions[0].predictions);
      resolve();
    });
  }

  /**
   * Handles adding secondary words to an alignment
   * @param {Token} token - the secondary word to move
   * @param {object} nextAlignment - the alignment to which the token will be moved
   * @param {object} [prevAlignment=null] - the alignment from which the token will be removed.
   */
  handleAlignTargetToken(token, nextAlignment, prevAlignment = null) {
    const {
      tc: {contextId: {reference: {chapter, verse}}},
      alignTargetToken,
      unalignTargetToken
    } = this.props;
    if (prevAlignment && prevAlignment.index >= 0) {
      unalignTargetToken(chapter, verse, prevAlignment, token);
    }
    alignTargetToken(chapter, verse, nextAlignment, token);
  }

  /**
   * Handles removing secondary words from an alignment
   * @param {Token} token - the secondary word to remove
   * @param {object} prevAlignment - the alignment from which the token will be removed.
   */
  handleUnalignTargetToken(token, prevAlignment) {
    const {
      tc: {contextId: {reference: {chapter, verse}}},
      unalignTargetToken
    } = this.props;
    unalignTargetToken(chapter, verse, prevAlignment, token);
  }

  /**
   * Handles (un)merging primary words
   * @param {Token} token - the primary word to move
   * @param {object} nextAlignment - the alignment to which the token will be moved.
   * @param {object} prevAlignment - the alignment from which the token will be removed.
   */
  handleAlignPrimaryToken(token, nextAlignment, prevAlignment) {
    const {
      moveSourceToken,
      tc: {contextId: {reference: {chapter, verse}}}
    } = this.props;
    moveSourceToken({chapter, verse, nextAlignment, prevAlignment, token});
  }

  handleRefreshSuggestions() {
    this.runMAP(this.props);
  }

  handleAcceptSuggestions() {
    // TODO: accept suggestions
  }

  handleRejectSuggestions() {
    const {
      clearAlignmentSuggestions,
      tc: {contextId: {reference: {chapter, verse}}}
    } = this.props;
    clearAlignmentSuggestions(chapter, verse);
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
      alignedTokens,
      contextIdReducer,
      verseAlignments,
      projectDetailsReducer,
      tc: {
        appLanguage,
        contextId
      },
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
          <MAPControls onAccept={this.handleAcceptSuggestions}
                       onRefresh={this.handleRefreshSuggestions}
                       onReject={this.handleRejectSuggestions}/>
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
  alignTargetToken: PropTypes.func.isRequired,
  unalignTargetToken: PropTypes.func.isRequired,
  moveSourceToken: PropTypes.func.isRequired,
  clearState: PropTypes.func.isRequired,
  resetVerse: PropTypes.func.isRequired,
  repairVerse: PropTypes.func.isRequired,
  indexChapterAlignments: PropTypes.func.isRequired,
  setAlignmentPredictions: PropTypes.func.isRequired,
  clearAlignmentSuggestions: PropTypes.func.isRequired,

  // state props
  sourceTokens: PropTypes.arrayOf(PropTypes.instanceOf(Token)).isRequired,
  targetTokens: PropTypes.arrayOf(PropTypes.instanceOf(Token)).isRequired,
  verseAlignments: PropTypes.array.isRequired,
  alignedTokens: PropTypes.array.isRequired,
  verseIsValid: PropTypes.bool.isRequired,
  chapterAlignments: PropTypes.object.isRequired,
  normalizedTargetVerseText: PropTypes.string.isRequired,
  normalizedSourceVerseText: PropTypes.string.isRequired,

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
  actions: PropTypes.object.isRequired
};

const mapDispatchToProps = ({
  alignTargetToken,
  unalignTargetToken,
  moveSourceToken,
  resetVerse,
  repairVerse,
  clearState,
  indexChapterAlignments,
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
    chapterAlignments: getChapterAlignments(state, chapter),
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
