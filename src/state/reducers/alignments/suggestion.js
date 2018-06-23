import {
  ALIGN_RENDERED_SOURCE_TOKEN,
  ALIGN_RENDERED_TARGET_TOKEN,
  REMOVE_TOKEN_SUGGESTION,
  UNALIGN_RENDERED_SOURCE_TOKEN,
  UNALIGN_RENDERED_TARGET_TOKEN
} from '../../actions/actionTypes';

const defaultState = {sourceNgram: [], targetNgram: []};

/**
 * Reduces the suggestion state
 * @param state
 * @param action
 * @return {*}
 */
const suggestion = (state = defaultState, action) => {
  switch (action.type) {
    case REMOVE_TOKEN_SUGGESTION: {
      const targetNgram = state.targetNgram.filter(pos => {
        return pos !== action.token.position;
      });

      return {
        ...state,
        targetNgram
      };
    }
    case UNALIGN_RENDERED_SOURCE_TOKEN:
    case ALIGN_RENDERED_SOURCE_TOKEN:
    case UNALIGN_RENDERED_TARGET_TOKEN:
    case ALIGN_RENDERED_TARGET_TOKEN:
    return {
      sourceNgram: [...state.sourceNgram],
      targetNgram: []
    };
    default:
      return state;
  }
};
export default suggestion;
