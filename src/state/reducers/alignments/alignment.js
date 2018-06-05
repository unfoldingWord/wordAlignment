import {
  ALIGN_SOURCE_TOKEN,
  ALIGN_TARGET_TOKEN,
  INSERT_ALIGNMENT,
  REPAIR_VERSE_ALIGNMENTS,
  RESET_VERSE_ALIGNMENTS,
  SET_CHAPTER_ALIGNMENTS,
  UNALIGN_SOURCE_TOKEN,
  UNALIGN_TARGET_TOKEN
} from '../../actions/actionTypes';
import {numberComparator} from './index';
import Token from 'word-map/structures/Token';

const defaultState = {sourceNgram: [], targetNgram: []};

/**
 * Reduces the alignment state
 * @param state
 * @param action
 * @return {*}
 */
const alignment = (state = defaultState, action) => {
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
    case REPAIR_VERSE_ALIGNMENTS: {
      const sourceMap = action.sourceTokenPositionMap;
      const targetMap = action.targetTokenPositionMap;

      // remove broken source tokens
      const filteredSourceNgram = state.sourceNgram.filter(pos => {
        return sourceMap[pos] >= 0;
      });
      if(filteredSourceNgram.length !== state.sourceNgram.length) {
        // TRICKY: removing a source token automatically breaks the alignment
        return defaultState;
      }
      const filteredTargetNgram = state.targetNgram.filter(pos => {
        return targetMap[pos] >= 0;
      });

      // re-map token positions
      return {
        sourceNgram: filteredSourceNgram.map(pos => sourceMap[pos]),
        targetNgram: filteredTargetNgram.map(pos => targetMap[pos])
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
  // TRICKY: we deep copy the token to prevent tampering with the token data
  return {
    sourceNgram: state.sourceNgram.map(pos => new Token(Object.assign({}, sourceTokens[pos]))),
    targetNgram: state.targetNgram.map(pos => new Token(Object.assign({}, targetTokens[pos])))
  };
};

/**
 * Checks if an alignment has been aligned with at least one token
 * @param state
 */
export const getIsAligned = state => {
  return state.targetNgram.length > 0;
};

/**
 * Returns the positions of the source tokens used in the alignment
 * @param state
 * @return {number[]}
 */
export const getSourceTokenPositions = (state) => [...state.sourceNgram];

/**
 * Returns the positions of the target tokens used in the alignment
 * @param state
 * @return {*[]}
 */
export const getTargetTokenPositions = state => [...state.targetNgram];
