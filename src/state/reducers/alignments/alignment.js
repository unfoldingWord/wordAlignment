import {Token} from 'wordmap-lexer';
import _ from 'lodash';
import {
  ACCEPT_TOKEN_SUGGESTION,
  INSERT_RENDERED_ALIGNMENT,
  REPAIR_VERSE_ALIGNMENTS,
  RESET_VERSE_ALIGNMENTS,
  SET_CHAPTER_ALIGNMENTS
} from '../../actions/actionTypes';
import {numberComparator} from './index';

const defaultState = {sourceNgram: [], targetNgram: []};

/**
 * Reduces the alignment state
 * @param state
 * @param action
 * @return {*}
 */
const alignment = (state = defaultState, action, ) => {
  switch (action.type) {
    case ACCEPT_TOKEN_SUGGESTION:
      return {
        ...state,
        targetNgram: _.uniq([...state.targetNgram, action.token.position])
      };
    case RESET_VERSE_ALIGNMENTS:
      return {
        sourceNgram: [action.position],
        targetNgram: []
      };
    case INSERT_RENDERED_ALIGNMENT:
      return {
        sourceNgram: [...state.sourceNgram, action.token.position].sort(
          numberComparator),
        targetNgram: [...state.targetNgram]
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
 * @return {Alignment}
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
