import Api from '../Api';
import * as reducers from '../state/reducers';
jest.mock('../state/reducers');

describe('get tool progress', () => {
  it('is not aligned or toggled complete', () => {
    const props = {
      tool: {
        toolDataPathExistsSync: () => false // the finished check looks for a file
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

  it('is not aligned but is toggled', () => {
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
    expect(api.getProgress()).toEqual(1);
  });

  it('some things are aligned but everything is toggled complete', () => {
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
    expect(api.getProgress()).toEqual(1);
  });

  it('some things are aligned and nothing is toggled complete', () => {
    reducers.__setIsVerseAligned('1', '2', true);
    const props = {
      tool: {
        toolDataPathExistsSync: () => false
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
