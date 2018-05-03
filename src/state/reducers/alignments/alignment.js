import {
  ALIGN_SOURCE_TOKEN,
  ALIGN_TARGET_TOKEN, INSERT_ALIGNMENT,
  SET_CHAPTER_ALIGNMENTS,
  UNALIGN_SOURCE_TOKEN,
  UNALIGN_TARGET_TOKEN
} from '../../actions/actionTypes';
import {numberComparator} from './index';

/**
 * Reduces the alignment state
 * @param state
 * @param action
 * @return {*}
 */
const alignment = (
  state = {sourceNgram: [], targetNgram: []}, action) => {
  switch (action.type) {
    case ALIGN_TARGET_TOKEN:
      return {
        sourceNgram: [...state.sourceNgram],
        targetNgram: [...state.targetNgram, action.token.position].sort(
          numberComparator)
      };
    case UNALIGN_TARGET_TOKEN:
      return {
        sourceNgram: [...state.sourceNgram],
        targetNgram: state.targetNgram.filter(position => {
          return position !== action.token.position;
        })
      };
    case INSERT_ALIGNMENT:
    case ALIGN_SOURCE_TOKEN:
      return {
        sourceNgram: [...state.sourceNgram, action.token.position].sort(
          numberComparator),
        targetNgram: [...state.targetNgram]
      };
    case UNALIGN_SOURCE_TOKEN:
      return {
        sourceNgram: state.sourceNgram.filter(position => {
          return position !== action.token.position;
        }),
        targetNgram: []
      };
    case SET_CHAPTER_ALIGNMENTS: {
      const vid = action.verse + '';
      const alignment = action.alignments[vid].alignments[action.index];
      const sourceNgram = [...alignment.sourceNgram];
      const targetNgram = [...alignment.targetNgram];
      return {
        sourceNgram: sourceNgram.sort(numberComparator),
        targetNgram: targetNgram.sort(numberComparator)
      };
    }
    default:
      return state;
  }
};

export default alignment;
