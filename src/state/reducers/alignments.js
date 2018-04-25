import {ADD_ALIGNMENT, REMOVE_ALIGNMENT, RESET_ALIGNMENTS} from '../actions/actionTypes';

/**
 * Represents the alignment data.
 * TODO: I think we can organize the data in redux better.
 *
 * @param state
 * @param action
 * @return {*}
 */
const alignments = (state = {}, action) => {
  switch(action.type) {
    case ADD_ALIGNMENT:
      return state;
    case REMOVE_ALIGNMENT:
      return state;
    case RESET_ALIGNMENTS:
      return action.alignments;
    default:
      return state;
  }
};

export default alignments;
