import * as actions from '../index';
import Token from 'word-map/structures/Token';
import Prediction from 'word-map/structures/Prediction';
import Alignment from 'word-map/structures/Alignment';
import Ngram from 'word-map/structures/Ngram';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  ALIGN_RENDERED_SOURCE_TOKEN,
  INSERT_RENDERED_ALIGNMENT,
  SET_ALIGNMENT_SUGGESTIONS,
  UNALIGN_RENDERED_SOURCE_TOKEN
} from '../actionTypes';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('thunk actions', () => {

  it('moves source token to the left', () => {
    const expectedActions = [
      {
        'chapter': 1,
        'index': 0,
        'token': {'index': 0, 'occurrence': 1, 'occurrences': 1},
        'type': UNALIGN_RENDERED_SOURCE_TOKEN,
        'verse': 1
      },
      {
        'chapter': 1,
        'index': 0, // NOTE: this is nextIndex - 1
        'token': {'index': 0, 'occurrence': 1, 'occurrences': 1},
        'type': ALIGN_RENDERED_SOURCE_TOKEN,
        'verse': 1
      }];
    const store = mockStore();
    const action = actions.moveSourceToken(1, 1, 1, 0,
      new Token({text: 'hello'}).toJSON() // TRICKY: simplifies test output
    );
    store.dispatch(action);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('moves source token to the right', () => {
    const expectedActions = [
      {
        'chapter': 1,
        'index': 1,
        'token': {'index': 0, 'occurrence': 1, 'occurrences': 1},
        'type': UNALIGN_RENDERED_SOURCE_TOKEN,
        'verse': 1
      },
      {
        'chapter': 1,
        'index': 0, // NOTE: this remains nextIndex
        'token': {'index': 0, 'occurrence': 1, 'occurrences': 1},
        'type': ALIGN_RENDERED_SOURCE_TOKEN,
        'verse': 1
      }];
    const store = mockStore();
    const action = actions.moveSourceToken(1, 1, 0, 1,
      new Token({text: 'hello'}).toJSON() // TRICKY: simplifies test output
    );
    store.dispatch(action);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('moves source token to same position (insert)', () => {
    const expectedActions = [
      {
        'chapter': 1,
        'index': 1,
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
    const action = actions.moveSourceToken(1, 1, 1, 1,
      new Token({text: 'hello'}).toJSON() // TRICKY: simplifies test output
    );
    store.dispatch(action);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('sets alignment suggestions', () => {
    const sourceTokens = [new Token({text: 'hello'})];
    const targetTokens = [new Token({text: 'world'})];
    const expectedActions = [
      {
        type: SET_ALIGNMENT_SUGGESTIONS,
        chapter: 1,
        verse: 1,
        alignments: [
          {
            sourceNgram: sourceTokens,
            targetNgram: targetTokens
          }]
      }
    ];
    const store = mockStore();
    const source = new Ngram(sourceTokens);
    const target = new Ngram(targetTokens);

    const prediction = new Prediction(new Alignment(source, target));
    prediction.setScore('confidence', 1);
    const action = actions.setAlignmentPredictions(1, 1, [prediction]);
    store.dispatch(action);
    expect(store.getActions()).toEqual(expectedActions);
  });
});
