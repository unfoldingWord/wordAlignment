import {
  ALIGN_SOURCE_TOKEN,
  ALIGN_TARGET_TOKEN,
  UNALIGN_SOURCE_TOKEN,
  UNALIGN_TARGET_TOKEN,
  INSERT_ALIGNMENT,
  // MOVE_SOURCE_TOKEN
} from '../../actions/actionTypes';
import {numberComparator} from './index';

const defaultState = {sourceNgram: [], targetNgram: []};

/**
 * Reduces the alignment state
 * @param state
 * @param action
 * @return {*}
 */
const renderedAlignment = (state = defaultState, action) => {
  switch (action.type) {
    // case MOVE_SOURCE_TOKEN: {
    //
    // }
    case ALIGN_TARGET_TOKEN: {
      return {
        ...state,
        sourceNgram: [...state.sourceNgram],
        targetNgram: [...state.targetNgram, action.token.position].sort(
          numberComparator)
      };
    }
    case UNALIGN_TARGET_TOKEN:
      return {
        ...state,
        sourceNgram: [...state.sourceNgram],
        targetNgram: state.targetNgram.filter(position => {
          return position !== action.token.position;
        })
      };
    case INSERT_ALIGNMENT:
    case ALIGN_SOURCE_TOKEN:
      return {
        ...state,
        sourceNgram: [...state.sourceNgram, action.token.position].sort(
          numberComparator),
        targetNgram: [...state.targetNgram]
      };
    case UNALIGN_SOURCE_TOKEN:
      return {
        ...state,
        sourceNgram: state.sourceNgram.filter(position => {
          return position !== action.token.position;
        }),
        targetNgram: []
      };
    default:
      return state;
  }
};

export default renderedAlignment;
