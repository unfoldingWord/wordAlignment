import {setGroupMenuItemState} from '../actions/index';
import {getGroupMenuItem, getIsVerseAligned} from "../reducers";
import {BOOKMARKED_KEY, COMMENT_KEY, EDITED_KEY, FINISHED_KEY, INVALID_KEY, UNALIGNED_KEY} from "../reducers/groupMenu";
import * as GroupMenuHelper from "../../utils/GroupMenuHelper";

/**
 * load items that may have been changed externally
 * @param {Object} api - tool api for system calls
 * @param {number|string} chapter
 * @param {number|string} verse
 * @param {Boolean} force - if true, reload data, otherwise data will only be loaded if no current data for verse
 * @return {{}}
 */
export const loadGroupMenuItem = (api, chapter, verse, force = false) => ((dispatch, getState) => {
  const state = getState();
  // reload verse data if force or if no data found for this verse
  if (force || !getGroupMenuItem(state, chapter, verse)) {
    const itemState = {};
    itemState[FINISHED_KEY] = GroupMenuHelper.getIsVerseFinished(api, chapter, verse);
    itemState[INVALID_KEY] = GroupMenuHelper.getIsVerseInvalid(api, chapter, verse);
    itemState[UNALIGNED_KEY] = !getIsVerseAligned(state, chapter, verse);
    itemState[EDITED_KEY] = GroupMenuHelper.getIsVerseEdited(api, chapter, verse);
    itemState[BOOKMARKED_KEY] = GroupMenuHelper.getVerseBookmarked(api, chapter, verse);
    itemState[COMMENT_KEY] = GroupMenuHelper.getVerseComment(api, chapter, verse);
    dispatch(setGroupMenuItemState(chapter, verse, itemState));
  }
});
