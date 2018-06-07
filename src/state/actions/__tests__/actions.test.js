import * as actions from '../index';
import Token from 'word-map/structures/Token';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  UNALIGN_RENDERED_SOURCE_TOKEN,
  INSERT_RENDERED_ALIGNMENT,
  SET_ALIGNMENT_SUGGESTIONS,
  ALIGN_RENDERED_SOURCE_TOKEN
} from '../actionTypes';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('async actions', () => {
  it('moves source token to the left', () => {
    const expectedActions = [
      {
        'chapter': 1,
        'index': 0,
        'suggestion': false,
        'suggestionAlignments': [],
        'token': {'index': 0, 'occurrence': 1, 'occurrences': 1},
        'type': UNALIGN_RENDERED_SOURCE_TOKEN,
        'verse': 1
      },
      {
        'chapter': 1,
        'index': 0, // NOTE: this is nextIndex - 1
        'suggestion': false,
        'suggestionAlignments': [],
        'token': {'index': 0, 'occurrence': 1, 'occurrences': 1},
        'type': ALIGN_RENDERED_SOURCE_TOKEN,
        'verse': 1
      }];
    const store = mockStore();
    const action = actions.moveSourceToken({
      chapter: 1,
      verse: 1,
      nextAlignment: {
        index: 1,
        suggestion: false,
        suggestionAlignments: []
      },
      prevAlignment: {
        index: 0,
        suggestion: false,
        suggestionAlignments: []
      },
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
        'suggestion': false,
        'suggestionAlignments': [],
        'token': {'index': 0, 'occurrence': 1, 'occurrences': 1},
        'type': UNALIGN_RENDERED_SOURCE_TOKEN,
        'verse': 1
      },
      {
        'chapter': 1,
        'index': 0, // NOTE: this remains nextIndex
        'suggestion': false,
        'suggestionAlignments': [],
        'token': {'index': 0, 'occurrence': 1, 'occurrences': 1},
        'type': ALIGN_RENDERED_SOURCE_TOKEN,
        'verse': 1
      }];
    const store = mockStore();
    const action = actions.moveSourceToken({
      chapter: 1,
      verse: 1,
      nextAlignment: {
        index: 0,
        suggestion: false,
        suggestionAlignments: []
      },
      prevAlignment: {
        index: 1,
        suggestion: false,
        suggestionAlignments: []
      },
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
        'suggestion': false,
        'suggestionAlignments': [],
        'token': {'index': 0, 'occurrence': 1, 'occurrences': 1},
        'type': UNALIGN_RENDERED_SOURCE_TOKEN,
        'verse': 1
      },
      {
        'chapter': 1,
        'token': {'index': 0, 'occurrence': 1, 'occurrences': 1},
        'type': INSERT_RENDERED_ALIGNMENT,
        'verse': 1
      }];
    const store = mockStore();
    const action = actions.moveSourceToken({
      chapter: 1,
      verse: 1,
      nextAlignment: {
        index: 1,
        suggestion: false,
        suggestionAlignments: []
      },
      prevAlignment: {
        index: 1,
        suggestion: false,
        suggestionAlignments: []
      },
      token: new Token({text: 'hello'}).toJSON() // TRICKY: simplifies test output
    });
    store.dispatch(action);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('sets alignment suggestions', () => {
    const expectedActions = [
      {
        type: SET_ALIGNMENT_SUGGESTIONS,
        chapter: 1,
        verse: 1,
        alignments: [
          {
            sourceNgram: ['hello'],
            targetNgram: ['world']
          }]
      }
    ];
    const store = mockStore();
    const suggestion = {
      source: {tokens: ['hello']},
      target: {tokens: ['world']}
    };
    const action = actions.setAlignmentSuggestions(1, 1, [suggestion]);
    store.dispatch(action);
    expect(store.getActions()).toEqual(expectedActions);
  });
});
