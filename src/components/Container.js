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
  indexChapterAlignments,
  moveSourceToken,
  repairVerse,
  resetVerse,
  unalignTargetToken
} from '../state/actions';
import {
  getIsVerseValid,
  getVerseAlignedTargetTokens,
  getVerseAlignments
} from '../state/reducers';
import {connect} from 'react-redux';
import {tokenizeVerseObjects} from '../utils/verseObjects';
import Token from 'word-map/structures/Token';
import {ScripturePane} from 'tc-ui-toolkit';
//containers
import GroupMenuContainer from '../containers/GroupMenuContainer';

const styles = {
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
    this.initMAP = this.initMAP.bind(this);
    this.handleAlignTargetToken = this.handleAlignTargetToken.bind(this);
    this.handleUnalignTargetToken = this.handleUnalignTargetToken.bind(this);
    this.handleAlignPrimaryToken = this.handleAlignPrimaryToken.bind(this);
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
    const lastPane = panes.length > 0 && panes[panes.length - 1] ? panes[panes.length - 1] : null;
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
    }
  }

  /**
   * Initializes the prediction engine
   * TODO: finish this when we add MAP
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
   * TODO: finish this when we add MAP
   * @param primaryVerse - the primary verse text
   * @param secondaryVerse - the secondary verse text
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
    const {
      tc: {contextId: {reference: {chapter, verse}}},
      alignTargetToken,
      unalignTargetToken
    } = this.props;
    if (prevIndex >= 0) {
      unalignTargetToken(chapter, verse, prevIndex, token);
    }
    alignTargetToken(chapter, verse, nextIndex, token);
  }

  /**
   * Handles removing secondary words from an alignment
   * @param {Token} token - the secondary word to remove
   * @param {number} prevIndex - the index from which this token will be moved
   */
  handleUnalignTargetToken(token, prevIndex) {
    const {
      tc: {contextId: {reference: {chapter, verse}}},
      unalignTargetToken
    } = this.props;
    unalignTargetToken(chapter, verse, prevIndex, token);
  }

  /**
   * Handles (un)merging primary words
   * @param {Token} token - the primary word to move
   * @param {number} prevIndex - the previous alignment index
   * @param {number} nextIndex - the next alignment index
   */
  handleAlignPrimaryToken(token, nextIndex, prevIndex) {
    const {
      moveSourceToken,
      tc: {contextId: {reference: {chapter, verse}}}
    } = this.props;
    moveSourceToken({chapter, verse, nextIndex, prevIndex, token});
  }

  makeTitle(manifest) {
    const {target_language, project} = manifest;
    if (target_language && target_language.book && target_language.book.name) {
      return target_language.book.name;
    } else {
      return project.name;
    }
  }

  render() {
    // Modules not defined within translationWords
    const {
      connectDropTarget,
      isOver,
      actions,
      actions: {
        showPopover,
        editTargetVerse,
        getLexiconData,
        setToolSettings
      },
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
        contextId
      },
    } = this.props;

    if (!contextId) {
      return null;
    }

    let scripturePane = <div />;
    const {currentPaneSettings} = settingsReducer.toolsSettings.ScripturePane;
    const expandedScripturePaneTitle = this.makeTitle(projectDetailsReducer.manifest);

    // populate scripturePane so that when required data is preset that it renders as intended.
    if (Object.keys(resourcesReducer.bibles).length > 0) {
      scripturePane = (
        <ScripturePane
          currentPaneSettings={currentPaneSettings}
          contextId={contextIdReducer.contextId}
          bibles={resourcesReducer.bibles}
          expandedScripturePaneTitle={expandedScripturePaneTitle}
          showPopover={showPopover}
          editTargetVerse={editTargetVerse}
          projectDetailsReducer={projectDetailsReducer}
          translate={translate}
          getLexiconData={getLexiconData}
          selections={selectionsReducer.selections}
          setToolSettings={setToolSettings} />
      );
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
      <div style={{display: 'flex', flexDirection: 'row', width: '100vw', height: 'var(--tool-max-height)'}}>
        <GroupMenuContainer {...this.props.groupMenu} />
        <div style={styles.wordListContainer}>
          <WordList
            chapter={chapter}
            verse={verse}
            words={words}
            onDropTargetToken={this.handleUnalignTargetToken}
            connectDropTarget={connectDropTarget}
            isOver={isOver} />
        </div>
        <div style={styles.alignmentAreaContainer}>
          {scripturePane}
          <AlignmentGrid
            alignments={verseAlignments}
            translate={translate}
            lexicons={lexicons}
            onDropTargetToken={this.handleAlignTargetToken}
            onDropSourceToken={this.handleAlignPrimaryToken}
            actions={actions}
            contextId={contextId} />
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

  // state props
  sourceTokens: PropTypes.arrayOf(PropTypes.instanceOf(Token)).isRequired,
  targetTokens: PropTypes.arrayOf(PropTypes.instanceOf(Token)).isRequired,
  verseAlignments: PropTypes.array.isRequired,
  alignedTokens: PropTypes.array.isRequired,
  verseIsValid: PropTypes.bool.isRequired,

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
  indexChapterAlignments
});

const mapStateToProps = (state, ownProps) => {
  const {contextId, targetVerseText, sourceVerse} = ownProps;
  if (contextId) {
    const {reference: {chapter, verse}} = contextId;
    // TRICKY: the target verse contains punctuation we need to remove
    const targetTokens = Lexer.tokenize(targetVerseText);
    const sourceTokens = tokenizeVerseObjects(sourceVerse.verseObjects);
    const normalizedSourceVerseText = sourceTokens.map(t => t.toString()).
      join(' ');
    const normalizedTargetVerseText = targetTokens.map(t => t.toString()).
      join(' ');
    return {
      targetTokens,
      sourceTokens,
      alignedTokens: getVerseAlignedTargetTokens(state, chapter, verse),
      verseAlignments: getVerseAlignments(state, chapter, verse),
      verseIsValid: getIsVerseValid(state, chapter, verse,
        normalizedSourceVerseText, normalizedTargetVerseText),
      groupMenu: {
        toolsReducer: ownProps.tc.toolsReducer,
        groupsDataReducer: ownProps.tc.groupsDataReducer,
        groupsIndexReducer: ownProps.tc.groupsIndexReducer,
        groupMenuReducer: ownProps.tc.groupMenuReducer,
        translate: ownProps.translate,
        actions: ownProps.tc.actions,
        isVerseFinished: ownProps.toolApi.getIsVerseFinished,
        contextId,
        manifest: ownProps.projectDetailsReducer.manifest,
        projectSaveLocation: ownProps.projectDetailsReducer.projectSaveLocation
      },
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
