import {ToolApi} from 'tc-tool';
import isEqual from 'deep-equal';
import {
  getIsChapterLoaded, getIsVerseAligned,
  getIsVerseAlignmentsValid,
  getLegacyChapterAlignments,
  getVerseAlignedTargetTokens,
  getVerseAlignments
} from './state/reducers';
import path from 'path-extra';
import Lexer from 'wordmap-lexer';
import {tokenizeVerseObjects} from './utils/verseObjects';
import {removeUsfmMarkers} from './utils/usfmHelpers';
import {
  alignTargetToken,
  clearState,
  indexChapterAlignments,
  moveSourceToken,
  repairAndInspectVerse,
  resetVerse, recordCheck,
  unalignTargetToken
} from './state/actions';
import SimpleCache from './utils/SimpleCache';

export default class Api extends ToolApi {
  constructor() {
    super();
    this.getIsVerseFinished = this.getIsVerseFinished.bind(this);
    this._validateVerse = this._validateVerse.bind(this);
    this._validateChapter = this._validateChapter.bind(this);
    this._validateBook = this._validateBook.bind(this);
    this.validateBook = this.validateBook.bind(this);
    this.validateVerse = this.validateVerse.bind(this);
    this._loadBookAlignments = this._loadBookAlignments.bind(this);
    this.getIsVerseInvalid = this.getIsVerseInvalid.bind(this);
    this._showResetDialog = this._showResetDialog.bind(this);
    this.getInvalidChecks = this.getInvalidChecks.bind(this);
    this.getProgress = this.getProgress.bind(this);
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
        targetBook,
        sourceBook
      },
      resetVerse
    } = props;

    for (const verse of Object.keys(targetBook[chapter])) {
      if (!isNaN(verse)) { // only load valid numbers
        if (sourceBook[chapter][verse] === undefined) {
          console.warn(
            `Missing passage ${chapter}:${verse} in source text. Skipping alignment initialization.`);
          continue;
        }
        const sourceTokens = tokenizeVerseObjects(
          sourceBook[chapter][verse].verseObjects);
        const targetVerseText = removeUsfmMarkers(targetBook[chapter][verse]);
        const targetTokens = Lexer.tokenize(targetVerseText);
        resetVerse(chapter, verse, sourceTokens, targetTokens);
      }
    }
  }

  /**
   * API method to validate a verse.
   * And fix things if needed
   * @param {number} chapter
   * @param {number} verse
   * @param {boolean} silent - if true, alignments invalidated prompt is not displayed, only valid returned
   */
  validateVerse(chapter, verse, silent=false) {
    if (isNaN(verse) || parseInt(verse) === -1 ||
      isNaN(chapter) || parseInt(chapter) === -1) return;

    const isValid = this._validateVerse(this.props, chapter, verse, silent);
    if (!silent && !isValid) {
      this._showResetDialog();
    }
    return isValid;
  }

  /**
   * API method to validate the entire book.
   * And fix things if needed
   */
  validateBook() {
    const isValid = this._validateBook(this.props);
    if (!isValid) {
      this._showResetDialog();
    }
  }

  _showResetDialog() {
    const {
      tool: {
        translate
      }
    } = this.props;
    this.props.tc.showIgnorableDialog('alignments_reset', translate('alignments_reset'));
  }

  _loadBookAlignments(props) {
    const {
      tc: {
        contextId,
        targetBook,
        sourceBook,
        showDialog,
        projectDataPathExistsSync,
        readProjectDataSync
      },
      tool: {
        setToolReady,
        setToolLoading,
        translate
      },
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
    for (const chapter of Object.keys(targetBook)) {
      if (isNaN(chapter) || parseInt(chapter) === -1) continue;

      const isChapterLoaded = getIsChapterLoaded(state, chapter);
      if (isChapterLoaded) {
        continue;
      }
      try {
        const dataPath = path.join('alignmentData', bookId, chapter + '.json');
        if (projectDataPathExistsSync(dataPath)) {
          // load chapter data
          const data = readProjectDataSync(dataPath);
          const json = JSON.parse(data);
          indexChapterAlignments(chapter, json, sourceBook[chapter],
            targetBook[chapter]);

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
      this._showResetDialog();
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
        targetBook
      }
    } = props;
    let bookIsValid = true;
    for (const chapter of Object.keys(targetBook)) {
      if (isNaN(chapter) || parseInt(chapter) === -1) continue;
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
        targetBook
      }
    } = props;
    let chapterIsValid = true;
    if (!(chapter in targetBook)) {
      console.warn(`Could not validate missing chapter ${chapter}`);
      return true;
    }
    for (const verse of Object.keys(targetBook[chapter])) {
      if (isNaN(verse) || parseInt(verse) === -1) continue;
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
   * @param {boolean} silent - if true, alignments invalidated prompt is not displayed, only valid returned
   * @return {boolean} true if the alignments are valid
   * @private
   */
  _validateVerse(props, chapter, verse, silent=false) {
    const {
      tc: {
        targetBook,
        sourceBook
      },
      repairAndInspectVerse
    } = props;
    const {store} = this.context;

    if (!(verse in targetBook[chapter] && verse in sourceBook[chapter])) {
      console.warn(`Could not validate missing verse ${chapter}:${verse}`);
      return true;
    }

    const sourceTokens = tokenizeVerseObjects(
      sourceBook[chapter][verse].verseObjects);
    const targetVerseText = removeUsfmMarkers(targetBook[chapter][verse]);
    const targetTokens = Lexer.tokenize(targetVerseText);
    const normalizedSource = sourceTokens.map(t => t.toString()).join(' ');
    const normalizedTarget = targetTokens.map(t => t.toString()).join(' ');
    const isAligned = getIsVerseAligned(store.getState(), chapter, verse);
    const areVerseAlignmentsValid = getIsVerseAlignmentsValid(store.getState(), chapter, verse,
      normalizedSource, normalizedTarget);
    const isAlignmentComplete = this.getIsVerseFinished(chapter, verse);
    if (!areVerseAlignmentsValid) {
      const wasChanged = repairAndInspectVerse(chapter, verse, sourceTokens,
        targetTokens);
      let isVerseInvalidated = (wasChanged || isAligned || isAlignmentComplete);
      if (isVerseInvalidated) {
        this.setVerseInvalid(chapter, verse, true, silent);
      }
      this.setVerseFinished(chapter, verse, false);
      // TRICKY: if there were no alignments we fix silently
      return !isVerseInvalidated;
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
        targetBook,
        writeProjectData,
        contextId: {reference: {bookId}}
      },
      tool: {
        isReady
      }
    } = this.props;
    const writableChange = Boolean(prevState) && Boolean(nextState) &&
      !isEqual(prevState.tool, nextState.tool);
    // TRICKY: only save if the tool has finished loading and the state has changed
    if (isReady && writableChange) {
      const promises = [];
      // TRICKY: we validate the entire book so we must write all chapters
      for (const chapter of Object.keys(targetBook)) {
        if (isNaN(chapter)) {
          // TRICKY: skip the 'manifest' key
          continue;
        }
        // write alignment data to the project folder
        const dataPath = path.join('alignmentData', bookId, chapter + '.json');
        const data = getLegacyChapterAlignments(nextState, chapter);
        if (data && Object.keys(data).length > 0) {
          promises.push(writeProjectData(dataPath, JSON.stringify(data)));
        } else {
          console.error(
            `Writing empty alignment data to ${bookId} ${chapter}. You likely forgot to load the alignment data or the data is corrupt.`);
        }
      }
      return Promise.all(promises);
    }
  }

  /**
   * Lifecycle method
   */
  toolWillConnect() {
    const {clearState} = this.props;
    clearState();
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
      let targetTokens = [];
      let sourceTokens = [];
      if (targetVerseText) {
        targetTokens = Lexer.tokenize(removeUsfmMarkers(targetVerseText));
      }
      if (sourceVerse) {
        sourceTokens = tokenizeVerseObjects(sourceVerse.verseObjects);
      }
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
      recordCheck,
      alignTargetToken,
      unalignTargetToken,
      moveSourceToken,
      resetVerse,
      repairAndInspectVerse,
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
  }

  /**
   * Lifecycle method
   * @param nextProps
   */
  toolWillReceiveProps(nextProps) {
    const {tc: {contextId: nextContext}} = nextProps;
    const {
      tc: {contextId: prevContext},
      tool: {
        isReady
      }
    } = this.props;
    if (isReady && !Api._didChapterContextChange(prevContext, nextContext)) {
      setTimeout(() => {
        const isValid = this._validateBook(nextProps);
        if (!isValid) {
          this._showResetDialog();
        }
      }, 0);
    }
  }

  /**
   * Labels a verse as valid or in-valid.
   * This may trigger the tool to update
   * @param {number} chapter
   * @param {number} verse
   * @param {boolean} invalid - indicates if the verse is valid
   * @param {boolean} silent - if true, alignments invalidated prompt is not displayed (we don't trigger update)
   * @return {Promise}
   */
  setVerseInvalid(chapter, verse, invalid = true, silent=false) {
    const {
      tool: {
        writeToolData,
        deleteToolFile,
        toolDataPathExists
      }
    } = this.props;
    const dataPath = path.join('invalid', chapter + '', verse + '.json');
    if (!invalid) {
      return toolDataPathExists(dataPath).then(exists => {
        if (exists) {
          return deleteToolFile(dataPath).then(() => (!silent && this.toolDidUpdate()));
        }
      });
    } else {
      return toolDataPathExists(dataPath).then(exists => {
        if (!exists) {
          const data = {
            timestamp: (new Date()).toISOString()
          };
          return writeToolData(dataPath, JSON.stringify(data)).
            then(() => (!silent && this.toolDidUpdate()));
        }
      });
    }
  }

  /**
   * Checks if the verse is labeled as invalid
   * @param chapter
   * @param verse
   * @return {*}
   */
  getIsVerseInvalid(chapter, verse) {
    const {
      tool: {
        toolDataPathExistsSync
      }
    } = this.props;
    const dataPath = path.join('invalid', chapter + '', verse + '.json');
    return toolDataPathExistsSync(dataPath);
  }

  /**
   * Sets the verse's completion state
   * @param {number} chapter
   * @param {number} verse
   * @param {boolean} finished - indicates if the verse has been finished
   * @return {Promise}
   */
  setVerseFinished(chapter, verse, finished) {
    const {
      tool: {
        writeToolData,
        deleteToolFile
      },
      tc: {
        username
      },
      recordCheck
    } = this.props;
    const dataPath = path.join('completed', chapter + '', verse + '.json');
    if (finished) {
      const data = {
        username,
        modifiedTimestamp: (new Date()).toJSON()
      };
      return writeToolData(dataPath, JSON.stringify(data)).then(() => {
        recordCheck("completed", chapter, verse, true);
      });
    } else {
      return deleteToolFile(dataPath).then(() => {
        recordCheck("completed", chapter, verse, false);
      });
    }
  }

  /**
   * Checks if a verse has been completed.
   * @param {number} chapter
   * @param {number} verse
   * @return {*}
   */
  getIsVerseFinished(chapter, verse) {
    const {
      tool: {
        toolDataPathExistsSync
      }
    } = this.props;
    const dataPath = path.join('completed', chapter + '', verse + '.json');
    return toolDataPathExistsSync(dataPath);
  }

  getisVerseUnaligned(chapter, verse) {
    const {store} = this.context;
    return !getIsVerseAligned(store.getState(), chapter, verse);
  }

  /**
   * Returns the number of verses that have invalidated alignments
   * @returns {number}
   */
  getInvalidChecks() {
    const {
      tc: {
        targetBook
      }
    } = this.props;

    const chapters = Object.keys(targetBook);
    let invalidVerses = 0;
    for(let i = 0, chapterLen = chapters.length; i < chapterLen; i ++) {
      const chapter = chapters[i];
      if(isNaN(chapter) || parseInt(chapter) === -1) continue;

      const verses = Object.keys(targetBook[chapter]);
      for(let j = 0, verseLen = verses.length; j < verseLen; j ++) {
        const verse = verses[j];
        if(isNaN(verse) || parseInt(verse) === -1) continue;

        if(this.getIsVerseInvalid(chapter, verse)) {
          invalidVerses ++;
        }
      }
    }

    return invalidVerses;
  }

  /**
   * Returns the % progress of completion for the project.
   * Verses that are fully aligned and completed are included in the progress
   * @returns {number} - a value between 0 and 1
   */
  getProgress() {
    const {
      tc: {
        targetBook
      }
    } = this.props;
    const {store} = this.context;

    const chapters = Object.keys(targetBook);
    let totalVerses = 0;
    let completeVerses = 0;
    for(let i = 0, chapterLen = chapters.length; i < chapterLen; i ++) {
      const chapter = chapters[i];
      if(isNaN(chapter) || parseInt(chapter) === -1) continue;

      const verses = Object.keys(targetBook[chapter]);
      for(let j = 0, verseLen = verses.length; j < verseLen; j ++) {
        const verse = verses[j];
        if(isNaN(verse) || parseInt(verse) === -1) continue;

        totalVerses ++;
        const isAligned = getIsVerseAligned(store.getState(), chapter, verse);
        if(isAligned || this.getIsVerseFinished(chapter, verse)) {
          completeVerses ++;
        }
      }
    }

    if(totalVerses > 0) {
      return completeVerses / totalVerses;
    } else {
      return 0;
    }
  }

  /**
   * Returns an array of alignment memory from all projects that match the given parameters.
   * 
   * @param {string} languageId the target language id
   * @param {string} resourceId the resource id
   * @param {string} originalLanguageId the original language id
   */
  getGlobalAlignmentMemory(languageId, resourceId, originalLanguageId) {
    const {
      tc: {
        projects
      }
    } = this.props;
    const memory = [];
    const cache = new SimpleCache(SimpleCache.SESSION_STORAGE);

    for(let i = 0, len = projects.length; i < len; i++) {
      if(p.getLanguageId() === languageId
       && p.getResourceId() === resourceId
       && p.getOriginalLanguageId() === originalLanguageId) {
          const key = `alignment-memory.${p.getLanguageId()}-${p.getResourceId()}-${p.getProjectId()}`;
          const hit = cache.get(key);
          if(hit) {
            memory.push.apply(memory, hit);
          } else {
            // TODO: load alignment memory and cache
            const chaptersDir = path.join('alignmentData', p.getBookId());
            // TODO: implement listDataDir
            const chapterFiles = p.listDataDir(chaptersDir);
            for(let c in chapterFiles) {
              const chapterData = p.readDataFileSync(path.join(chaptersDir, c));
              console.log(key, chapterData);
              // TODO: load alignment data
            }
          }
       }
    }

    return memory;
  }
}
