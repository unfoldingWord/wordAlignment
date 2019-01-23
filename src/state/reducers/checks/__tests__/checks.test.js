import {reducerTest} from 'redux-jest';
import * as types from '../../../actions/actionTypes';
import checks from '../index';

describe('record first check', () => {
  const before = {};
  const action = {
    type: types.RECORD_CHECK,
    timestamp: 'time',
    check: 'completed',
    chapter: 1,
    verse: 2,
    data: true
  };
  const after = {
    'completed': {
      '1': {
        '2': [
          {
            timestamp: 'time',
            data: true
          }]
      }
    }
  };
  reducerTest('Record check', checks, before, action, after);
});

describe('record second check', () => {
  const before = {
    'completed': {
      '1': {
        '2': [
          {
            timestamp: 'first time',
            data: false
          }]
      }
    }
  };
  const action = {
    type: types.RECORD_CHECK,
    timestamp: 'second time',
    check: 'completed',
    chapter: 1,
    verse: 2,
    data: true
  };
  const after = {
    'completed': {
      '1': {
        '2': [
          {
            timestamp: 'second time',
            data: true
          },
          {
            timestamp: 'first time',
            data: false
          }
        ]
      }
    }
  };
  reducerTest('Record check', checks, before, action, after);
});
