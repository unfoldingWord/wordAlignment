import Api from '../Api';
import * as reducers from '../state/reducers';
jest.mock('../state/reducers');

describe('get tool progress', () => {
  it('has no progress', () => {
    const props = {
      tool: {
        toolDataPathExistsSync: () => true
      },
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
    api.context = {
      store: {
        getState: jest.fn()
      }
    };
    expect(api.getProgress()).toEqual(0);
  });

  it('has some progress', () => {
    reducers.__setIsVerseAligned('1', '2', true);
    const props = {
      tool: {
        toolDataPathExistsSync: () => true
      },
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
    api.context = {
      store: {
        getState: jest.fn()
      }
    };
    expect(api.getProgress()).toEqual(0.25);
  });
});
