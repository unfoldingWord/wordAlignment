import {
  ALIGN_RENDERED_SOURCE_TOKEN,
  ALIGN_RENDERED_TARGET_TOKEN,
  UNALIGN_RENDERED_SOURCE_TOKEN,
  UNALIGN_RENDERED_TARGET_TOKEN,
  INSERT_RENDERED_ALIGNMENT,
} from '../../actions/actionTypes';
import {numberComparator} from './index';

const defaultState = {sourceNgram: [], targetNgram: [], alignments: []};

/**
 * Reduces the alignment state
 * @param state
 * @param action
 * @param [alignmentIndex] - the index of the related alignment. Used when inserting a new alignment.
 * @return {*}
 */
const renderedAlignment = (state = defaultState, action, alignmentIndex = undefined) => {
  switch (action.type) {
    case ALIGN_RENDERED_TARGET_TOKEN: {
      return {
        alignments: [state.alignments[0]],
        sourceNgram: [...state.sourceNgram],
        targetNgram: [...state.targetNgram, action.token.position].sort(
          numberComparator)
      };
    }
    case UNALIGN_RENDERED_TARGET_TOKEN:
      return {
        alignments: [state.alignments[0]],
        sourceNgram: [...state.sourceNgram],
        targetNgram: state.targetNgram.filter(position => {
          return position !== action.token.position;
        })
      };
    case INSERT_RENDERED_ALIGNMENT:
      return {
        alignments: [alignmentIndex],
        sourceNgram: [...state.sourceNgram, action.token.position].sort(
          numberComparator),
        targetNgram: [...state.targetNgram]
      };
    case ALIGN_RENDERED_SOURCE_TOKEN:
      return {
        alignments: [state.alignments[0]],
        sourceNgram: [...state.sourceNgram, action.token.position].sort(
          numberComparator),
        targetNgram: [...state.targetNgram]
      };
    case UNALIGN_RENDERED_SOURCE_TOKEN:
      return {
        alignments: [state.alignments[0]],
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
