import {RECORD_CHECK} from '../../actions/actionTypes';

/**
 * Reduces the verse check state
 * @param state
 * @param action
 * @returns {{data: *, timestamp: number}[]}
 */
const verse = (state = [], action) => {
  switch (action.type) {
    case RECORD_CHECK: {
      return [
        {
          timestamp: action.timestamp,
          data: action.data
        },
        ...state
      ];
    }
    default:
      return state;
  }
};

export default verse;

/**
 * Returns the most recent check data for this verse.
 * @param state
 * @returns {*}
 */
export const getCheck = state => {
  if(state.length > 0) {
    return state[0];
  } else {
    return null;
  }
};
