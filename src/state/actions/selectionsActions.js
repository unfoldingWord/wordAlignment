import fs from 'fs-extra';
import path from 'path-extra';
import isEqual from 'deep-equal';
import usfm from 'usfm-js';
import { batchActions } from 'redux-batched-actions';
import { checkSelectionOccurrences } from 'selections';
// constants
import {
  WORD_ALIGNMENT,
  TRANSLATION_WORDS,
  TRANSLATION_NOTES,
  ALERT_ALIGNMENTS_RESET_ID,
  ALERT_ALIGNMENTS_RESET_MSG,
  ALERT_SELECTIONS_INVALIDATED_ID,
  ALERT_SELECTIONS_INVALIDATED_MSG,
  ALERT_ALIGNMENTS_AND_SELECTIONS_RESET_MSG,
} from '../../common/constants';
// helpers
import generateTimestamp from '../../utils/generateTimestamp';
import { sameContext } from '../../utils/contextIdHelpers';
import { getGroupDataForVerse } from '../../utils/groupDataHelpers';
import {
  saveSelectionsForOtherContext, saveSelections, saveInvalidated,
} from '../../utils/localStorage';
// selectors
import { getContextId, getGroupsData } from '../../state/selectors';
import { loadCheckData } from '../../utils/CheckDataHelper';
import {
  CHANGE_SELECTIONS,
  SET_INVALIDATION_IN_GROUPDATA,
  TOGGLE_SELECTIONS_IN_GROUPDATA,
} from './actionTypes';

/**
 * Loads the latest selections file from the file system for the specific contextID.
 * @param {object} contextId - ContextId.
 * @param {object} tc - tc.
 */
export function loadSelections(contextId, tc) {
  return dispatch => {
    const selectionsObject = loadCheckData(contextId, 'selections', tc);

    if (selectionsObject) {
      let {
        selections,
        modifiedTimestamp,
        nothingToSelect,
        username,
        userName, // for old project data
        gatewayLanguageCode,
        gatewayLanguageQuote,
      } = selectionsObject;
      username = username || userName;

      dispatch({
        type: CHANGE_SELECTIONS,
        selections: selections,
        nothingToSelect: nothingToSelect,
        username,
        modifiedTimestamp: modifiedTimestamp,
        gatewayLanguageCode: gatewayLanguageCode,
        gatewayLanguageQuote: gatewayLanguageQuote,
      });
    } else {
      // The object is undefined because the file wasn't found in the directory thus we init the reducer to a default value.
      dispatch({
        type: CHANGE_SELECTIONS,
        modifiedTimestamp: null,
        selections: [],
        username: null,
      });
    }
  };
}

/**
 * Adds a selection array to the selections reducer.
 * @param {array} selections - An array of selections.
 * @param {boolean} invalidated - if true then selection if flagged as invalidated, otherwise it is not flagged as invalidated
 * @param {object} contextId - optional contextId to use, otherwise will use current
 * @param {array} batchGroupData - if present then add group data actions to this array for later batch operation
 * @param {boolean} nothingToSelect - nothing to select checkbox.
 * @param {String} username - User name.
 * @param {String} currentToolName - Current tool selected.
 * @param {string} gatewayLanguageCode - gateway Language Code
 * @param {string} gatewayLanguageQuote - gateway Language Quote
 * @param {string} projectSaveLocation - gateway Language Quote
 */
export const changeSelections = (selections, invalidated = false, contextId = null, batchGroupData = null, nothingToSelect = false,
  username, currentToolName, gatewayLanguageCode, gatewayLanguageQuote, projectSaveLocation) => ((dispatch, getState) => {
  const state = getState();
  const validTools = [TRANSLATION_WORDS, TRANSLATION_NOTES];
  const currentContextId = getContextId(state);
  contextId = contextId || currentContextId; // use current if contextId is not passed

  if (validTools.includes(currentToolName) || validTools.includes(contextId.tool)) {
    if (sameContext(currentContextId, contextId)) { // see if we need to update current selection
      const modifiedTimestamp = generateTimestamp();

      dispatch({
        type: CHANGE_SELECTIONS,
        modifiedTimestamp,
        gatewayLanguageCode,
        gatewayLanguageQuote,
        selections,
        nothingToSelect,
        username,
      });

      const selectionData = {
        modifiedTimestamp,
        gatewayLanguageCode,
        gatewayLanguageQuote,
        selections,
        nothingToSelect,
        username,
      };
      // Persisting selection checkData in filesystem.
      saveSelections(contextId, selectionData, projectSaveLocation);
      const invalidatedData = {
        username,
        invalidated,
        gatewayLanguageCode,
        gatewayLanguageQuote,
        modifiedTimestamp,
      };
      // Peristing invalidation data
      saveInvalidated(contextId, invalidatedData, projectSaveLocation);
    } else {
      saveSelectionsForOtherContext(gatewayLanguageCode, gatewayLanguageQuote, selections, invalidated, username, contextId, projectSaveLocation);
    }

    const actionsBatch = Array.isArray(batchGroupData) ? batchGroupData : []; // if batch array passed in then use it, otherwise create new array

    actionsBatch.push({
      type: TOGGLE_SELECTIONS_IN_GROUPDATA,
      contextId,
      selections,
      nothingToSelect,
      projectSaveLocation,
    });
    actionsBatch.push({
      type: SET_INVALIDATION_IN_GROUPDATA,
      contextId,
      boolean: invalidated,
      projectSaveLocation,
    });

    if (!Array.isArray(batchGroupData)) { // if we are not returning batch, then process actions now
      dispatch(batchActions(actionsBatch));
    }
  }
});

/**
 * @description This method validates the current selections to see if they are still valid.
 * @param {string} targetVerse - target bible verse.
 * @param {object} contextId - optional contextId to use, otherwise will use current
 * @param {number} chapterNumber - optional chapter number of verse text being edited, if not given will use contextId
 * @param {number} verseNumber - optional verse number of verse text being edited, if not given will use contextId
 * @param {boolean} showInvalidation - if true then selections invalidation warning is shown - otherwise just set flag in results
 * @param {object} results - returns state of validations
 * @param {array} batchGroupData - if present then add group data actions to this array for later batch operation
 * @param {string} projectSaveLocation
 * @param {string} bookId
 * @param {string} currentToolName
 * @param {string} username
 * @param {string} gatewayLanguageCode
 * @param {string} gatewayLanguageQuote
 * @param {object} tc
 */
export const validateSelections = (targetVerse, contextId = null, chapterNumber = null, verseNumber = null, showInvalidation = true, results = {}, batchGroupData = null,
  projectSaveLocation, bookId, currentToolName, username, gatewayLanguageCode, gatewayLanguageQuote, tc) => (dispatch, getState) => {
  const state = getState();
  contextId = contextId || getContextId(state);
  const { chapter, verse } = contextId.reference;
  chapterNumber = chapterNumber || chapter;
  verseNumber = verseNumber || verse;
  let selectionInvalidated = false;
  const actionsBatch = Array.isArray(batchGroupData) ? batchGroupData : []; // if batch array passed in then use it, otherwise create new array

  if (currentToolName !== WORD_ALIGNMENT) {
    const groupsData = getGroupsData(state);
    // for this groupId, find every check for this chapter/verse
    const matchedGroupData = getGroupDataForGroupIdChapterVerse(groupsData, contextId.groupId, chapterNumber, verseNumber);

    for (let i = 0, l = matchedGroupData.length; i < l; i++) {
      const groupObject = matchedGroupData[i];
      const selections = getSelectionsForContextID(groupObject.contextId, tc);
      const validSelections = checkSelectionOccurrences(targetVerse, selections);
      const selectionsChanged = (selections.length !== validSelections.length);

      if (selectionsChanged) {
        // clear selections
        dispatch(
          changeSelections(
            [], true, groupObject.contextId, actionsBatch, null, username, currentToolName,
            gatewayLanguageCode, gatewayLanguageQuote, projectSaveLocation
          ));
      }
      selectionInvalidated = selectionInvalidated || selectionsChanged;
    }

    const results_ = { selectionsChanged: selectionInvalidated };
    dispatch(validateAllSelectionsForVerse(targetVerse, results_, true, contextId, false, actionsBatch, username, currentToolName, gatewayLanguageCode, gatewayLanguageQuote, projectSaveLocation));
    selectionInvalidated = selectionInvalidated || results_.selectionsChanged; // if new selections invalidated
    selectionInvalidated = validateSelectionsForUnloadedTools(
      projectSaveLocation, bookId, chapter, verse, targetVerse, selectionInvalidated, username, currentToolName, gatewayLanguageCode, gatewayLanguageQuote
    );
  } else { // wordAlignment tool
    selectionInvalidated = validateSelectionsForUnloadedTools(
      projectSaveLocation, bookId, chapter, verse, targetVerse, selectionInvalidated, username, currentToolName, gatewayLanguageCode, gatewayLanguageQuote
    );
  }

  if (!Array.isArray(batchGroupData)) { // if we are not returning batch, then process actions now
    dispatch(batchActions(actionsBatch));
  }

  results.selectionsChanged = selectionInvalidated;

  if (showInvalidation && selectionInvalidated) {
    dispatch(showSelectionsInvalidatedWarning());
  }
};

/**
 * get selections for context ID
 * @param {Object} contextId - contextId to use in lookup.
 * @param {Object} tc - tc.
 * @return {Array} - selections
 */
export const getSelectionsForContextID = (contextId, tc) => {
  let selections = [];
  const selectionsObject = loadCheckData(contextId, 'selections', tc);

  if (selectionsObject) {
    selections = selectionsObject.selections;
  }

  return selections;
};

/**
 * populates groupData with all groupData entries for groupId and chapter/verse
 * @param {Object} groupsDataReducer
 * @param {String} groupId
 * @param {Number} chapterNumber - optional chapter number of verse text being edited
 * @param {Number} verseNumber - optional verse number of verse text being edited
 * @return {Array} - group data items that match
 */
export const getGroupDataForGroupIdChapterVerse = (groupsData, groupId, chapterNumber, verseNumber) => {
  const matchedGroupData = [];
  const groupData = groupId && groupsData && groupsData[groupId];

  if (groupData && groupData.length) {
    for (let i = 0, l = groupData.length; i < l; i++) {
      const groupObject = groupData[i];

      if ((groupObject.contextId.reference.chapter === chapterNumber) &&
        (groupObject.contextId.reference.verse === verseNumber)) {
        matchedGroupData.push(groupObject);
      }
    }
  }
  return matchedGroupData;
};

/**
 * verify all selections for current verse
 * @param {string} targetVerse - new text for verse
 * @param {object} results - keeps state of
 * @param {Boolean} skipCurrent - if true, then skip over validation of current contextId
 * @param {Object} contextId - optional contextId to use, otherwise will use current
 * @param {Boolean} warnOnError - if true, then will show message on selection change
 * @param {Array|null} batchGroupData - if present then add group data actions to this array for later batch operation
 * @return {Function}
 */
export const validateAllSelectionsForVerse = (targetVerse, results, skipCurrent = false, contextId = null, warnOnError = false, batchGroupData = null,
  username, currentToolName, gatewayLanguageCode, gatewayLanguageQuote, projectSaveLocation) => (dispatch, getState) => {
  const state = getState();
  const initialSelectionsChanged = results.selectionsChanged;
  contextId = contextId || state.contextIdReducer.contextId;
  const groupsData = getGroupsData(state);
  const groupsDataForVerse = getGroupDataForVerse(groupsData, contextId);
  let filtered = null;
  results.selectionsChanged = false;
  const actionsBatch = Array.isArray(batchGroupData) ? batchGroupData : []; // if batch array passed in then use it, otherwise create new array

  const groupsDataKeys = Object.keys(groupsDataForVerse);

  for (let i = 0, l = groupsDataKeys.length; i < l; i++) {
    const groupItemKey = groupsDataKeys[i];
    const groupItem = groupsDataForVerse[groupItemKey];

    for (let j = 0, lenGI = groupItem.length; j < lenGI; j++) {
      const checkingOccurrence = groupItem[j];
      const selections = checkingOccurrence.selections;

      if (!skipCurrent || !sameContext(contextId, checkingOccurrence.contextId)) {
        if (selections && selections.length) {
          if (!filtered) { // for performance, we filter the verse only once and only if there is a selection
            filtered = usfm.removeMarker(targetVerse); // remove USFM markers
          }

          const validSelections = checkSelectionOccurrences(filtered, selections);

          if (selections.length !== validSelections.length) {
            results.selectionsChanged = true;
            dispatch(
              changeSelections(
                [], true, checkingOccurrence.contextId, batchGroupData, null, username, currentToolName,
                gatewayLanguageCode, gatewayLanguageQuote, projectSaveLocation
              )
            ); // clear selection
          }
        }
      }
    }
  }

  if (!Array.isArray(batchGroupData)) { // if we are not returning batch, then process actions now
    dispatch(batchActions(actionsBatch));
  }

  if (warnOnError && (initialSelectionsChanged || results.selectionsChanged)) {
    dispatch(showSelectionsInvalidatedWarning());
  }
};

/**
 * does validation for tools not loaded into group reducer
 * @param {String} projectSaveLocation
 * @param {String} bookId
 * @param {String|Number} chapter
 * @param {String|Number} verse
 * @param {Object} state
 * @param {String} targetVerse - new verse text
 * @param {Boolean} selectionInvalidated
 * @param {Boolean} username
 * @param {Boolean} currentToolName
 * @param {Boolean} gatewayLanguageCode
 * @param {Boolean} gatewayLanguageQuote
 * @return {Boolean} - updated value for selectionInvalidated
 */
const validateSelectionsForUnloadedTools = (projectSaveLocation, bookId, chapter, verse, targetVerse,
  selectionInvalidated, username, currentToolName, gatewayLanguageCode, gatewayLanguageQuote) => (dispatch) => {
  const selectionsPath = path.join(projectSaveLocation, '.apps', 'translationCore', 'checkData', 'selections', bookId, chapter.toString(), verse.toString());

  if (fs.existsSync(selectionsPath)) {
    let files = fs.readdirSync(selectionsPath);

    files = files.filter(file => // filter the filenames to only use .json
      path.extname(file) === '.json'
    ).sort();

    // load all files keeping the latest for each context
    const latestContext = {};

    for (let i = 0, l = files.length; i < l; i++) {
      const selectionsData = fs.readJsonSync(path.join(selectionsPath, files[i]));
      const contextId = selectionsData.contextId;

      if (contextId) {
        if (currentToolName !== contextId.tool) {
          const contextIdQuote = Array.isArray(contextId.quote) ? contextId.quote.map(({ word }) => word).join(' ') : contextId.quote;
          const key = contextId.groupId + ':' + contextId.occurrence + ':' + contextIdQuote;
          latestContext[key] = selectionsData;
        }
      }
    }

    const modifiedTimestamp = generateTimestamp();
    const keys = Object.keys(latestContext);

    for (let j = 0, l = keys.length; j < l; j++) {
      const selectionsData = latestContext[keys[j]];
      const validSelections = checkSelectionOccurrences(targetVerse, selectionsData.selections);

      if (!isEqual(selectionsData.selections, validSelections)) { // if true found invalidated check
        // add invalidation entry
        const newInvalidation = {
          contextId: selectionsData.contextId,
          invalidated: true,
          username,
          modifiedTimestamp: modifiedTimestamp,
          gatewayLanguageCode: selectionsData.gatewayLanguageCode,
          gatewayLanguageQuote: selectionsData.gatewayLanguageQuote,
        };
        const newFilename = modifiedTimestamp + '.json';
        const invalidatedCheckPath = path.join(projectSaveLocation, '.apps', 'translationCore', 'checkData', 'invalidated', bookId, chapter.toString(), verse.toString());
        fs.ensureDirSync(invalidatedCheckPath);
        fs.outputJSONSync(path.join(invalidatedCheckPath, newFilename.replace(/[:"]/g, '_')), newInvalidation, { spaces: 2 });
        dispatch(
          changeSelections(
            [], true, newInvalidation.contextId, username, currentToolName,
            gatewayLanguageCode, gatewayLanguageQuote, projectSaveLocation
          )
        );
        selectionInvalidated = true;
      }
    }
  }
  return selectionInvalidated;
};

/**
 * displays warning that selections have been invalidated
 */
export const showSelectionsInvalidatedWarning = () => showInvalidatedWarnings(true, false);

/**
 * Displays warning that selections, alignments, or both have been invalidated
 * @param {boolean} showSelectionInvalidated
 * @param {boolean} showAlignmentsInvalidated
 * @param {Function} translate - locale method.
 * @param {Function} showIgnorableAlert - show alert method.
 * @return {Function}
 */
export const showInvalidatedWarnings = (showSelectionInvalidated, showAlignmentsInvalidated, translate, showIgnorableAlert) => () => {
  let message = null;
  let id = null;

  if (showSelectionInvalidated && showAlignmentsInvalidated) {
    message = ALERT_ALIGNMENTS_AND_SELECTIONS_RESET_MSG;
    id = ALERT_ALIGNMENTS_RESET_ID;
  } else if (showSelectionInvalidated) {
    message = ALERT_SELECTIONS_INVALIDATED_MSG;
    id = ALERT_SELECTIONS_INVALIDATED_ID;
  } else { // (showAlignmentsInvalidated)
    message = ALERT_ALIGNMENTS_RESET_MSG;
    id = ALERT_ALIGNMENTS_RESET_ID;
  }

  showIgnorableAlert(id, translate(message));
};
