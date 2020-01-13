import _ from "lodash";
import {reducerTest} from 'redux-jest';
import * as types from '../../actions/actionTypes';
import commentsReducer, * as fromCommentsReducer from '../commentsReducer';

describe('test LOAD_COMMENT', () => {
  const before = { stuff: {stuff: {}} };
  const loadData = {
    text: 'some text',
    userName: 'user',
    modifiedTimestamp: 'timestamp',
  };
  const action = {
    type: types.LOAD_COMMENT,
    value: _.cloneDeep(loadData),
  };
  const after = _.cloneDeep(loadData);
  reducerTest('commentsReducer', commentsReducer, before, action, after);
});

describe('test ADD_COMMENT', () => {
  const before = { stuff: {stuff: {}} };
  const loadData = {
    text: 'some text',
    userName: 'user',
    modifiedTimestamp: 'timestamp',
  };
  const action = {
    type: types.ADD_COMMENT,
    text: loadData.text,
    userName: loadData.userName,
    modifiedTimestamp: loadData.modifiedTimestamp,
  };
  const after = _.cloneDeep(loadData);
  reducerTest('commentsReducer', commentsReducer, before, action, after);
});

describe('getComments', () => {
  it('empty reducer', () => {
    // given
    const state = {};
    const expectedResults = {};

    // when
    const results = fromCommentsReducer.getComments(state);

    // then
    expect(results).toEqual(expectedResults);
  });

  it('populated comment', () => {
    // given
    const loadData = {
      text: 'some text',
      userName: 'user',
      modifiedTimestamp: 'timestamp',
    };
    const state = _.cloneDeep(loadData);
    const expectedResults = _.cloneDeep(loadData);

    // when
    const results = fromCommentsReducer.getComments(state);

    // then
    expect(results).toEqual(expectedResults);
  });
});
