import configureMockStore from "redux-mock-store";
import thunk from 'redux-thunk';
import Api from '../Api';
import * as reducers from '../state/reducers';
import {FINISHED_KEY, UNALIGNED_KEY} from "../state/reducers/GroupMenu";
jest.mock('../state/reducers');

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('get tool progress', () => {
  it('is not aligned or toggled complete', () => {
    // given
    const state = {
      tool: {
        groupMenu: { }
      }
    };
    const store = mockStore(state);
    const props = {
      tc: {
        targetBook: {
          '1': {
            '1': {}
          }
        }
      }
    };
    const api = new Api();
    api.props = props;
    api.context.store = store;
    reducers.getGroupMenuItem.mockReset();
    const mockGroupMenuItem = { [UNALIGNED_KEY]: true, [FINISHED_KEY]: false };
    reducers.getGroupMenuItem.mockReturnValue(mockGroupMenuItem);

    // when
    const progress = api.getProgress();

    // then
    expect(progress).toEqual(0);
  });

  it('is not aligned but is toggled', () => {
    // given
    const state = {
      tool: {
        groupMenu: { }
      }
    };
    const store = mockStore(state);
    const props = {
      tc: {
        targetBook: {
          '1': {
            '1': {}
          }
        }
      }
    };
    const api = new Api();
    api.props = props;
    api.context.store = store;
    reducers.getGroupMenuItem.mockReset();
    const mockGroupMenuItem = { [UNALIGNED_KEY]: true, [FINISHED_KEY]: true };
    reducers.getGroupMenuItem.mockReturnValue(mockGroupMenuItem);

    // when
    const progress = api.getProgress();

    // then
    expect(progress).toEqual(1);
  });

  it('some things are aligned but everything is toggled complete', () => {
    // given
    const state = {
      tool: {
        groupMenu: { }
      }
    };
    const store = mockStore(state);
    const props = {
      tc: {
        targetBook: {
          '1': {
            '1': {},
            '2': {},
            '3': {},
            '4': {}
          }
        }
      }
    };
    const api = new Api();
    api.props = props;
    api.context.store = store;
    reducers.getGroupMenuItem.mockReset();
    const mockGroupMenuItemFinishedUnaligned = { [UNALIGNED_KEY]: true, [FINISHED_KEY]: true };
    const mockGroupMenuItemFinishedAligned = { [UNALIGNED_KEY]: false, [FINISHED_KEY]: true };
    reducers.getGroupMenuItem.mockReturnValue(mockGroupMenuItemFinishedUnaligned).
    mockReturnValueOnce(mockGroupMenuItemFinishedAligned). // first call return value
    mockReturnValueOnce(mockGroupMenuItemFinishedAligned); // second call return value

    // when
    const progress = api.getProgress();

    // then
    expect(progress).toEqual(1);
  });

  it('some things are aligned and nothing is toggled complete', () => {
    // given
    const state = {
      tool: {
        groupMenu: { }
      }
    };
    const store = mockStore(state);
    const props = {
      tc: {
        targetBook: {
          '1': {
            '1': {},
            '2': {},
            '3': {},
            '4': {}
          }
        }
      }
    };
    const api = new Api();
    api.props = props;
    api.context.store = store;
    reducers.getGroupMenuItem.mockReset();
    const mockGroupMenuItemNotFinishedUnaligned = { [UNALIGNED_KEY]: true, [FINISHED_KEY]: false };
    const mockGroupMenuItemNotFinishedAligned = { [UNALIGNED_KEY]: false, [FINISHED_KEY]: false };
    reducers.getGroupMenuItem.mockReturnValue(mockGroupMenuItemNotFinishedUnaligned).
    mockReturnValueOnce(mockGroupMenuItemNotFinishedAligned). // first call return value
    mockReturnValueOnce(mockGroupMenuItemNotFinishedAligned); // second call return value

    // when
    const progress = api.getProgress();

    // then
    expect(progress).toEqual(0.5);
  });
});
