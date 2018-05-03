import {
  ALIGN_SOURCE_TOKEN,
  ALIGN_TARGET_TOKEN,
  INSERT_ALIGNMENT,
  SET_CHAPTER_ALIGNMENTS,
  SET_SOURCE_TOKENS,
  SET_TARGET_TOKENS,
  UNALIGN_SOURCE_TOKEN,
  UNALIGN_TARGET_TOKEN
} from '../../actions/actionTypes';
import verse, * as fromVerse from './verse';

/**
 * Reduces the chapter alignment state
 * @param state
 * @param action
 * @return {*}
 */
const chapter = (state = {}, action) => {
  switch (action.type) {
    case INSERT_ALIGNMENT:
    case UNALIGN_SOURCE_TOKEN:
    case ALIGN_SOURCE_TOKEN:
    case UNALIGN_TARGET_TOKEN:
    case SET_TARGET_TOKENS:
    case SET_SOURCE_TOKENS:
    case ALIGN_TARGET_TOKEN: {
      const vid = action.verse + '';
      return {
        ...state,
        [vid]: verse(state[vid], action)
      };
    }
    case SET_CHAPTER_ALIGNMENTS: {
      const verses = {};
      for (const vid of Object.keys(action.alignments)) {
        verses[vid] = verse(state[vid], {...action, verse: vid});
      }
      return verses;
    }
    default:
      return state;
  }
};

export default chapter;

/**
 * Checks if the verses being aligned are valid
 * @param state
 * @param {number} verse
 * @param {string} sourceText - the source text used as a baseline
 * @param {string} targetText - the target text used as a baseline
 * @return {boolean}
 */
export const getIsVerseValid = (
  state, verse, sourceText, targetText) => {
  const verseId = verse + '';
  if (verseId in state) {
    return fromVerse.getIsValid(state[verseId], sourceText, targetText);
  } else {
    return false;
  }
};

/**
 * Returns an array of alignments for the verse
 * @param state
 * @param {number} verse
 * @return {Array}
 */
export const getVerseAlignments = (state, verse) => {
  const verseId = verse + '';
  if (verseId in state) {
    return fromVerse.getAlignments(state[verseId]);
  } else {
    return [];
  }
};
