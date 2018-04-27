import {reducerTest} from 'redux-jest';
import * as types from '../../actions/actionTypes';
import tokens, * as fromTokens from '../tokens';

describe('get source tokens', () => {
  it('works', () => {
    const state = {
      '1': {
        '1': [{ hello: 'world'}],
        '2': [{ foo: 'bar'}]
      }
    };
    const chapterTokens = fromTokens.getChapterSourceTokens(state, 1);
    expect(chapterTokens).toEqual({
      '1': [{ hello: 'world'}],
      '2': [{ foo: 'bar'}]
    });
  });
});
