import {
  ACCEPT_TOKEN_SUGGESTION,
  ACCEPT_VERSE_ALIGNMENT_SUGGESTIONS,
  ALIGN_RENDERED_SOURCE_TOKEN,
  ALIGN_RENDERED_TARGET_TOKEN,
  INSERT_RENDERED_ALIGNMENT,
  UNALIGN_RENDERED_SOURCE_TOKEN,
  UNALIGN_RENDERED_TARGET_TOKEN
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
const renderedAlignment = (
  state = defaultState, action, alignmentIndex = undefined) => {
  switch (action.type) {
    case ACCEPT_TOKEN_SUGGESTION: {
      const suggestedTargetTokens = state.suggestedTargetTokens.filter(
        pos => pos !== action.token.position);
      if (suggestedTargetTokens.length > 0) {
        return {
          ...state,
          suggestedTargetTokens
        };
      } else {
        return {
          alignments: [state.alignments[0]],
          sourceNgram: [...state.sourceNgram],
          targetNgram: [...state.targetNgram]
        };
      }
    }
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
    case ACCEPT_VERSE_ALIGNMENT_SUGGESTIONS:
      return {
        alignments: [state.alignments[0]],
        sourceNgram: [...state.sourceNgram],
        targetNgram: [...state.targetNgram]
      };
    default:
      return state;
  }
};

export default renderedAlignment;

/**
 * Returns the rendered alignment structured as a non-rendered alignment
 * @param state
 * @return {*}
 */
export const getAlignment = state => {
  return {
    sourceNgram: [...state.sourceNgram],
    targetNgram: [...state.targetNgram]
  };
};
