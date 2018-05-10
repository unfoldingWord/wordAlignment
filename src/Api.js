import {ToolApi} from 'tc-tool';
import isEqual from 'deep-equal';
import {
  getIsChapterLoaded,
  getIsVerseAligned,
  getIsVerseValid,
  getLegacyChapterAlignments,
  getVerseAlignedTargetTokens,
  getVerseAlignments
} from './state/reducers';
import path from 'path-extra';
import Lexer from 'word-map/Lexer';
import {tokenizeVerseObjects} from './utils/verseObjects';
import {
  alignTargetToken,
  clearState,
  indexChapterAlignments,
  moveSourceToken,
  repairVerse,
  resetVerse,
  unalignTargetToken
} from './state/actions';

export default class Api extends ToolApi {

  /**
   * Checks if the chapter context changed
   * @param prevContext
   * @param nextContext
   * @return {boolean}
   */
  static _didChapterContextChanged(prevContext, nextContext) {
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
   * Performs necessary clean up operations if the current verse is invalid.
   * @param props
   * @return {Promise<void>}
   */
  _validate(props) {
    const {
      verseIsValid,
      alignedTokens,
      sourceTokens,
      targetTokens,
      repairVerse,
      tc: {
        showDialog,
        contextId
      },
      translate
    } = props;

    if (!verseIsValid) {
      const {reference: {chapter, verse}} = contextId;
      if (alignedTokens.length) {
        showDialog(translate('alignments_reset'),
          translate('buttons.ok_button'));
      }
      repairVerse(chapter, verse, sourceTokens, targetTokens);
    }
  }

  /**
   * Loads alignment data
   * @param {object} props - the container props
   * @return {Promise}
   */
  _loadAlignments(props) {
    const {
      tc: {
        contextId,
        readGlobalToolDataSync,
        targetChapter,
        sourceChapter,
        showDialog
      },
      indexChapterAlignments,
      sourceTokens,
      targetTokens,
      resetVerse,
      translate,
      setToolReady,
      setToolLoading,
      chapterIsLoaded
    } = props;

    if (!contextId) {
      console.warn('Missing context id. Alignments not loaded.');
      return;
    }

    if (chapterIsLoaded) return;

    const {reference: {bookId, chapter, verse}} = contextId;

    try {
      setToolLoading();
      const dataPath = path.join('alignmentData', bookId, chapter + '.json');
      const data = readGlobalToolDataSync(dataPath);
      const json = JSON.parse(data);
      indexChapterAlignments(chapter, json, sourceChapter, targetChapter);
      // TRICKY: validate the latest state
      const {store} = this.context;
      const newState = this.mapStateToProps(store.getState(), props);
      this._validate({...props, ...newState});
    } catch (e) {
      // TODO: give the user an option to reset the data or recover from it.
      console.error('The alignment data is corrupt', e);
      showDialog(translate('alignments_corrupt'),
        translate('buttons.ok_button'));
      resetVerse(chapter, verse, sourceTokens, targetTokens);
    } finally {
      setToolReady();
    }
  }

  stateChangeThrottled(nextState, prevState) {
    const {
      tc: {
        writeGlobalToolData,
        contextId: {reference: {bookId, chapter}}
      }
    } = this.props;
    const writableChange = Boolean(prevState) && Boolean(nextState) &&
      !isEqual(prevState.tool, nextState.tool);
    if (writableChange) {
      // write alignment data to the project folder
      const dataPath = path.join('alignmentData', bookId, chapter + '.json');
      const data = getLegacyChapterAlignments(nextState, chapter);
      if (data) {
        return writeGlobalToolData(dataPath, JSON.stringify(data));
      }
    }
  }

  toolWillConnect() {
    console.warn('Tool connecting');
    this._loadAlignments(this.props);
  }

  mapStateToProps(state, props) {
    const {tc: {contextId, targetVerseText, sourceVerse}} = props;
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
        chapterIsLoaded: getIsChapterLoaded(state, chapter),
        targetTokens,
        sourceTokens,
        alignedTokens: getVerseAlignedTargetTokens(state, chapter, verse),
        verseAlignments: getVerseAlignments(state, chapter, verse),
        verseIsValid: getIsVerseValid(state, chapter, verse,
          normalizedSourceVerseText, normalizedTargetVerseText)
      };
    } else {
      return {
        targetTokens: [],
        sourceTokens: [],
        alignedTokens: [],
        verseAlignments: [],
        verseIsValid: true,
        chapterIsLoaded: false
      };
    }
  }

  mapDispatchToProps(dispatch) {
    const methods = {
      alignTargetToken,
      unalignTargetToken,
      moveSourceToken,
      resetVerse,
      repairVerse,
      clearState,
      indexChapterAlignments
    };

    const dispatchedMethods = {};
    Object.keys(methods).map(key => {
      dispatchedMethods[key] = (...args) => dispatch(methods[key](...args));
    });

    return dispatchedMethods;
  }

  toolWillDisconnect() {
    console.warn('tool is disconnecting');
    const {clearState} = this.props;
    clearState();
  }

  toolWillReceiveProps(nextProps) {
    const {tc: {contextId: nextContext}} = nextProps;
    const {tc: {contextId: prevContext}} = this.props;
    if (Api._didChapterContextChanged(prevContext, nextContext)) {
      this._loadAlignments(nextProps);
    } else {
      this._validate(nextProps);
    }
  }

  getIsVerseFinished(chapter, verse) {
    const {store} = this.context;
    return getIsVerseAligned(store.getState(), chapter, verse);
  }
}
