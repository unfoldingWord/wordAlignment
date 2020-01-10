import * as consts from '../actions/actionTypes';
import * as Actions from '../actions/index';
import {
  generateTimestamp,
  getVerseCommentRecord,
} from '../../utils/CheckDataHelper';

/**
 * load reducers for latext context
 * @param {Object} api - tool api for system calls
 * @param contextId
 * @return {function(...[*]=)}
 */
export function loadNewContext(api, contextId) {
  const {store} = api.context;
  const {reference: {chapter, verse}} = contextId;
  const data = getVerseCommentRecord(api, chapter, verse);
  store.dispatch({
    type: consts.LOAD_COMMENT,
    value: data,
  });
  // TODO add bookmark
}
