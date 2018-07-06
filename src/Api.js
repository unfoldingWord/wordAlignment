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
import {removeUsfmMarkers} from './utils/usfmHelpers';
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
  constructor() {
    super();
    this.getIsVerseFinished = this.getIsVerseFinished.bind(this);
  }

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
   * Generates an empty alignment structure for the chapter
   * @param props
   * @param chapter
   * @private
   */
  static _initChapterAlignments(props, chapter) {
    const {
      tc: {
        targetBible,
        sourceBible
      },
      resetVerse
    } = props;

    for (const verse of Object.keys(targetBible[chapter])) {
      if(sourceBible[chapter][verse] === undefined) {
        console.warn(`Missing passage ${chapter}:${verse} in source text. Skipping alignment initialization.`);
        continue;
      }
      const sourceTokens = tokenizeVerseObjects(
        sourceBible[chapter][verse].verseObjects);
      const targetVerseText = removeUsfmMarkers(targetBible[chapter][verse]);
      const targetTokens = Lexer.tokenize(targetVerseText);
      resetVerse(chapter, verse, sourceTokens, targetTokens);
    }
  }

  /**
   * API method to validate a verse.
   * And fix things if needed
   * @param {number} chapter
   * @param {number} verse
   */
  validateVerse(chapter, verse) {
    const {
      tc: {
        showDialog
      },
      translate
    } = this.props;
    const isValid = this._validateVerse(this.props, chapter, verse);
    if (!isValid) {
      showDialog(translate('alignments_reset'), translate('buttons.ok_button'));
    }
  }

  /**
   * API method to validate the entire book.
   * And fix things if needed
   */
  validateBook() {
    const {
      tc: {
        showDialog
      },
      translate
    } = this.props;
    const isValid = this._validateBook(this.props);
    if (!isValid) {
      showDialog(translate('alignments_reset'), translate('buttons.ok_button'));
    }
  }

  _loadBookAlignments(props) {
    const {
      tc: {
        contextId,
        targetBible,
        sourceBible,
        showDialog,
        projectFileExistsSync,
        readProjectDataSync
      },
      translate,
      setToolReady,
      setToolLoading,
      indexChapterAlignments
    } = props;

    if (!contextId) {
      console.warn('Missing context id. alignments not loaded.');
      return;
    }

    setToolLoading();

    const {reference: {bookId}} = contextId;
    const {store} = this.context;
    const state = store.getState();
    let alignmentsAreValid = true;
    let hasCorruptChapters = false;
    for (const chapter of Object.keys(targetBible)) {
      const isChapterLoaded = getIsChapterLoaded(state, chapter);
      if (isChapterLoaded) {
        continue;
      }
      try {
        const dataPath = path.join('alignmentData', bookId, chapter + '.json');
        if (projectFileExistsSync(dataPath)) {
          // load chapter data
          const data = readProjectDataSync(dataPath);
          const json = JSON.parse(data);
          indexChapterAlignments(chapter, json, sourceBible[chapter],
            targetBible[chapter]);

          // validate
          const isValid = this._validateChapter(props, chapter);
          if (!isValid) {
            alignmentsAreValid = isValid;
          }
        } else {
          Api._initChapterAlignments(props, chapter);
        }
      } catch (e) {
        console.error('Failed to load alignment data', e);
        hasCorruptChapters = true;
        Api._initChapterAlignments(props, chapter);
      }
    }
    if (hasCorruptChapters) {
      showDialog(translate('alignments_corrupt'),
        translate('buttons.ok_button'));
    }
    if (!alignmentsAreValid) {
      showDialog(translate('alignments_reset'), translate('buttons.ok_button'));
    }

    setToolReady();
  }

  /**
   * Validates the entire book
   * @param props
   * @return {boolean}
   * @private
   */
  _validateBook(props) {
    const {
      tc: {
        targetBible
      }
    } = props;
    let bookIsValid = true;
    for (const chapter of Object.keys(targetBible)) {
      const isValid = this._validateChapter(props, chapter);
      if (!isValid) {
        bookIsValid = isValid;
      }
    }
    return bookIsValid;
  }

  /**
   * Validates the chapter and repairs as needed.
   * @param props
   * @param chapter
   * @return {boolean} true if alignments are valid
   * @private
   */
  _validateChapter(props, chapter) {
    const {
      tc: {
        targetBible
      }
    } = props;
    let chapterIsValid = true;
    if(!(chapter in targetBible)) {
      console.warn(`Could not validate missing chapter ${chapter}`);
      return true;
    }
    for (const verse of Object.keys(targetBible[chapter])) {
      const isValid = this._validateVerse(props, chapter, verse);
      if (!isValid) {
        chapterIsValid = isValid;
      }
    }
    return chapterIsValid;
  }

  /**
   * Validates the verse and repairs as needed.
   * @param props
   * @param chapter
   * @param verse
   * @return {boolean} true is the alignments are valid
   * @private
   */
  _validateVerse(props, chapter, verse) {
    const {
      tc: {
        targetBible,
        sourceBible
      },
      repairVerse
    } = props;
    const {store} = this.context;

    if(!(verse in targetBible[chapter] && verse in sourceBible[chapter])) {
      console.warn(`Could not validate missing verse ${chapter}:${verse}`);
      return true;
    }

    const sourceTokens = tokenizeVerseObjects(sourceBible[chapter][verse].verseObjects);
    const targetVerseText = removeUsfmMarkers(targetBible[chapter][verse]);
    const targetTokens = Lexer.tokenize(targetVerseText);
    const normalizedSource = sourceTokens.map(t => t.toString()).join(' ');
    const normalizedTarget = targetTokens.map(t => t.toString()).join(' ');
    const isValid = getIsVerseValid(store.getState(), chapter, verse,
      normalizedSource, normalizedTarget);
    if (!isValid) {
      const alignedTokens = getVerseAlignedTargetTokens(store.getState(),
        chapter, verse);
      repairVerse(chapter, verse, sourceTokens, targetTokens);
      // TRICKY: if there were no alignments we fix silently
      return alignedTokens.length === 0;
    }
    return true;
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
    this._loadBookAlignments(this.props);
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
      const targetTokens = Lexer.tokenize(removeUsfmMarkers(targetVerseText));
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
      this._loadBookAlignments(nextProps);
    } else {
      const {
        tc: {
          showDialog
        },
        translate
      } = nextProps;
      const isValid = this._validateBook(nextProps);
      if (!isValid) {
        showDialog(translate('alignments_reset'),
          translate('buttons.ok_button'));
      }
      // const {reference: {chapter}} = nextContext;
      // this._validate(nextProps, chapter, verse);
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
