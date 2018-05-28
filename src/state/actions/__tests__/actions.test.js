import * as actions from '../index';
import Token from 'word-map/structures/Token';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('async actions', () => {
  it('moves source token to the left', () => {
    const expectedActions = [
      {
        'chapter': 1,
        'index': 0,
        'token': {'index': 0, 'occurrence': 1, 'occurrences': 1},
        'type': 'UNALIGN_SOURCE_TOKEN',
        'verse': 1
      },
      {
        'chapter': 1,
        'index': 0, // NOTE: this is nextIndex - 1
        'token': {'index': 0, 'occurrence': 1, 'occurrences': 1},
        'type': 'ALIGN_SOURCE_TOKEN',
        'verse': 1
      }];
    const store = mockStore();
    const action = actions.moveSourceToken({
      chapter: 1,
      verse: 1,
      nextIndex: 1,
      prevIndex: 0,
      token: new Token({text: 'hello'}).toJSON() // TRICKY: simplifies test output
    });
    store.dispatch(action);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('moves source token to the right', () => {
    const expectedActions = [
      {
        'chapter': 1,
        'index': 1,
        'token': {'index': 0, 'occurrence': 1, 'occurrences': 1},
        'type': 'UNALIGN_SOURCE_TOKEN',
        'verse': 1
      },
      {
        'chapter': 1,
        'index': 0, // NOTE: this remains nextIndex
        'token': {'index': 0, 'occurrence': 1, 'occurrences': 1},
        'type': 'ALIGN_SOURCE_TOKEN',
        'verse': 1
      }];
    const store = mockStore();
    const action = actions.moveSourceToken({
      chapter: 1,
      verse: 1,
      nextIndex: 0,
      prevIndex: 1,
      token: new Token({text: 'hello'}).toJSON() // TRICKY: simplifies test output
    });
    store.dispatch(action);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('moves source token to same position (insert)', () => {
    const expectedActions = [
      {
        'chapter': 1,
        'index': 1,
        'token': {'index': 0, 'occurrence': 1, 'occurrences': 1},
        'type': 'UNALIGN_SOURCE_TOKEN',
        'verse': 1
      },
      {
        'chapter': 1,
        'token': {'index': 0, 'occurrence': 1, 'occurrences': 1},
        'type': 'INSERT_ALIGNMENT',
        'verse': 1
      }];
    const store = mockStore();
    const action = actions.moveSourceToken({
      chapter: 1,
      verse: 1,
      nextIndex: 1,
      prevIndex: 1,
      token: new Token({text: 'hello'}).toJSON() // TRICKY: simplifies test output
    });
    store.dispatch(action);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('adds an alignment suggestion', () => {
    const expectedActions = [
      {
        type: 'ADD_ALIGNMENT_SUGGESTION',
        chapter: 1,
        verse: 1,
        alignment: {
          sourceNgram: ['hello'],
          targetNgram: ['world']
        }
      }
    ];
    const store = mockStore();
    const action = actions.addAlignmentSuggestion(1, 1, {
      sourceNgram: ['hello'],
      targetNgram: ['world']
    });
    store.dispatch(action);
    expect(store.getActions()).toEqual(expectedActions);
  });
});
