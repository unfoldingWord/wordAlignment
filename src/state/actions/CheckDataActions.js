import * as consts from '../actions/actionTypes';
import {
  getVerseCommentRecord,
  getVerseBookmarkedRecord,
} from '../../utils/CheckDataHelper';

/**
 * load reducers for latest context
 * @param contextId
 * @param projectSaveLocation
 * @return {function(...[*]=)}
 */
export function loadNewContext(contextId, projectSaveLocation) {
  return (dispatch => {
    let data = getVerseCommentRecord(contextId, projectSaveLocation);

    dispatch({
      type: consts.LOAD_COMMENT,
      value: data,
    });
    data = getVerseBookmarkedRecord(contextId, projectSaveLocation);
    dispatch({
      type: consts.LOAD_REMINDER,
      value: data,
    });
  });
}
