import {
  REMOVE_TOKEN_SUGGESTION
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
    default:
      return state;
  }
};
export default suggestion;
