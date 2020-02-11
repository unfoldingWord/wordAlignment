import * as consts from '../actions/actionTypes';
import {
  getVerseCommentRecord,
  getVerseBookmarkedRecord,
} from '../../utils/CheckDataHelper';

/**
 * load reducers for latest context
 * @param {object} contextId - contextId.
 * @param {object} tc - tc.
 * @return {function(...[*]=)}
 */
export function loadNewContext(contextId, tc) {
  return (dispatch => {
    let data = getVerseCommentRecord(contextId, tc);

    dispatch({
      type: consts.LOAD_COMMENT,
      value: data,
    });

    data = getVerseBookmarkedRecord(contextId, tc);

    dispatch({
      type: consts.LOAD_REMINDER,
      value: data,
    });
  });
}
