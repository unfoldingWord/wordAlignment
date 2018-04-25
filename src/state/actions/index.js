import * as types from './actionTypes';

/**
 * This thunk reads the alignment data from the file system and loads it into redux.
 * @param {object} data - the new alignment data;
 * @return {Function}
 */
export const loadAlignments = (data) => ({
  type: types.RESET_ALIGNMENTS,
  alignments: data
});
