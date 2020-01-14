import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import {generateMAP, getPredictions, Container} from '../Container';
import * as reducers from '../../state/reducers';
import Api from '../../Api';

jest.mock('../../state/reducers');

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const basicProps = require('./__fixtures__/basicProps.json');
const props = {
  ...basicProps,
  tc: {
    ...basicProps.tc,
    project: { getBookName: () => () => 'gen' },
  },
};
props.tc.contextId.tool = 'wordAlignment';

describe('word MAP integration', () => {
  const targetBook = {
    '1': {
      '1': {},
      '2': {}
    },
    '2': {
      '1': {}
    }
  };
  const state = {
    tool: {
      alignments: {
        '1': {
          '1': {
            alignments: [
              {
                sourceNgram: [0],
                targetNgram: [0]
              }],
            sourceTokens: [
              {
                text: 'hello',
                occurrence: 1,
                occurrences: 1,
                position: 0
              }],
            targetTokens: [
              {
                text: 'olleh',
                occurrence: 1,
                occurrences: 1,
                position: 0
              }]
          },
          '2': {
            alignments: [
              {
                sourceNgram: [0],
                targetNgram: [0]
              }],
            sourceTokens: [
              {
                text: 'world',
                occurrence: 1,
                occurrences: 1,
                position: 0
              }],
            targetTokens: [
              {
                text: 'dlrow',
                occurrence: 1,
                occurrences: 1,
                position: 0
              }]
          }
        },
        '2': {
          '1': {
            alignments: [
              {
                sourceNgram: [0],
                targetNgram: [0]
              }],
            sourceTokens: [
              {
                text: 'foo',
                occurrence: 1,
                occurrences: 1,
                position: 0
              }],
            targetTokens: [
              {
                text: 'oof',
                occurrence: 1,
                occurrences: 1,
                position: 0
              }]
          }
        }
      }
    }
  };

  it('creates a map', () => {
    const currentVerse = 1;
    const currentChapter = 1;
    return generateMAP(targetBook, state, currentChapter, currentVerse).
      then(map => {
        expect(map.engine.corpusIndex.staticIndex.srcCharLength).toEqual(0);
        expect(map.engine.corpusIndex.staticIndex.tgtCharLength).toEqual(0);
        expect(Object.keys(
          map.engine.alignmentMemoryIndex.permutationIndex.alignPermFreqIndex.index).length >
          0).toBeTruthy();
      });
  });

  it('makes predictions', () => {
    const currentVerse = 1;
    const currentChapter = 1;
    const sourceText = 'the world';
    const targetText = 'eht dlrow';
    return generateMAP(targetBook, state, currentChapter, currentVerse).
      then(map => getPredictions(map, sourceText, targetText)).
      then(predictions => {
        expect(predictions.length > 0).toBeTruthy();
      });
  });
});

describe('Container', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('works', () => {
    reducers.getRenderedVerseAlignedTargetTokens.mockReturnValue([]);
    reducers.getRenderedVerseAlignments.mockReturnValue([]);
    reducers.getIsVerseAlignmentsValid.mockReturnValue(true);
    reducers.getIsVerseAligned.mockReturnValue(true);
    reducers.getVerseHasRenderedSuggestions.mockReturnValue(false);
    reducers.getCurrentComments.mockReturnValue('');
    reducers.getCurrentReminders.mockReturnValue(false);
    const state = {
      tool: {
        groupMenu: {
          '1': {
            '2': {
              finished: true,
              invalid: true,
              edited: true,
              unaligned: true
            },
            '3': {
              finished: true
            }
          }
        }
      },
    };
    const store = mockStore(state);
    const api = new Api();
    api.context.store = store;
    api.getVerseData = jest.fn(() => ({
      finished: true,
      invalid: true,
      edited: true,
      unaligned: true
    }));
    const myProps = {
      ...props,
      translate: k => k,
      tool: {
        api,
        translate: k => k,
      }
    };

    // const wrapper = renderer.create(
    const wrapper = shallow(
      <Provider store={store}>
        <Container {...myProps} />
      </Provider>
    );

    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
