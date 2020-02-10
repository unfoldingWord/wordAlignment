import * as consts from '../actions/actionTypes';
import {
  getVerseCommentRecord,
  getVerseBookmarkedRecord,
} from '../../utils/CheckDataHelper';

/**
 * load reducers for latest context
 * @param {object} contextId - contextId.
 * @return {function(...[*]=)}
 */
export function loadNewContext(contextId) {
  return (dispatch => {
    let data = getVerseCommentRecord(contextId);

    dispatch({
      type: consts.LOAD_COMMENT,
      value: data,
    });
    data = getVerseBookmarkedRecord(contextId);
    dispatch({
      type: consts.LOAD_REMINDER,
      value: data,
    });
  });
}
