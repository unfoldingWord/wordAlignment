jest.mock('../state/reducers');
import * as reducers from '../state/reducers';
import Api from '../Api';

describe('saving', () => {
  it('should not save empty state', () => {
    const api = new Api();
    api.props = {
      tc: {
        writeProjectData: jest.fn(),
        contextId: {reference: {bookId: 'tit', chapter: 1}}
      }
    };
    const nextState = {};
    const prevState = {};
    expect(api.stateChangeThrottled(nextState, prevState)).toBeUndefined();
    expect(api.props.tc.writeProjectData).not.toBeCalled();
  });

  it('should not save undefined prev state', () => {
    const api = new Api();
    api.props = {
      tc: {
        writeProjectData: jest.fn(),
        contextId: {reference: {bookId: 'tit', chapter: 1}}
      }
    };
    const nextState = {};
    const prevState = undefined;
    expect(api.stateChangeThrottled(nextState, prevState)).toBeUndefined();
    expect(api.props.tc.writeProjectData).not.toBeCalled();
  });

  it('should not save undefined next state', () => {
    const api = new Api();
    api.props = {
      tc: {
        writeProjectData: jest.fn(),
        contextId: {reference: {bookId: 'tit', chapter: 1}}
      }
    };
    const nextState = undefined;
    const prevState = {};
    expect(api.stateChangeThrottled(nextState, prevState)).toBeUndefined();
    expect(api.props.tc.writeProjectData).not.toBeCalled();
  });

  it('should not save identical state', () => {
    const api = new Api();
    api.props = {
      tc: {
        writeProjectData: jest.fn(),
        contextId: {reference: {bookId: 'tit', chapter: 1}}
      }
    };
    const nextState = {
      tool: {hello: 'world'}
    };
    const prevState = {...nextState};
    expect(api.stateChangeThrottled(nextState, prevState)).toBeUndefined();
    expect(api.props.tc.writeProjectData).not.toBeCalled();
  });

  it('should save changed state', () => {
    const api = new Api();
    api.props = {
      tc: {
        writeProjectData: jest.fn(() => Promise.resolve()),
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
      expect(api.props.tc.writeProjectData).toBeCalled();
    });
  });
});

describe('context', () => {
  it('has an empty previous context', () => {
    const result = Api._didChapterContextChange(null, {});
    expect(result).toEqual(true);
  });

  it('should identify a chapter change', () => {
    const prevContext = {
      reference: {
        bookId: 'mat',
        chapter: '1'
      }
    };
    const nextContext = {
      reference: {
        bookId: 'mat',
        chapter: '2'
      }
    };
    const result = Api._didChapterContextChange(prevContext, nextContext);
    expect(result).toEqual(true);
  });

  it('should identify a book change', () => {
    const prevContext = {
      reference: {
        bookId: 'mat',
        chapter: '1'
      }
    };
    const nextContext = {
      reference: {
        bookId: 'jhn',
        chapter: '1'
      }
    };
    const result = Api._didChapterContextChange(prevContext, nextContext);
    expect(result).toEqual(true);
  });

  it('should not change', () => {
    const prevContext = {
      reference: {
        bookId: 'mat',
        chapter: '1'
      }
    };
    const nextContext = {
      reference: {
        bookId: 'mat',
        chapter: '1'
      }
    };
    const result = Api._didChapterContextChange(prevContext, nextContext);
    expect(result).toEqual(false);
  });
});

describe('verse finished', () => {
  it('is not finished', () => {
    const api = new Api();
    const fileExists = false;
    api.props = {
      tc: {
        projectFileExistsSync: jest.fn(() => fileExists),
        contextId: {reference: {bookId: 'somebook'}}
      }
    };
    expect(api.getIsVerseFinished(1, 1)).toEqual(fileExists);
  });

  it('is finished', () => {
    const api = new Api();
    const fileExists = true;
    api.props = {
      tc: {
        projectFileExistsSync: jest.fn(() => fileExists),
        contextId: {reference: {bookId: 'somebook'}}
      }
    };
    expect(api.getIsVerseFinished(1, 1)).toEqual(fileExists);
  });

  it('sets a verse as finished', () => {
    const api = new Api();
    const writeProjectData = jest.fn();
    const deleteProjectFile = jest.fn();
    api.props = {
      tc: {
        writeProjectData,
        deleteProjectFile,
        username: 'username',
        contextId: {reference: {bookId: 'somebook'}}
      }
    };
    api.setVerseFinished(1, 1, true);
    expect(writeProjectData).toBeCalled();
    expect(deleteProjectFile).not.toBeCalled();
  });

  it('sets a verse has not finished', () => {
    const api = new Api();
    const writeProjectData = jest.fn();
    const deleteProjectFile = jest.fn();
    api.props = {
      tc: {
        writeProjectData,
        deleteProjectFile,
        username: 'username',
        contextId: {reference: {bookId: 'somebook'}}
      }
    };
    api.setVerseFinished(1, 1, false);
    expect(writeProjectData).not.toBeCalled();
    expect(deleteProjectFile).toBeCalled();
  });
});

describe('validate', () => {

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('repairs a book', () => {
    reducers.__setIsVerseValid(false);
    reducers.__setVerseAlignedTargetTokens(['some', 'data']);
    const api = new Api();
    api.context = {
      store: {
        getState: jest.fn()
      }
    };
    const props = {
      tc: {
        contextId: {reference: {bookId: 'mybook'}},
        writeProjectData: jest.fn(),
        deleteProjectFile: jest.fn(),
        sourceBible: {
          1: {
            1: {
              verseObjects: [{
                type: 'text',
                text: "olleh"
              }]
            }
          }
        },
        targetBible: {
          1: {
            1: "hello"
          }
        }
      },
      repairVerse: jest.fn()
    };
    api.props = props;
    expect(api._validateBook(props, 1, 1)).toEqual(false);
    expect(props.repairVerse).toHaveBeenCalledTimes(1);
    expect(props.tc.writeProjectData).not.toBeCalled();
    expect(props.tc.deleteProjectFile).toBeCalledWith('alignmentData/completed/mybook/1/1.json');
  });

  it('repairs a verse', () => {
    reducers.__setIsVerseValid(false);
    reducers.__setVerseAlignedTargetTokens(['some', 'data']);
    const api = new Api();
    api.context = {
      store: {
        getState: jest.fn()
      }
    };
    const props = {
      tc: {
        contextId: {reference: {bookId: 'mybook'}},
        writeProjectData: jest.fn(),
        deleteProjectFile: jest.fn(),
        sourceBible: {
          1: {
            1: {
              verseObjects: [{
                type: 'text',
                text: "olleh"
              }]
            }
          }
        },
        targetBible: {
          1: {
            1: "hello"
          }
        }
      },
      repairVerse: jest.fn()
    };
    api.props = props;
    expect(api._validateVerse(props, 1, 1)).toEqual(false);
    expect(props.repairVerse).toHaveBeenCalledTimes(1);
    expect(props.tc.writeProjectData).not.toBeCalled();
    expect(props.tc.deleteProjectFile).toBeCalledWith('alignmentData/completed/mybook/1/1.json');
  });

  it('does not repair a verse', () => {
    reducers.__setIsVerseValid(true);
    // reducers.__setVerseAlignedTargetTokens(['some', 'data']);
    const api = new Api();
    api.context = {
      store: {
        getState: jest.fn()
      }
    };
    const props = {
      tc: {
        contextId: {reference: {bookId: 'mybook'}},
        writeProjectData: jest.fn(),
        deleteProjectFile: jest.fn(),
        sourceBible: {
          1: {
            1: {
              verseObjects: [{
                type: 'text',
                text: "olleh"
              }]
            }
          }
        },
        targetBible: {
          1: {
            1: "hello"
          }
        }
      },
      repairVerse: jest.fn()
    };
    api.props = props;
    expect(api._validateVerse(props, 1, 1)).toEqual(true);
    expect(props.repairVerse).not.toBeCalled();
    expect(props.tc.writeProjectData).not.toBeCalled();
    expect(props.tc.deleteProjectFile).not.toBeCalled();
  });
});
