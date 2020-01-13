import _ from "lodash";
import {reducerTest} from 'redux-jest';
import * as types from '../../actions/actionTypes';
import remindersReducer, * as fromRemindersReducer from '../remindersReducer';

describe('test LOAD_REMINDER', () => {
  const before = { stuff: {stuff: {}} };
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
  reducerTest('remindersReducer', remindersReducer, before, action, after);
});

describe('test ADD_REMINDER', () => {
  const before = { stuff: {stuff: {}} };
  const loadData = {
    enabled: true,
    userName: 'user',
    modifiedTimestamp: 'timestamp',
  };
  const action = {
    type: types.ADD_REMINDER,
    enabled: loadData.enabled,
    userName: loadData.userName,
    modifiedTimestamp: loadData.modifiedTimestamp,
  };
  const after = _.cloneDeep(loadData);
  reducerTest('remindersReducer', remindersReducer, before, action, after);
});

describe('getReminder', () => {
  it('empty reducer', () => {
    // given
    const state = {};
    const expectedResults = {};

    // when
    const results = fromRemindersReducer.getReminder(state);

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
    const results = fromRemindersReducer.getReminder(state);

    // then
    expect(results).toEqual(expectedResults);
  });
});
