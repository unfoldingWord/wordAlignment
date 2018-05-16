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
  static _didChapterContextChange(prevContext, nextContext) {
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
   * API method to validate a verse
   * @param {number} chapter
   * @param {number} verse
   */
  validateVerse(chapter, verse) {
    this._validate(this.props, chapter, verse);
  }

  /**
   * Validates a specific verse and performs necessary clean up operations.
   * @param props
   * @param chapter
   * @param verse
   * @private
   */
  _validate(props, chapter, verse) {
    console.warn(`validating ${chapter}:${verse}`);
    const {
      repairVerse,
      tc: {
        showDialog,
        targetChapter,
        sourceChapter
      },
      translate
    } = props;
    const {store} = this.context;
    const verseId = verse + '';

    if (!(verseId in targetChapter && verseId in sourceChapter)) {
      console.warn(`Could not validate missing verse ${chapter}:${verse}`);
      return;
    }

    const targetText = targetChapter[verseId];
    const sourceObjects = sourceChapter[verseId];

    const targetTokens = Lexer.tokenize(targetText);
    const normalizedTarget = targetTokens.map(t => t.toString()).join(' ');

    const sourceTokens = tokenizeVerseObjects(sourceObjects.verseObjects);
    const normalizedSource = sourceTokens.map(t => t.toString()).join(' ');

    const isValid = getIsVerseValid(store.getState(), chapter, verse,
      normalizedSource,
      normalizedTarget);

    if (!isValid) {
      console.error('the verse is not valid');
      const alignedTokens = getVerseAlignedTargetTokens(store.getState(),
        chapter, verse);
      if (alignedTokens.length) {
        console.error('notifying user');
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
        readProjectDataSync,
        projectFileExistsSync,
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
      if(projectFileExistsSync(dataPath)) {
        const data = readProjectDataSync(dataPath);
        const json = JSON.parse(data);
        indexChapterAlignments(chapter, json, sourceChapter, targetChapter);
        // TRICKY: validate the latest state
        const {store} = this.context;
        const updatedProps = this.mapStateToProps(store.getState(), props);
        this._validate({...props, ...updatedProps}, chapter, verse);
      } else {
        // init new alignments
        resetVerse(chapter, verse, sourceTokens, targetTokens);
      }
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

  /**
   * Lifecycle method
   * @param nextState
   * @param prevState
   * @return {*}
   */
  stateChangeThrottled(nextState, prevState) {
    const {
      tc: {
        writeProjectData,
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
        return writeProjectData(dataPath, JSON.stringify(data));
      }
    }
  }

  /**
   * Lifecycle method
   */
  toolWillConnect() {
    this._loadAlignments(this.props);
  }

  /**
   * Lifecycle method
   * @param state
   * @param props
   * @return {*}
   */
  mapStateToProps(state, props) {
    const {tc: {contextId, targetVerseText, sourceVerse}} = props;
    if (contextId) {
      const {reference: {chapter, verse}} = contextId;
      const targetTokens = Lexer.tokenize(targetVerseText);
      const sourceTokens = tokenizeVerseObjects(sourceVerse.verseObjects);
      return {
        chapterIsLoaded: getIsChapterLoaded(state, chapter),
        targetTokens,
        sourceTokens,
        alignedTokens: getVerseAlignedTargetTokens(state, chapter, verse),
        verseAlignments: getVerseAlignments(state, chapter, verse)
      };
    } else {
      return {
        targetTokens: [],
        sourceTokens: [],
        alignedTokens: [],
        verseAlignments: [],
        chapterIsLoaded: false
      };
    }
  }

  /**
   * Lifecycle method
   * @param dispatch
   */
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

  /**
   * Lifecycle method
   */
  toolWillDisconnect() {
    const {clearState} = this.props;
    clearState();
  }

  /**
   * Lifecycle method
   * @param nextProps
   */
  toolWillReceiveProps(nextProps) {
    const {tc: {contextId: nextContext}} = nextProps;
    const {tc: {contextId: prevContext}} = this.props;
    if (Api._didChapterContextChange(prevContext, nextContext)) {
      this._loadAlignments(nextProps);
    } else {
      const {reference: {chapter, verse}} = nextContext;
      this._validate(nextProps, chapter, verse);
    }
  }

  /**
   * Checks if a verse has been completed.
   * @param {number} chapter
   * @param {number} verse
   * @return {*}
   */
  getIsVerseFinished(chapter, verse) {
    const {store} = this.context;
    return getIsVerseAligned(store.getState(), chapter, verse);
  }
}
