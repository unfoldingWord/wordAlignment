import _ from "lodash";
import {reducerTest} from 'redux-jest';
import * as types from '../../actions/actionTypes';
import bookmarksReducer, * as fromBookmarksReducer from '../BookmarksReducer';
import {getCurrentBookmarks} from "../index";

describe('test Reducer', () => {
  describe('test LOAD_REMINDER', () => {
    const before = {stuff: {stuff: {}}};
    const loadData = {
      enabled: true,
      userName: 'user',
      modifiedTimestamp: 'timestamp',
    };
    const action = {
      type: types.LOAD_REMINDER,
      value: _.cloneDeep(loadData),
    };
    const after = _.cloneDeep(loadData);
    reducerTest('bookmarksReducer', bookmarksReducer, before, action, after);
  });

  describe('test ADD_BOOKMARK', () => {
    const before = {stuff: {stuff: {}}};
    const loadData = {
      enabled: true,
      userName: 'user',
      modifiedTimestamp: 'timestamp',
    };
    const action = {
      type: types.ADD_BOOKMARK,
      enabled: loadData.enabled,
      userName: loadData.userName,
      modifiedTimestamp: loadData.modifiedTimestamp,
    };
    const after = _.cloneDeep(loadData);
    reducerTest('bookmarksReducer', bookmarksReducer, before, action, after);
  });

  describe('getBookmarks()', () => {
    it('empty reducer', () => {
      // given
      const state = {};
      const expectedResults = {};

      // when
      const results = fromBookmarksReducer.getBookmarks(state);

      // then
      expect(results).toEqual(expectedResults);
    });

    it('populated reminder', () => {
      // given
      const loadData = {
        enabled: false,
        userName: 'user',
        modifiedTimestamp: 'timestamp',
      };
      const state = _.cloneDeep(loadData);
      const expectedResults = _.cloneDeep(loadData);

      // when
      const results = fromBookmarksReducer.getBookmarks(state);

      // then
      expect(results).toEqual(expectedResults);
    });
  });
});

describe('test Selector', () => {
  it('populated reminder', () => {
    // given
    const loadData = {
      enabled: false,
      userName: 'user',
      modifiedTimestamp: 'timestamp',
    };
    const state = {
      tool: {
        bookmarksReducer:  _.cloneDeep(loadData)
      }
    };

    // when
    const bookmarked = getCurrentBookmarks(state);

    // then
    expect(bookmarked).toEqual(loadData.enabled);
  });

  it('empty reminder', () => {
    // given
    const expectedReminder = false;
    const loadData = {};
    const state = {
      tool: {
        bookmarksReducer:  _.cloneDeep(loadData)
      }
    };

    // when
    const bookmarked = getCurrentBookmarks(state);

    // then
    expect(bookmarked).toEqual(expectedReminder);
  });
});
