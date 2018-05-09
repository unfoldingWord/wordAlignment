import Api from '../Api';

describe('saving', () => {
  it('should not save empty state', () => {
    const api = new Api();
    api.props = {
      tcApi: {
        writeGlobalToolData: jest.fn(),
        contextId: {reference: {bookId: 'tit', chapter: 1}}
      }
    };
    const nextState = {};
    const prevState = {};
    expect(api.stateChangeThrottled(nextState, prevState)).toBeUndefined();
    expect(api.props.tcApi.writeGlobalToolData).not.toBeCalled();
  });

  it('should not save undefined prev state', () => {
    const api = new Api();
    api.props = {
      tcApi: {
        writeGlobalToolData: jest.fn(),
        contextId: {reference: {bookId: 'tit', chapter: 1}}
      }
    };
    const nextState = {};
    const prevState = undefined;
    expect(api.stateChangeThrottled(nextState, prevState)).toBeUndefined();
    expect(api.props.tcApi.writeGlobalToolData).not.toBeCalled();
  });

  it('should not save undefined next state', () => {
    const api = new Api();
    api.props = {
      tcApi: {
        writeGlobalToolData: jest.fn(),
        contextId: {reference: {bookId: 'tit', chapter: 1}}
      }
    };
    const nextState = undefined;
    const prevState = {};
    expect(api.stateChangeThrottled(nextState, prevState)).toBeUndefined();
    expect(api.props.tcApi.writeGlobalToolData).not.toBeCalled();
  });

  it('should not save identical state', () => {
    const api = new Api();
    api.props = {
      tcApi: {
        writeGlobalToolData: jest.fn(),
        contextId: {reference: {bookId: 'tit', chapter: 1}}
      }
    };
    const nextState = {
      tool: {hello: 'world'}
    };
    const prevState = {...nextState};
    expect(api.stateChangeThrottled(nextState, prevState)).toBeUndefined();
    expect(api.props.tcApi.writeGlobalToolData).not.toBeCalled();
  });

  it('should save changed state', () => {
    const api = new Api();
    api.props = {
      tcApi: {
        writeGlobalToolData: jest.fn(() => Promise.resolve()),
        contextId: {reference: {bookId: 'tit', chapter: 1}}
      }
    };
    const nextState = {
      tool: {hello: 'world'}
    };
    const prevState = {
      tool: {foo: 'bar'}
    };
    return api.stateChangeThrottled(nextState, prevState).then(() => {
      expect(api.props.tcApi.writeGlobalToolData).toBeCalled();
    });
  });

});
