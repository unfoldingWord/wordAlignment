import * as consts from '../actions/actionTypes';
import {
  getVerseCommentRecord,
  getVerseBookmarkedRecord,
} from '../../utils/CheckDataHelper';

/**
 * load reducers for latest context
 * @param {Object} api - tool api for system calls
 * @param contextId
 * @return {function(...[*]=)}
 */
export function loadNewContext(api, contextId) {
  return (dispatch => {
    const { reference: { chapter, verse } } = contextId;
    let data = getVerseCommentRecord(api, chapter, verse);

    dispatch({
      type: consts.LOAD_COMMENT,
      value: data,
    });
    data = getVerseBookmarkedRecord(api, chapter, verse);
    dispatch({
      type: consts.LOAD_REMINDER,
      value: data,
    });
  });
}
