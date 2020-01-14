import React from 'react';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import {Container} from '../Container';
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

    // const renderer = new ShallowRenderer();
    // renderer.render(
    const wrapper = shallow(
        <Container {...myProps} />
    );
    // const result = renderer.getRenderOutput();

    const resultsStr = toJson(wrapper);
    expect(resultsStr).toMatchSnapshot();
  });
});
