import Token from 'word-map/structures/Token';
import {
  ADD_TO_ALIGNMENT,
  REMOVE_FROM_ALIGNMENT,
  SET_CHAPTER_ALIGNMENTS
} from '../actions/actionTypes';

const alignment = (state = {topWords: [], bottomWords: []}, action) => {
  switch (action.type) {
    case ADD_TO_ALIGNMENT:
      return {
        topWords: [...state.topWords],
        bottomWords: [...state.bottomWords, action.token]
      };
    default:
      return state;
  }
};

const verse = (state = [], action) => {
  switch (action.type) {
    case ADD_TO_ALIGNMENT: {
      const index = action.alignmentIndex;
      const nextState = [
        ...state
      ];
      nextState[index] = alignment(state[index], action);
      return nextState;
    }
    default:
      return state;
  }
};

const chapter = (state = {}, action) => {
  switch (action.type) {
    case ADD_TO_ALIGNMENT: {
      const vid = action.verse + '';
      return {
        ...state,
        [vid]: verse(state[vid], action)
      };
    }
    default:
      return state;
  }
};

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
    case ADD_TO_ALIGNMENT: {
      const cid = action.chapter + '';
      return {
        ...state,
        [cid]: chapter(state[cid], action)
      };
    }
    case REMOVE_FROM_ALIGNMENT:
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

/**
 * Returns tokens that have been aligned to the verse
 * @param state
 * @param chapter
 * @param verse
 * @return {Array}
 */
export const getAlignedVerseTokens = (state, chapter, verse) => {
  const verseAlignments = getVerseAlignments(state, chapter, verse);
  const tokens = [];
  for (const alignment of verseAlignments) {
    for (const word of alignment.bottomWords) {
      tokens.push(new Token({
        text: word.word,
        occurrence: word.occurrence,
        occurrences: word.occurrences
      }));
    }
  }
  return tokens;
};
