import * as types from './actionTypes';
import {migrateChapterAlignments} from '../../utils/migrations';
import path from 'path';

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
 * Loads the alignment data from the disk
 * @param dataReader
 * @param bookId
 * @param chapter
 * @return {Function}
 */
export const loadChapterAlignments = (dataReader, bookId, chapter) => {
  return async dispatch => {
    const dataPath = path.join('alignmentData', bookId, chapter + '.json');
    const data = await dataReader(dataPath);
    const rawChapterData = JSON.parse(data);
    await dispatch(indexChapterAlignments(chapter, rawChapterData));
  };
};

/**
 * Resets the alignment data for a verse.
 * @param {number} chapter
 * @param {number} verse
 * @param {Token[]} sourceTokens
 * @param {Token[]} targetTokens
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
 * @return {Function}
 */
export const indexChapterAlignments = (chapterId, rawAlignmentData) => {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      try {
        // migrate alignment data
        const alignmentData = migrateChapterAlignments(rawAlignmentData);

        // set the loaded alignments
        dispatch(setChapterAlignments(chapterId, alignmentData));
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  };
};

/**
 * Adds a target token to an alignment
 * @param {number} chapter
 * @param {number} verse
 * @param {number} index - the alignment index
 * @param {Token} token - the target token being added to the alignment
 * @return {{}}
 */
export const alignTargetToken = (chapter, verse, index, token) => ({
  type: types.ALIGN_TARGET_TOKEN,
  chapter,
  verse,
  index,
  token
});

/**
 * Removes a target token from an alignment
 * @param {number} chapter
 * @param {number} verse
 * @param {number} index - the alignment index
 * @param {Token} token - the target token being removed from the alignment
 * @return {{}}
 */
export const unalignTargetToken = (chapter, verse, index, token) => ({
  type: types.UNALIGN_TARGET_TOKEN,
  chapter,
  verse,
  index,
  token
});

/**
 * Adds a target token to an alignment
 * @param {number} chapter
 * @param {number} verse
 * @param {number} index - the alignment index
 * @param {Token} token - the target token being added to the alignment
 * @return {{}}
 */
const alignSourceToken = (chapter, verse, index, token) => ({
  type: types.ALIGN_SOURCE_TOKEN,
  chapter,
  verse,
  index,
  token
});

/**
 * Removes a target token from an alignment
 * @param {number} chapter
 * @param {number} verse
 * @param {number} index - the alignment index
 * @param {Token} token - the target token being removed from the alignment
 * @return {{}}
 */
const unalignSourceToken = (chapter, verse, index, token) => ({
  type: types.UNALIGN_SOURCE_TOKEN,
  chapter,
  verse,
  index,
  token
});

/**
 * Inserts a source token as a new alignment
 * @param {number} chapter
 * @param {number} verse
 * @param {Token} token - the source token to insert
 * @return {{type: *, chapter: *, verse: *, token: *}}
 */
const insertSourceToken = (chapter, verse, token) => ({
  type: types.INSERT_ALIGNMENT,
  chapter,
  verse,
  token
});

/**
 * This thunk moves a source token between alignments
 * @param {number} chapter
 * @param {number} verse
 * @param {number} nextIndex - the token to which the token will be moved
 * @param {number} prevIndex - the index from which the token will be moved
 * @param {Token} token - the source token to move
 * @return {Function}
 */
export const moveSourceToken = (
  {chapter, verse, nextIndex, prevIndex, token}) => {
  return dispatch => {
    dispatch(unalignSourceToken(chapter, verse, prevIndex, token));
    if (prevIndex === nextIndex) {
      dispatch(insertSourceToken(chapter, verse, token));
    } else {
      // TRICKY: shift the next index since we removed an alignment
      const index = prevIndex < nextIndex ? nextIndex - 1 : nextIndex;
      dispatch(alignSourceToken(chapter, verse, index, token));
    }
  };
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
 * Clears the tool's redux state
 * @return {*}
 */
export const clearState = () => ({
  type: types.CLEAR_STATE
});
