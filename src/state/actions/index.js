import Lexer from 'wordmap-lexer';
import {migrateChapterAlignments} from '../../utils/migrations';
import {tokenizeVerseObjects} from '../../utils/verseObjects';
import {removeUsfmMarkers} from '../../utils/usfmHelpers';
import {getVerseAlignments, getRenderedVerseAlignments} from '../reducers';
import {areAlignmentsEquivalent} from '../../utils/alignmentValidation';
import * as types from './actionTypes';

/**
 * Puts alignment data that has been loaded from the file system into redux.
 * @param {number} chapter - the chapter to which these alignment data belongs
 * @param {object} data - the new alignment data;
 * @return {Function}
 */
export const setChapterAlignments = (chapter, data) => ({
  type: types.SET_CHAPTER_ALIGNMENTS,
  chapter,
  alignments: data
});

/**
 * Updates the verse tokens and resets the alignment data.
 * @param {number} chapter
 * @param {number} verse
 * @param {Token[]} sourceTokens - the correct verse source tokens
 * @param {Token[]} targetTokens - the correct verse target tokens
 */
export const resetVerse = (chapter, verse, sourceTokens, targetTokens) => {
  return dispatch => {
    dispatch(setSourceTokens(chapter, verse, sourceTokens));
    dispatch(setTargetTokens(chapter, verse, targetTokens));
    dispatch(resetVerseAlignments(chapter, verse));
  };
};

/**
 * Retrieves some extra data from redux before inserting the chapter alignments.
 * The pain point here is due to the current alignment file format we cannot
 * reliably assume token order. Therefore we must include a frame of reference.
 * @param chapterId
 * @param {object} rawAlignmentData
 * @param {object} sourceChapter - source chapter data used as a baseline for sorting
 * @param {object} targetChapter - target chapter data used as a baseline for sorting
 * @return {Function}
 */
export const indexChapterAlignments = (
  chapterId, rawAlignmentData, sourceChapter, targetChapter) => {
  return (dispatch) => {
    // tokenize baseline chapters
    const targetChapterTokens = {};
    const sourceChapterTokens = {};
    for (const verse of Object.keys(targetChapter)) {
      const targetVerseText = removeUsfmMarkers(targetChapter[verse]);
      targetChapterTokens[verse] = Lexer.tokenize(targetVerseText);
    }
    for (const verse of Object.keys(sourceChapter)) {
      sourceChapterTokens[verse] = tokenizeVerseObjects(
        sourceChapter[verse].verseObjects);
    }

    // migrate alignment data
    const alignmentData = migrateChapterAlignments(rawAlignmentData,
      sourceChapterTokens, targetChapterTokens);

    // set the loaded alignments
    dispatch(setChapterAlignments(chapterId, alignmentData));
  };
};

/**
 * Adds a target token to an alignment
 * @param {number} chapter
 * @param {number} verse
 * @param {object} alignmentIndex - the alignment index to which the token will be moved.
 * @param {Token} token - the target token being added to the alignment
 * @return {{}}
 */
export const alignTargetToken = (chapter, verse, alignmentIndex, token) => ({
  type: types.ALIGN_RENDERED_TARGET_TOKEN,
  chapter,
  verse,
  index: alignmentIndex,
  token
});

/**
 * Removes a target token from an alignment
 * @param {number} chapter
 * @param {number} verse
 * @param {object} alignmentIndex - the alignment index from which the token will be removed
 * @param {Token} token - the target token being removed from the alignment
 * @return {{}}
 */
export const unalignTargetToken = (chapter, verse, alignmentIndex, token) => ({
  type: types.UNALIGN_RENDERED_TARGET_TOKEN,
  chapter,
  verse,
  index: alignmentIndex,
  token
});

/**
 * Adds a source token to an alignment
 * @param {number} chapter
 * @param {number} verse
 * @param {number} alignmentIndex - the alignment index to which the source token will be moved.
 * @param {Token} token - the source token being added to the alignment
 * @return {{}}
 */
const alignSourceToken = (chapter, verse, alignmentIndex, token) => ({
  type: types.ALIGN_RENDERED_SOURCE_TOKEN,
  chapter,
  verse,
  index: alignmentIndex,
  token
});

/**
 * Removes a source token from an alignment
 * @param {number} chapter
 * @param {number} verse
 * @param {object} alignmentIndex - the alignment index from which the source token will be removed.
 * @param {Token} token - the source token being removed from the alignment
 * @return {{}}
 */
const unalignSourceToken = (chapter, verse, alignmentIndex, token) => ({
  type: types.UNALIGN_RENDERED_SOURCE_TOKEN,
  chapter,
  verse,
  index: alignmentIndex,
  token
});

/**
 * Inserts a source token as a new alignment
 * @param {number} chapter
 * @param {number} verse
 * @param {Token} token - the source token to insert
 * @return {{type: *, chapter: *, verse: *, token: *}}
 */
export const insertSourceToken = (chapter, verse, token) => ({
  type: types.INSERT_RENDERED_ALIGNMENT,
  chapter,
  verse,
  token
});

/**
 * Moves a source token between alignments
 * @param {number} chapter
 * @param {number} verse
 * @param {object} nextAlignmentIndex - the alignment index to which the token will be moved
 * @param {object} prevAlignmentIndex - the alignment index from which the token will be moved
 * @param {Token} token - the source token to move
 * @return {Function}
 */
export const moveSourceToken = (
  chapter, verse, nextAlignmentIndex, prevAlignmentIndex, token) => {

  return (dispatch, getState) => {
    const initialAlignments = getVerseAlignments(getState(), chapter, verse);
    dispatch(unalignSourceToken(chapter, verse, prevAlignmentIndex, token));

    if (prevAlignmentIndex === nextAlignmentIndex) { // doing unmerge operation
      dispatch(insertSourceToken(chapter, verse, token));
    } else {
      // if we are dragging from an alignment with multiple merged words
      const sourceMerged = (initialAlignments[prevAlignmentIndex] && initialAlignments[prevAlignmentIndex].sourceNgram && initialAlignments[prevAlignmentIndex].sourceNgram.length) > 1;
      const previousTargetAlignments = initialAlignments[prevAlignmentIndex] && initialAlignments[prevAlignmentIndex].targetNgram;
      let index = nextAlignmentIndex;
      if (!sourceMerged) {
        // TRICKY: shift the next index since we removed an alignment (i.e. we merged a single word into a merged alignment)
        index = shiftRelativeToRemoved(nextAlignmentIndex,
          prevAlignmentIndex);
      }
      dispatch(alignSourceToken(chapter, verse, index, token));
      if (!sourceMerged && (previousTargetAlignments.length > 0)) { // move over aligned target words if we moved a single primary word
        previousTargetAlignments.forEach(tartgetToken => dispatch(alignTargetToken(chapter, verse, index, tartgetToken)));
      }
    }
  };
};

const shiftRelativeToRemoved = (index, removedIndex) => {
  return removedIndex < index ? index - 1 : index;
};

/**
 * Sets the target tokens for the verse
 * @param {number} chapter
 * @param {number} verse
 * @param {Token[]} tokens
 */
export const setTargetTokens = (chapter, verse, tokens) => ({
  type: types.SET_TARGET_TOKENS,
  tokens,
  chapter,
  verse
});

/**
 * Sets the source tokens for the verse
 * @param {number} chapter
 * @param {number} verse
 * @param {Token[]} tokens
 */
export const setSourceTokens = (chapter, verse, tokens) => ({
  type: types.SET_SOURCE_TOKENS,
  tokens,
  chapter,
  verse
});

/**
 * Clears the alignment data for a verse
 * @param {number} chapter
 * @param {number} verse
 * @return {*}
 */
export const resetVerseAlignments = (chapter, verse) => ({
  type: types.RESET_VERSE_ALIGNMENTS,
  chapter,
  verse
});

/**
 * Updates the verse tokens and repairs the alignment data.
 * @param {number} chapter
 * @param {number} verse
 * @param {Token[]} sourceTokens - the correct verse source tokens
 * @param {Token[]} targetTokens - the correct verse target tokens
 * @return {Function}
 */
export const repairVerse = (chapter, verse, sourceTokens, targetTokens) => ({
  type: types.REPAIR_VERSE_ALIGNMENTS,
  chapter,
  verse,
  sourceTokens,
  targetTokens
});

/**
 * Updates the verse tokens and repairs the alignment data.
 * This will run asynchronously and give a boolean indicating if the alignments were changed.
 * @param {number} chapter
 * @param {number} verse
 * @param {Token[]} sourceTokens - the correct verse source tokens
 * @param {Token[]} targetTokens - the correct verse target tokens
 * @return {Function}
 */
export const repairAndInspectVerse = (
  chapter, verse, sourceTokens, targetTokens) => {
  return (dispatch, getState) => {
    const prev = getVerseAlignments(getState(), chapter, verse);
    dispatch(repairVerse(chapter, verse, sourceTokens, targetTokens));
    const next = getVerseAlignments(getState(), chapter, verse);

    return !areAlignmentsEquivalent(prev, next);
  };
};

/**
 * Clears the tool's redux state
 * @return {*}
 */
export const clearState = () => ({
  type: types.CLEAR_STATE
});

/**
 * Sets the alignment suggestions for a verse
 * The thunk will return a rejected Promise if there is no visible change in the alignments.
 * @param {number} chapter
 * @param {number} verse
 * @param {Alignment[]} predictions
 */
export const setAlignmentPredictions = (chapter, verse, predictions) =>
  (dispatch, getState) => {
    const alignments = [];
    const minConfidence = 1;
    const prev = getRenderedVerseAlignments(getState(), chapter, verse);
    for (const p of predictions) {
      if (p.confidence >= minConfidence) {
        alignments.push({
          sourceNgram: p.alignment.source.tokens,
          targetNgram: p.alignment.target.tokens
        });
        if (p.alignment.target.tokens.length) {
          // hasSuggestions = true;
        }
      } else {
        // exclude predictions with a low confidence
        // TRICKY: split ignored predictions to avoid suggesting merging.
        for (const t of p.alignment.source.tokens) {
          alignments.push({
            sourceNgram: [t],
            targetNgram: []
          });
        }
      }
    }
    dispatch({
      type: types.SET_ALIGNMENT_SUGGESTIONS,
      chapter,
      verse,
      alignments
    });
    const next = getRenderedVerseAlignments(getState(), chapter, verse);
    const suggestionsChanged = JSON.stringify(prev) !== JSON.stringify(next);
    if(suggestionsChanged) {
      return Promise.resolve();
    } else {
      return Promise.reject();
    }
  };

/**
 * Removes all alignment suggestions for a verse
 * @param chapter
 * @param verse
 * @return {{type: string, chapter: *, verse: *}}
 */
export const clearAlignmentSuggestions = (chapter, verse) => ({
  type: types.RESET_VERSE_ALIGNMENT_SUGGESTIONS,
  chapter,
  verse
});

/**
 * Accepts all alignment suggestions for a verse
 * @param chapter
 * @param verse
 * @return {{type: *, chapter: *, verse: *}}
 */
export const acceptAlignmentSuggestions = (chapter, verse) => ({
  type: types.ACCEPT_VERSE_ALIGNMENT_SUGGESTIONS,
  chapter,
  verse
});

/**
 * Removes a single alignment suggestion
 * @param chapter
 * @param verse
 * @param alignmentIndex
 * @param token
 * @return {{type: string, chapter: *, verse: *, alignmentIndex: *, tokenIndex: *}}
 */
export const removeTokenSuggestion = (
  chapter, verse, alignmentIndex, token) => ({
  type: types.REMOVE_TOKEN_SUGGESTION,
  chapter,
  verse,
  index: alignmentIndex,
  token
});

export const acceptTokenSuggestion = (
  chapter, verse, alignmentIndex, token) => ({
  type: types.ACCEPT_TOKEN_SUGGESTION,
  chapter,
  verse,
  index: alignmentIndex,
  token
});

/**
 * Records the value of a check.
 * @param {string} check -  the check id
 * @param {number} chapter - the chapter number
 * @param {verse} verse - the verse number
 * @param {*} data - the check data
 * @returns {{chapter: *, data: *, check: *, verse: *, type: string, timestamp: string}}
 */
export const recordCheck = (check, chapter, verse, data) => ({
  type: types.RECORD_CHECK,
  check,
  timestamp: (new Date()).toJSON(),
  chapter,
  verse,
  data
});
