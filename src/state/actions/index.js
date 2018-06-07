import * as types from './actionTypes';
import {migrateChapterAlignments} from '../../utils/migrations';
import Lexer from 'word-map/Lexer';
import {tokenizeVerseObjects} from '../../utils/verseObjects';

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
      targetChapterTokens[verse] = Lexer.tokenize(targetChapter[verse]);
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
 * @param {object} alignment - the alignment to which the token will be moved.
 * @param {Token} token - the target token being added to the alignment
 * @return {{}}
 */
export const alignTargetToken = (chapter, verse, alignment, token) => ({
  type: types.ALIGN_RENDERED_TARGET_TOKEN,
  chapter,
  verse,
  index: alignment.index,
  token
});

/**
 * Removes a target token from an alignment
 * @param {number} chapter
 * @param {number} verse
 * @param {object} alignment - the alignment from which the token will be removed
 * @param {Token} token - the target token being removed from the alignment
 * @return {{}}
 */
export const unalignTargetToken = (chapter, verse, alignment, token) => ({
  type: types.UNALIGN_RENDERED_TARGET_TOKEN,
  chapter,
  verse,
  index: alignment.index,
  token
});

/**
 * Adds a source token to an alignment
 * @param {number} chapter
 * @param {number} verse
 * @param {number} alignment - the alignment to which the source token will be moved.
 * @param {Token} token - the source token being added to the alignment
 * @return {{}}
 */
const alignSourceToken = (chapter, verse, alignment, token) => ({
  type: types.ALIGN_RENDERED_SOURCE_TOKEN,
  chapter,
  verse,
  index: alignment.index,
  token
});

/**
 * Removes a source token from an alignment
 * @param {number} chapter
 * @param {number} verse
 * @param {object} alignment - the alignment from which the source token will be removed.
 * @param {Token} token - the source token being removed from the alignment
 * @return {{}}
 */
const unalignSourceToken = (chapter, verse, alignment, token) => ({
  type: types.UNALIGN_RENDERED_SOURCE_TOKEN,
  chapter,
  verse,
  index: alignment.index,
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
 * @param {object} nextAlignment - the alignment to which the token will be moved
 * @param {object} prevAlignment - the alignment from which the token will be moved
 * @param {Token} token - the source token to move
 * @return {Function}
 */
export const moveSourceToken = (
  {chapter, verse, nextAlignment, prevAlignment, token}) => {
  // return {
  //   type: types.MOVE_SOURCE_TOKEN,
  //   chapter,
  //   verse,
  //   token,
  //   nextIndex: nextAlignment.index,
  //   prevIndex: prevAlignment.index
  // };
  return dispatch => {
    dispatch(unalignSourceToken(chapter, verse, prevAlignment, token));
    // TRICKY: shift the affected alignment indices as needed
    // if (nextAlignment.suggestionAlignments) {
    //   for (let i = 0; i < nextAlignment.suggestionAlignments.length; i++) {
    //     const affectedIndex = nextAlignment.suggestionAlignments[i];
    //     nextAlignment.suggestionAlignments[i] = shiftRelativeToRemoved(
    //       affectedIndex, prevAlignment.index);
    //   }
    // }

    if (prevAlignment.index === nextAlignment.index) {
      dispatch(insertSourceToken(chapter, verse, token));
    } else {
      // TRICKY: shift the next index since we removed an alignment
      const index = shiftRelativeToRemoved(nextAlignment.index, prevAlignment.index);

      const shiftedAlignment = {
        ...nextAlignment,
        index
      };
      dispatch(alignSourceToken(chapter, verse, shiftedAlignment, token));
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
 * Clears the tool's redux state
 * @return {*}
 */
export const clearState = () => ({
  type: types.CLEAR_STATE
});

/**
 * Sets the alignment suggestions for a verse
 * Suggestions must be approved by the user.
 * @param {number} chapter
 * @param {number} verse
 * @param {Alignment[]} alignments
 */
export const setAlignmentSuggestions = (chapter, verse, alignments) => ({
  type: types.SET_ALIGNMENT_SUGGESTIONS,
  chapter,
  verse,
  alignments: alignments.map(a => ({
    sourceNgram: a.source.tokens,
    targetNgram: a.target.tokens
  }))
});

export const clearAlignmentSuggestions = (chapter, verse) => ({
  type: types.RESET_VERSE_ALIGNMENT_SUGGESTIONS,
  chapter,
  verse
});
