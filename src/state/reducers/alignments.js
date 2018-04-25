import {
  ADD_ALIGNMENT,
  REMOVE_ALIGNMENT,
  SET_CHAPTER_ALIGNMENTS
} from '../actions/actionTypes';

/**
 * Represents the alignment data.
 * TODO: I think we can organize the data in redux better.
 *
 * @param state
 * @param action
 * @return {*}
 */
const alignments = (state = {}, action) => {
  switch (action.type) {
    case ADD_ALIGNMENT:
      return state;
    case REMOVE_ALIGNMENT:
      return state;
    case SET_CHAPTER_ALIGNMENTS: {
      const chapterAlignments = {};
      // TRICKY: simplify structure found in the alignment file
      for (const verse of Object.keys(action.alignments)) {
        chapterAlignments[verse] = [
          ...action.alignments[verse].alignments
        ];
      }
      return {
        ...state,
        [action.chapter + '']: chapterAlignments
      };
    }
    default:
      return state;
  }
};

export default alignments;

/**
 * Returns alignments for an entire chapter
 * @param state
 * @param {number} chapter - the chapter for which to return alignments
 * @return {*}
 */
export const getChapterAlignments = (state, chapter) => {
  const chapterId = chapter + '';
  if (chapterId in state) {
    return state[chapterId];
  } else {
    return {};
  }
};

/**
 * Returns alignments for a single verse
 * @param state
 * @param {number} chapter
 * @param {number} verse
 * @return {*}
 */
export const getVerseAlignments = (state, chapter, verse) => {
  const chapterAlignments = getChapterAlignments(state, chapter);
  const verseId = verse + '';
  if (verseId in chapterAlignments) {
    return chapterAlignments[verseId];
  } else {
    return [];
  }
};
