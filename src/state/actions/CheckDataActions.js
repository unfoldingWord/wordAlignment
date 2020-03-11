import { LOAD_COMMENT, LOAD_REMINDER } from '../actions/actionTypes';
import {
  getVerseCommentRecord,
  getVerseBookmarkedRecord,
} from '../../utils/CheckDataHelper';
import { loadSelections } from '../actions/selectionsActions';

/**
 * load reducers for latest context
 * @param {object} contextId - contextId.
 * @param {object} tc - tc.
 */
export function loadNewContext(contextId, tc) {
  return (dispatch => {
    let data = getVerseCommentRecord(contextId, tc);

    dispatch({
      type: LOAD_COMMENT,
      value: data,
    });

    data = getVerseBookmarkedRecord(contextId, tc);

    dispatch({
      type: LOAD_REMINDER,
      value: data,
    });

    dispatch(loadSelections(contextId, tc));
  });

  // TODO update verse edit reducer when it is finished
}
