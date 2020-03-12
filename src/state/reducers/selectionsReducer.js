import { CHANGE_SELECTIONS } from '../actions/actionTypes';

const initialState = {
  selections: [],
  username: null,
  nothingToSelect: false,
  modifiedTimestamp: null,
  gatewayLanguageCode: null,
  gatewayLanguageQuote: null,
};

const selectionsReducer = (state = initialState, action) => {
  switch (action.type) {
  case CHANGE_SELECTIONS:
    return {
      ...state,
      selections: action.selections,
      nothingToSelect: !!action.nothingToSelect,// if undefined make it false
      username: action.username,
      modifiedTimestamp: action.modifiedTimestamp,
      gatewayLanguageCode: action.gatewayLanguageCode,
      gatewayLanguageQuote: action.gatewayLanguageQuote,
    };
  default:
    return state;
  }
};

export default selectionsReducer;

/**
 * Returns the selections.
 * This needs a better description. What are selections?
 * @param {object} state the selections slice of the state object
 */
export const getSelections = (state) =>
  state.selections;
