import {
  ALIGN_RENDERED_SOURCE_TOKEN,
  ALIGN_RENDERED_TARGET_TOKEN,
  SET_ALIGNMENT_SUGGESTIONS,
  UNALIGN_RENDERED_SOURCE_TOKEN,
  UNALIGN_RENDERED_TARGET_TOKEN
} from '../../actions/actionTypes';
import Token from 'word-map/structures/Token';

const defaultState = {sourceNgram: [], targetNgram: []};

/**
 * Reduces the suggestion state
 * @param state
 * @param action
 * @return {*}
 */
const suggestion = (state = defaultState, action) => {
  switch (action.type) {
    case SET_ALIGNMENT_SUGGESTIONS:
      return {
        sourceNgram: action.alignment.sourceNgram.map(t => t.position),
        targetNgram: action.alignment.targetNgram.map(t => t.position)
      };
    case ALIGN_RENDERED_SOURCE_TOKEN:
    case UNALIGN_RENDERED_SOURCE_TOKEN:
    case ALIGN_RENDERED_TARGET_TOKEN:
    case UNALIGN_RENDERED_TARGET_TOKEN:
      return {
        sourceNgram: [...state.sourceNgram],
        targetNgram: []
      };
    default:
      return state;
  }
};
export default suggestion;

/**
 * Returns the tokenized suggestion
 * @deprecated
 * @param state
 * @param {Token[]} sourceTokens
 * @param {Token[]} targetTokens
 * @return {{sourceNgram: *, targetNgram: *}}
 */
export const getTokenizedSuggestion = (state, sourceTokens, targetTokens) => {
  return {
    sourceNgram: state.sourceNgram.map(pos => new Token(sourceTokens[pos])),
    targetNgram: state.targetNgram.map(pos => new Token(targetTokens[pos]))
  };
};
