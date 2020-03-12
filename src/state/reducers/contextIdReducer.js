import { CHANGE_CONTEXT_ID, CLEAR_CONTEXT_ID } from '../actions/actionTypes';

const initialState = { contextId: null };

const contextIdReducer = (state = initialState, action) => {
  switch (action.type) {
  case CHANGE_CONTEXT_ID:
    return {
      ...state,
      contextId: action.contextId,
    };
  case CLEAR_CONTEXT_ID:
    return initialState;
  default:
    return state;
  }
};

export default contextIdReducer;

/**
 * Returns the current context id
 * @param state
 * @return {*}
 */
export const getContext = (state) =>
  state.contextId;
