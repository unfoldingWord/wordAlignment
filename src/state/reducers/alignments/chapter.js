import {
  ADD_ALIGNMENT_SUGGESTION,
  ALIGN_SOURCE_TOKEN,
  ALIGN_TARGET_TOKEN,
  INSERT_ALIGNMENT,
  REPAIR_VERSE_ALIGNMENTS,
  RESET_VERSE_ALIGNMENT_SUGGESTIONS,
  RESET_VERSE_ALIGNMENTS,
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
    case RESET_VERSE_ALIGNMENT_SUGGESTIONS:
    case REPAIR_VERSE_ALIGNMENTS:
    case ADD_ALIGNMENT_SUGGESTION:
    case RESET_VERSE_ALIGNMENTS:
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
 * Checks if the machine alignment is valid.
 * In particular the ensures the alignment does not conflict with a human alignment
 * @param state
 * @param {number} verse
 * @param {object} machineAlignment
 * @return {*}
 */
export const getIsMachineAlignmentValid = (state, verse, machineAlignment) => {
  const verseId = verse + '';
  if (verseId in state) {
    return fromVerse.getIsMachineAlignmentValid(state[verseId],
      machineAlignment);
  } else {
    return true;
  }
};

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
 * Checks if a verse has been fully aligned
 * @param state
 * @param verse
 */
export const getIsVerseAligned = (state, verse) => {
  const verseId = verse + '';
  if (verseId in state) {
    return fromVerse.getIsAligned(state[verseId]);
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
    return fromVerse.getTokenizedAlignments(state[verseId]);
  } else {
    return [];
  }
};

/**
 * Returns tokens that have been aligned to the verse
 * @param state
 * @param {number} verse
 * @return {Token[]}
 */
export const getVerseAlignedTargetTokens = (state, verse) => {
  const verseId = verse + '';
  if (verseId in state) {
    return fromVerse.getAlignedTargetTokens(state[verseId]);
  } else {
    return [];
  }
};

/**
 * Returns the chapter alignments in the legacy format
 * @param state
 */
export const getLegacyAlignments = state => {
  const alignments = {};
  for (const verseId of Object.keys(state)) {
    alignments[verseId] = fromVerse.getLegacyAlignments(state[verseId]);
  }
  return alignments;
};
