import {
  ALIGN_RENDERED_SOURCE_TOKEN,
  ALIGN_RENDERED_TARGET_TOKEN,
  UNALIGN_RENDERED_SOURCE_TOKEN,
  UNALIGN_RENDERED_TARGET_TOKEN,
  INSERT_RENDERED_ALIGNMENT,
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
    case ALIGN_RENDERED_TARGET_TOKEN: {
      return {
        sourceNgram: [...state.sourceNgram],
        targetNgram: [...state.targetNgram, action.token.position].sort(
          numberComparator)
      };
    }
    case UNALIGN_RENDERED_TARGET_TOKEN:
      return {
        sourceNgram: [...state.sourceNgram],
        targetNgram: state.targetNgram.filter(position => {
          return position !== action.token.position;
        })
      };
    case INSERT_RENDERED_ALIGNMENT:
    case ALIGN_RENDERED_SOURCE_TOKEN:
      return {
        sourceNgram: [...state.sourceNgram, action.token.position].sort(
          numberComparator),
        targetNgram: [...state.targetNgram]
      };
    case UNALIGN_RENDERED_SOURCE_TOKEN:
      return {
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
