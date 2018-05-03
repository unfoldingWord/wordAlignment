import {
  ALIGN_SOURCE_TOKEN,
  ALIGN_TARGET_TOKEN,
  INSERT_ALIGNMENT,
  RESET_VERSE_ALIGNMENTS,
  SET_CHAPTER_ALIGNMENTS,
  UNALIGN_SOURCE_TOKEN,
  UNALIGN_TARGET_TOKEN
} from '../../actions/actionTypes';
import {numberComparator} from './index';
import Token from 'word-map/structures/Token';

/**
 * Reduces the alignment state
 * @param state
 * @param action
 * @return {*}
 */
const alignment = (
  state = {sourceNgram: [], targetNgram: []}, action) => {
  switch (action.type) {
    case RESET_VERSE_ALIGNMENTS:
      return {
        sourceNgram: [action.position],
        targetNgram: []
      };
    case ALIGN_TARGET_TOKEN:
      return {
        sourceNgram: [...state.sourceNgram],
        targetNgram: [...state.targetNgram, action.token.position].sort(
          numberComparator)
      };
    case UNALIGN_TARGET_TOKEN:
      return {
        sourceNgram: [...state.sourceNgram],
        targetNgram: state.targetNgram.filter(position => {
          return position !== action.token.position;
        })
      };
    case INSERT_ALIGNMENT:
    case ALIGN_SOURCE_TOKEN:
      return {
        sourceNgram: [...state.sourceNgram, action.token.position].sort(
          numberComparator),
        targetNgram: [...state.targetNgram]
      };
    case UNALIGN_SOURCE_TOKEN:
      return {
        sourceNgram: state.sourceNgram.filter(position => {
          return position !== action.token.position;
        }),
        targetNgram: []
      };
    case SET_CHAPTER_ALIGNMENTS: {
      const vid = action.verse + '';
      const alignment = action.alignments[vid].alignments[action.index];
      const sourceNgram = [...alignment.sourceNgram];
      const targetNgram = [...alignment.targetNgram];
      return {
        sourceNgram: sourceNgram.sort(numberComparator),
        targetNgram: targetNgram.sort(numberComparator)
      };
    }
    default:
      return state;
  }
};

export default alignment;

/**
 * Returns the tokenized alignment.
 * That is, the n-grams contain an array of {@link Token}'s instead of positions
 * @param state
 * @param {Token[]} sourceTokens
 * @param {Token[]} targetTokens
 * @return {{sourceNgram: Token[], targetNgram: Token[]}}
 */
export const getTokenizedAlignment = (state, sourceTokens, targetTokens) => {
  return {
    sourceNgram: state.sourceNgram.map(pos => new Token(sourceTokens[pos])),
    targetNgram: state.targetNgram.map(pos => new Token(targetTokens[pos]))
  };
};
