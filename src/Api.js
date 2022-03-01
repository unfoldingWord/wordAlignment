import {
  getActiveLanguage,
  setActiveLocale,
  ToolApi,
} from 'tc-tool';
import isEqual from 'deep-equal';
import path from 'path-extra';
import Lexer, { Token } from 'wordmap-lexer';
import { Alignment, Ngram } from 'wordmap';
import {
  getGroupMenuItem,
  getIsChapterLoaded,
  getIsVerseAligned,
  getIsVerseAlignmentsValid,
  getLegacyChapterAlignments,
  getVerseAlignedTargetTokens,
  getVerseAlignments,
} from './state/reducers';
import { tokenizeVerseObjects } from './utils/verseObjects';
import { removeUsfmMarkers } from './utils/usfmHelpers';
import {
  clearGroupMenu,
  loadGroupMenuItem,
  setGroupMenuItemEdited,
  setGroupMenuItemFinished,
  setGroupMenuItemInvalid,
} from './state/actions/GroupMenuActions';
import { clearGroupsIndex } from './state/actions/groupsIndexActions';
import { clearGroupsData } from './state/actions/groupsDataActions';
import {
  getIsVerseFinished,
  getIsVerseEdited,
} from './utils/CheckDataHelper';
import {
  alignTargetToken,
  clearState,
  indexChapterAlignments,
  moveSourceToken,
  recordCheck,
  repairAndInspectVerse,
  resetVerse,
  unalignTargetToken,
  verseComparator,
} from './state/actions';
import {
  clearContextId,
} from './state/actions/contextIdActions';
import SimpleCache, { INSTANCE_STORAGE } from './utils/SimpleCache';
import { migrateChapterAlignments } from './utils/migrations';
import { isValidVerse } from './utils/alignmentValidation';
// consts
import {
  FINISHED_KEY,
  INVALID_KEY,
  UNALIGNED_KEY,
} from './state/reducers/GroupMenu';
import {TRANSLATION_NOTES, TRANSLATION_WORDS} from "./common/constants";
const GLOBAL_ALIGNMENT_MEM_CACHE_TYPE = INSTANCE_STORAGE;
const globalAlignmentCache = new SimpleCache(GLOBAL_ALIGNMENT_MEM_CACHE_TYPE);

export default class Api extends ToolApi {
  constructor() {
    super();
    this._validateVerse = this._validateVerse.bind(this);
    this._validateChapter = this._validateChapter.bind(this);
    this._validateBook = this._validateBook.bind(this);
    this.validateBook = this.validateBook.bind(this);
    this.validateVerse = this.validateVerse.bind(this);
    this.validateVerseSelections = this.validateVerseSelections.bind(this);
    this._loadBookAlignments = this._loadBookAlignments.bind(this);
    this._showResetDialog = this._showResetDialog.bind(this);
    this.getProgress = this.getProgress.bind(this);
    this._clearCachedAlignmentMemory = this._clearCachedAlignmentMemory.bind(this);
    this._clearReducers = this._clearReducers.bind(this);
    this.getVerseRawText = this.getVerseRawText.bind(this);
    this.getVerseData = this.getVerseData.bind(this);
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
      const { reference: { bookId: prevBook, chapter: prevChapter } } = prevContext;
      const { reference: { bookId: nextBook, chapter: nextChapter } } = nextContext;

      if (prevBook !== nextBook || prevChapter !== nextChapter) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if the tool name changed.
   * @param prevToolName
   * @param nextToolName
   * @return {boolean}
   */
  static _didToolChange(prevToolName, nextToolName) {
    if (!prevToolName && nextToolName) {
      return true;
    }

    if (prevToolName && nextToolName) {
      if (prevToolName !== nextToolName) {
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
        sourceBook,
      },
      resetVerse,
    } = props;

    for (const verse of Object.keys(targetBook[chapter])) {
      if (isValidVerse(verse)) { // only load valid verse ids
        if (sourceBook[chapter][verse] === undefined) {
          console.warn(
            `Missing passage ${chapter}:${verse} in source text. Skipping alignment initialization.`);
          continue;
        }

        const sourceTokens = tokenizeVerseObjects(sourceBook[chapter][verse].verseObjects);
        const targetVerseText = removeUsfmMarkers(targetBook[chapter][verse]);
        const targetTokens = Lexer.tokenize(targetVerseText);
        resetVerse(chapter, verse, sourceTokens, targetTokens);
      }
    }
  }

  /**
   * method to validate verse selections
   * @param {number} chapter
   * @param {number} verse
   * @param {boolean} silent - if true, alignments invalidated prompt is not displayed, only valid returned
   * @return {boolean} returns true if no checks invalidated
   */
  validateVerseSelections(chapter, verse, silent=false) {
    const tnValid = this.validateVerseInTool(TRANSLATION_NOTES, chapter, verse, silent);
    const twValid = this.validateVerseInTool(TRANSLATION_WORDS, chapter, verse, silent);
    return tnValid && twValid;
  }

  /**
   * will call validateVerse in the tool API
   * @param {string} toolName
   * @param {number} chapter
   * @param {number} verse
   * @param {boolean} silent - if true, alignments invalidated prompt is not displayed, only valid returned
   * @return {boolean} returns true if no checks invalidated
   */
  validateVerseInTool(toolName, chapter, verse, silent) {
    const {tc: {tools}} = this.props;

    const toolAPI = tools && tools[toolName];

    if (toolAPI) {
      try {
        return toolAPI.trigger('validateVerse', chapter, verse, silent);
      } catch (e) {
        console.error(`validateVerseInTool(${toolName}) - validateVerse failed`, e);
      }
    }
    return false;
  }

  /**
   * API method to validate a verse.
   * And fix things if needed
   * @param {number} chapter
   * @param {number} verse
   * @param {boolean} silent - if true, alignments invalidated prompt is not displayed, only valid returned
   */
  validateVerse(chapter, verse, silent=false) {
    if (!isValidVerse(verse) ||
      isNaN(chapter) || parseInt(chapter) === -1) {
      return;
    }

    const { setGroupMenuItemEdited } = this.props;
    const isValid = this._validateVerse(this.props, chapter, verse, silent);

    if (!silent && !isValid) {
      this._showResetDialog();
    }

    const verseEdited = getIsVerseEdited(this, chapter, verse);
    setGroupMenuItemEdited(chapter, verse, verseEdited);
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
    const { tool: { translate } } = this.props;
    this.props.tc.showIgnorableDialog('alignments_reset', translate('alignments_reset'));
  }

  _loadBookAlignments(props) {
    const {
      tc: {
        targetBook,
        sourceBook,
        showDialog,
        projectDataPathExistsSync,
        readProjectDataSync,
      },
      tool: {
        translate,
        setToolReady,
        setToolLoading,
      },
      contextId,
      indexChapterAlignments,
    } = props;

    if (!contextId) {
      console.warn('Missing context id. alignments not loaded.');
      return;
    }

    setToolLoading();

    const { reference: { bookId } } = contextId;
    const { store } = this.context;
    const state = store.getState();
    let alignmentsAreValid = true;
    let hasCorruptChapters = false;
    this.AllAlignments = [];

    for (const chapter of Object.keys(targetBook)) {
      if (isNaN(chapter) || parseInt(chapter) === -1) {
        continue;
      }

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
          indexChapterAlignments(chapter, json, sourceBook[chapter], targetBook[chapter]);

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

    const alignmentsPath = `alignments_for_${bookId}.json`;
    props.tool.writeToolData(alignmentsPath, JSON.stringify(this.AllAlignments));

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
    const { tc: { targetBook } } = props;
    let bookIsValid = true;

    for (const chapter of Object.keys(targetBook)) {
      if (isNaN(chapter) || parseInt(chapter) === -1) {
        continue;
      }

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
      loadGroupMenuItem,
      tc: { targetBook },
      contextId,
    } = props;
    const { store } = this.context;
    let chapterIsValid = true;
    let bookId = contextId?.reference?.bookId;

    if (!(chapter in targetBook)) {
      console.warn(`Could not validate missing chapter ${chapter}`);
      return true;
    }

    const verses = Object.keys(targetBook[chapter]).sort(verseComparator);
    for (const verse of verses) {
      const verseAlignmentPath = `alignments_${bookId}_${chapter}_${verse}.json`;
      if (!isValidVerse(verse)) {
        this.writeVerseAlignments(store, chapter, verse, props, verseAlignmentPath, bookId);
        continue;
      }
      loadGroupMenuItem(this, chapter, verse, contextId);
      const isValid = this._validateVerse(props, chapter, verse);

      if (!isValid) {
        chapterIsValid = isValid;
      }
      this.writeVerseAlignments(store, chapter, verse, props, verseAlignmentPath, bookId);
    }
    return chapterIsValid;
  }

  writeVerseAlignments(store, chapter, verse, props, verseAlignmentPath, bookId) {
    const reference = {
      chapter,
      verse,
      bookId,
    }
    const alignments = getVerseAlignments(store.getState(), chapter, verse);
    props.tool.writeToolData(verseAlignmentPath, JSON.stringify(alignments));
    for (const alignment of alignments) { alignment.reference = reference } // add reference
    this.AllAlignments.push.apply(this.AllAlignments, alignments); // append alignments
  }

  /**
   * fetch the verse text with USFM
   * @param chapter
   * @param verse
   * @return {boolean}
   */
  getVerseRawText(chapter, verse) {
    const { tc: { targetBook } } = this.props;

    if (verse in targetBook[chapter] && targetBook[chapter][verse]) {
      return targetBook[chapter][verse];
    }
    return null;
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
      tc: { sourceBook },
      repairAndInspectVerse,
    } = props;
    const { store } = this.context;

    const targetVerse = this.getVerseRawText(chapter, verse);

    if (!(targetVerse && verse in sourceBook[chapter])) {
      console.warn(`Could not validate missing verse ${chapter}:${verse}`);
      return true;
    }

    const sourceTokens = tokenizeVerseObjects(
      sourceBook[chapter][verse].verseObjects);
    const targetVerseText = removeUsfmMarkers(targetVerse);
    const targetTokens = Lexer.tokenize(targetVerseText);
    let normalizedSource = '';
    let normalizedSourceArray = [];
    let normalizedTarget = '';
    let normalizedTargetArray = [];

    for (let t of sourceTokens) {
      normalizedSourceArray.push(t.toString());
    }
    normalizedSource = normalizedSourceArray.join(' ');

    for (let t of targetTokens) {
      normalizedTargetArray.push(t.toString());
    }
    normalizedTarget = normalizedTargetArray.join(' ');
    const isAligned = getIsVerseAligned(store.getState(), chapter, verse);
    const areVerseAlignmentsValid = getIsVerseAlignmentsValid(store.getState(), chapter, verse,
      normalizedSource, normalizedTarget);
    const isAlignmentComplete = getIsVerseFinished(this, chapter, verse);

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
      },
      tool: { isReady },
      contextId,
    } = this.props;
    const { reference: { bookId } } = contextId;
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
   * resets cached data in key reducers
   */
  _clearReducers() {
    const {
      clearState,
      clearContextId,
      clearGroupMenu,
      clearGroupsData,
      clearGroupsIndex,
    } = this.props;
    clearState();
    clearContextId();
    clearGroupMenu();
    clearGroupsData();
    clearGroupsIndex();
  }

  /**
   * Lifecycle method
   */
  toolWillConnect() {
    this._clearCachedAlignmentMemory();
    this._clearReducers();
    this._loadBookAlignments(this.props);
  }

  /**
   * Clears the project's cached alignment memory.
   * Memory is cached while looking up global alignment memory.
   */
  _clearCachedAlignmentMemory() {
    if (this.props.tc && this.props.tc.project) {
      const { tc: { project } } = this.props;

      try {
        const resourceId = project.getResourceId();
        const resourceIdLc = resourceId.toLowerCase(); // make sure lower case
        let key = this.getAlignMemoryKey(project.getLanguageId(), resourceIdLc, project.getBookId());
        globalAlignmentCache.remove(key);

        if (resourceId !== resourceIdLc) {// if resource ID is not lower case, make sure we didn't leave behind an old copy in alignment memory
          key = this.getAlignMemoryKey(project.getLanguageId(), resourceId, project.getBookId());
          globalAlignmentCache.remove(key);
        }
      } catch (e) {
        console.error('Failed to clear alignment cache', e);
      }
    }
  }

  /**
   * common method to generate key for a project
   * @param {string} languageId
   * @param {string} resourceIdLc
   * @param {string} bookId
   * @return {string}
   */
  getAlignMemoryKey(languageId, resourceIdLc, bookId) {
    const key = `alignment-memory.${languageId}-${resourceIdLc}-${bookId}`;
    return key;
  }

  /**
   * Lifecycle method
   * @param state
   * @param props
   * @return {*}
   */
  mapStateToProps(state, props) {
    const {
      tc: {
        project,
        targetBook,
        sourceBook,
      },
      tool: { name },
    } = props;
    const contextId = project.readCurrentContextIdSync(name);

    if (contextId) {
      const { reference: { chapter, verse } } = contextId;
      const targetVerseText = removeUsfmMarkers(targetBook[chapter][verse]);
      const sourceVerse = sourceBook[chapter][verse];
      let targetTokens = [];
      let sourceTokens = [];

      if (targetVerseText) {
        targetTokens = Lexer.tokenize(removeUsfmMarkers(targetVerseText));
      }

      if (sourceVerse) {
        sourceTokens = tokenizeVerseObjects(sourceVerse.verseObjects);
      }
      return {
        contextId,
        chapterIsLoaded: getIsChapterLoaded(state, chapter),
        targetTokens,
        sourceTokens,
        alignedTokens: getVerseAlignedTargetTokens(state, chapter, verse),
        verseAlignments: getVerseAlignments(state, chapter, verse),
      };
    } else {
      return {
        contextId: null,
        targetTokens: [],
        sourceTokens: [],
        alignedTokens: [],
        verseAlignments: [],
        chapterIsLoaded: false,
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
      clearContextId,
      clearGroupMenu,
      clearGroupsData,
      clearGroupsIndex,
      clearState,
      indexChapterAlignments,
      loadGroupMenuItem,
      moveSourceToken,
      recordCheck,
      resetVerse,
      repairAndInspectVerse,
      setActiveLocale,
      setGroupMenuItemEdited,
      setGroupMenuItemFinished,
      setGroupMenuItemInvalid,
      unalignTargetToken,
    };

    const dispatchedMethods = {};

    // eslint-disable-next-line array-callback-return
    Object.keys(methods).map(key => {
      dispatchedMethods[key] = (...args) => dispatch(methods[key](...args));
    });

    return dispatchedMethods;
  }

  /**
   * Lifecycle method
   */
  toolWillDisconnect() {
    this._clearCachedAlignmentMemory();
  }

  /**
   * Lifecycle method
   * @param nextProps
   */
  toolWillReceiveProps(nextProps) {
    const { tc: { toolName: nextToolName } } = nextProps;
    const {
      setActiveLocale,
      tc: { appLanguage, toolName: prevToolName },
      tool: { isReady },
    } = this.props;

    if (isReady) {
      const isWaTool = (nextToolName === 'wordAlignment');
      const { store } = this.context;
      const currentLang = getActiveLanguage(store.getState());
      const langId = currentLang && currentLang.code;

      if (isWaTool && langId && (langId !== appLanguage)) {// see if locale language has changed
        setActiveLocale(appLanguage);
      }

      if (Api._didToolChange(prevToolName, nextToolName)) {
        setTimeout(() => {
          const isValid = this._validateBook(nextProps);

          if (!isValid) {
            this._showResetDialog();
          }
        }, 0);
      }
    }
  }

  /**
   * checks reducer to see if verse data is loaded, if not it loads verse data
   * tries to get groupMenu info from reducers, if data missing then it is fetched
   * @param {number} chapter
   * @param {number} verse
   * @param {object} contextId
   */
  getVerseData(chapter, verse, contextId) {
    const { store } = this.context;
    let itemState = getGroupMenuItem(store.getState(), chapter, verse);

    if (!itemState) { // if not yet loaded, then fetch
      const { loadGroupMenuItem } = this.props;

      loadGroupMenuItem(this, chapter, verse, contextId);
      itemState = getGroupMenuItem(store.getState(), chapter, verse);
    }
    return itemState;
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
  setVerseInvalid(chapter, verse, invalid = true, silent = false) {
    const {
      setGroupMenuItemInvalid,
      tool: {
        writeToolData,
        deleteToolFile,
        toolDataPathExists,
      },
    } = this.props;
    const { store } = this.context;
    const itemState = getGroupMenuItem(store.getState(), chapter, verse);

    if (!itemState || itemState[INVALID_KEY] !== invalid) {// see if needs to be updated
      setGroupMenuItemInvalid(chapter, verse, invalid);
    }

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
          const data = { timestamp: (new Date()).toISOString() };
          return writeToolData(dataPath, JSON.stringify(data)).
            then(() => (!silent && this.toolDidUpdate()));
        }
      });
    }
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
      setGroupMenuItemFinished,
      tool: {
        writeToolData,
        deleteToolFile,
      },
      tc: { username },
      recordCheck,
    } = this.props;
    const { store } = this.context;
    const itemState = getGroupMenuItem(store.getState(), chapter, verse);

    if (!itemState || itemState[FINISHED_KEY] !== finished) { // see if needs to be updated
      setGroupMenuItemFinished(chapter, verse, finished);
    }

    const dataPath = path.join('completed', chapter + '', verse + '.json');

    if (finished) {
      this.setVerseInvalid(chapter, verse, false); // reset invalidated flag if finished

      const data = {
        username,
        modifiedTimestamp: (new Date()).toJSON(),
      };
      return writeToolData(dataPath, JSON.stringify(data)).then(() => {
        recordCheck('completed', chapter, verse, true);
      });
    } else {
      return deleteToolFile(dataPath).then(() => {
        recordCheck('completed', chapter, verse, false);
      });
    }
  }

  /**
   * Returns the number of verses that have invalidated alignments
   * @returns {number}
   */
  getInvalidChecks() {
    const { tc: { targetBook }, contextId } = this.props;
    const chapters = Object.keys(targetBook);
    let invalidVerses = 0;

    for (let i = 0, chapterLen = chapters.length; i < chapterLen; i ++) {
      const chapter = chapters[i];

      if (isNaN(chapter) || parseInt(chapter) === -1) {
        continue;
      }

      const verses = Object.keys(targetBook[chapter]);

      for (let j = 0, verseLen = verses.length; j < verseLen; j ++) {
        const verse = verses[j];

        if (!isValidVerse(verse)) {
          continue;
        }

        const itemState = this.getVerseData(chapter, verse, contextId);

        if (itemState[INVALID_KEY]) {
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
    let {
      tc: {
        targetBook,
        contextId: tc_contextId,
      },
      contextId,
    } = this.props;
    contextId = contextId || tc_contextId;
    const chapters = Object.keys(targetBook);
    let totalVerses = 0;
    let completeVerses = 0;

    for (let i = 0, chapterLen = chapters.length; i < chapterLen; i ++) {
      const chapter = chapters[i];

      if (isNaN(chapter) || parseInt(chapter) === -1) {
        continue;
      }

      const verses = Object.keys(targetBook[chapter]);

      for (let j = 0, verseLen = verses.length; j < verseLen; j ++) {
        const verse = verses[j];

        if (!isValidVerse(verse)) {
          continue;
        }

        totalVerses ++;
        const itemState = this.getVerseData(chapter, verse, contextId);
        const isAligned = !itemState[UNALIGNED_KEY];

        if (isAligned || itemState[FINISHED_KEY]) {
          completeVerses ++;
        }
      }
    }

    if (totalVerses > 0) {
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
   * @param {string} bookIdFilter the id of the book to exclude. This will be the current project.
   */
  getGlobalAlignmentMemory(languageId, resourceId, originalLanguageId, bookIdFilter=null) {
    const { tc: { projects } } = this.props;
    const memory = [];
    resourceId = resourceId.toLowerCase(); // make sure lower case

    for (let i = 0, len = projects.length; i < len; i++) {
      const p = projects[i];
      const resourceId_ = p.getResourceId().toLowerCase(); // make sure lower case
      const projectMemoryPath = `alignmentData_WordMap_${resourceId_}_${p.getLanguageId()}_${p.getBookId()}.json`;
      const isCurrentBook = p.getBookId() === bookIdFilter;

      if (p.getLanguageId() === languageId
       && resourceId_ === resourceId
       && p.getOriginalLanguageId() === originalLanguageId) {
        const key = this.getAlignMemoryKey(p.getLanguageId(), resourceId_, p.getBookId());
        const cachedAlignments = globalAlignmentCache.get(key);

        if (cachedAlignments && !isCurrentBook) {
          // de-serialize the project memory
          try {
            const projectMemory = [];

            if (cachedAlignments.length > 0) {
              for (let a of cachedAlignments) {
                const sourceNgram = new Ngram(a.sourceNgram.map(t => new Token(t)));
                const targetNgram = new Ngram(a.targetNgram.map(t => new Token(t)));
                projectMemory.push(new Alignment(sourceNgram, targetNgram));
              }
              if (!isCurrentBook) { // skip if current book, will be added to memory later
                memory.push.apply(memory, projectMemory);
              }
              p.writeDataFileSync(projectMemoryPath, JSON.stringify(projectMemory));
              continue;
            }
          } catch (e) {
            console.warn(`Alignment memory cache is corrupt for ${key}`, e);
          }
        }

        // cache miss
        const projectMemory = [];
        const chaptersDir = path.join('alignmentData', p.getBookId());
        const chapterFiles = p.readDataDirSync(chaptersDir);

        for (let c of chapterFiles) {
          const chapterPath = path.join(chaptersDir, c);

          try {
            const chapterData = p.readDataFileSync(chapterPath);
            const json = JSON.parse(chapterData);
            const alignmentData = migrateChapterAlignments(json, {}, {});

            // format alignments as alignment memory
            for (const verse of Object.keys(alignmentData)) {
              for (const a of alignmentData[verse].alignments) {
                if (a.sourceNgram.length && a.targetNgram.length) {
                  const sourceNgramTokens = a.sourceNgram.map(p => new Token(alignmentData[verse].sourceTokens[p]));
                  const targetNgramTokens = a.targetNgram.map(p => new Token(alignmentData[verse].targetTokens[p]));
                  const alignment = new Alignment(new Ngram(sourceNgramTokens), new Ngram(targetNgramTokens));
                  if (!isCurrentBook) { // skip if current book, will be added to memory later
                    memory.push(alignment);
                  }
                  projectMemory.push(alignment.toJSON(true));
                }
              }
            }
          } catch (e) {
            console.error(`getGlobalAlignmentMemory(${key}): Failed to load alignment data from chapter ${chapterPath}`, e);
          }
        }

        p.writeDataFileSync(projectMemoryPath, JSON.stringify(projectMemory));
        // cache serialized project memory
        globalAlignmentCache.set(key, projectMemory);
      }
    }

    return memory;
  }
}
