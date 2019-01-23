jest.mock('../state/reducers');
import * as reducers from '../state/reducers';
import Api from '../Api';

describe('saving', () => {

  it('should not do anything if the tool is not ready', () => {
    const api = new Api();
    api.props = {
      tc: {
        targetBook: {
          1: {
            1: "hello"
          }
        },
        writeProjectData: jest.fn(() => Promise.resolve()),
        contextId: {reference: {bookId: 'tit', chapter: 1}}
      },
      tool: {
        isReady: false
      }
    };
    const nextState = {
      tool: {hello: 'world'}
    };
    const prevState = {
      tool: {foo: 'bar'}
    };
    expect(api.stateChangeThrottled(nextState, prevState)).toBeUndefined();
    expect(api.props.tc.writeProjectData).not.toBeCalled();
  });
  it('should not save empty state', () => {
    const api = new Api();
    api.props = {
      tc: {
        writeToolData: jest.fn(),
        contextId: {reference: {bookId: 'tit', chapter: 1}}
      },
      tool: {
        isReady: true
      }
    };
    const nextState = {};
    const prevState = {};
    expect(api.stateChangeThrottled(nextState, prevState)).toBeUndefined();
    expect(api.props.tc.writeToolData).not.toBeCalled();
  });

  it('should not save undefined prev state', () => {
    const api = new Api();
    api.props = {
      tc: {
        writeToolData: jest.fn(),
        contextId: {reference: {bookId: 'tit', chapter: 1}}
      },
      tool: {
        isReady: true
      }
    };
    const nextState = {};
    const prevState = undefined;
    expect(api.stateChangeThrottled(nextState, prevState)).toBeUndefined();
    expect(api.props.tc.writeToolData).not.toBeCalled();
  });

  it('should not save undefined next state', () => {
    const api = new Api();
    api.props = {
      tc: {
        writeToolData: jest.fn(),
        contextId: {reference: {bookId: 'tit', chapter: 1}}
      },
      tool: {
        isReady: true
      }
    };
    const nextState = undefined;
    const prevState = {};
    expect(api.stateChangeThrottled(nextState, prevState)).toBeUndefined();
    expect(api.props.tc.writeToolData).not.toBeCalled();
  });

  it('should not save identical state', () => {
    const api = new Api();
    api.props = {
      tc: {
        writeToolData: jest.fn(),
        contextId: {reference: {bookId: 'tit', chapter: 1}}
      },
      tool: {
        isReady: true
      }
    };
    const nextState = {
      tool: {hello: 'world'}
    };
    const prevState = {...nextState};
    expect(api.stateChangeThrottled(nextState, prevState)).toBeUndefined();
    expect(api.props.tc.writeToolData).not.toBeCalled();
  });

  describe('save changed state', () => {

    it('saves successfully', () => {
      global.console = {error: jest.fn()};
      reducers.__setLegacyChapterAlignments({ hello : "world"});
      const api = new Api();
      api.props = {
        tc: {
          targetBook: {
            1: {
              1: {}
            }
          },
          writeProjectData: jest.fn(() => Promise.resolve()),
          contextId: {reference: {bookId: 'tit', chapter: 1}}
        },
        tool: {
          isReady: true
        }
      };
      const nextState = {
        tool: {hello : 'world'}
      };
      const prevState = {
        tool: {foo: 'bar'}
      };
      return api.stateChangeThrottled(nextState, prevState).then(() => {
        expect(api.props.tc.writeProjectData).toBeCalled();
        expect(console.error).not.toBeCalled();
      });
    });

    it('Log error when data is empty', () => {
      global.console = {error: jest.fn()};
      reducers.__setLegacyChapterAlignments(null);
      const api = new Api();
      api.props = {
        tc: {
          targetBook: {
            1: {
              1: "hello"
            }
          },
          writeProjectData: jest.fn(() => Promise.resolve()),
          contextId: {reference: {bookId: 'tit', chapter: 1}}
        },
        tool: {
          isReady: true
        }
      };
      const nextState = {
        tool: {hello: 'world'}
      };
      const prevState = {
        tool: {foo: 'bar'}
      };
      return api.stateChangeThrottled(nextState, prevState).then(() => {
        expect(api.props.tc.writeProjectData).not.toBeCalled();
        expect(console.error).toBeCalledWith("Writing empty alignment data to tit 1. You likely forgot to load the alignment data or the data is corrupt.");
      });
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
      tool: {
        toolDataPathExistsSync: jest.fn(() => fileExists)
      }
    };
    expect(api.getIsVerseFinished(1, 1)).toEqual(fileExists);
  });

  it('is finished', () => {
    const api = new Api();
    const fileExists = true;
    api.props = {
      tool: {
        toolDataPathExistsSync: jest.fn(() => fileExists)
      }
    };
    expect(api.getIsVerseFinished(1, 1)).toEqual(fileExists);
  });

  it('sets a verse as finished', () => {
    const api = new Api();
    const writeToolData = jest.fn(() => Promise.resolve());
    const deleteToolFile = jest.fn(() => Promise.resolve());
    const recordCheck = jest.fn();

    api.props = {
      recordCheck,
      tool: {
        writeToolData,
        deleteToolFile,
      },
      tc: {
        username: 'username',
        contextId: {reference: {bookId: 'somebook'}}
      }
    };
    api.setVerseFinished(1, 1, true);
    expect(writeToolData).toBeCalled();
    expect(deleteToolFile).not.toBeCalled();
  });

  it('sets a verse has not finished', () => {
    const api = new Api();
    const writeToolData = jest.fn();
    const deleteToolFile = jest.fn(() => Promise.resolve());
    api.props = {
      recordCheck: jest.fn(),
      tool: {
        writeToolData,
        deleteToolFile
      },
      tc: {
        username: 'username',
        contextId: {reference: {bookId: 'somebook'}}
      }
    };
    api.setVerseFinished(1, 1, false);
    expect(writeToolData).not.toBeCalled();
    expect(deleteToolFile).toBeCalled();
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
      recordCheck: jest.fn(),
      tool: {
        writeToolData: jest.fn(() => Promise.resolve()),
        toolDataPathExists: jest.fn(() => Promise.resolve(false)),
        deleteToolFile: jest.fn(() => Promise.resolve()),
      },
      tc: {
        contextId: {reference: {bookId: 'mybook'}},
        sourceBook: {
          1: {
            1: {
              verseObjects: [{
                type: 'text',
                text: "olleh"
              }]
            }
          }
        },
        targetBook: {
          1: {
            1: "hello"
          }
        }
      },
      repairAndInspectVerse: jest.fn(() => true),
    };
    api.props = props;
    expect(api._validateBook(props, 1, 1)).toEqual(false);
    expect(props.repairAndInspectVerse).toHaveBeenCalledTimes(1);
    expect(props.tool.writeToolData).not.toBeCalled();
    expect(props.tool.deleteToolFile).toBeCalledWith('completed/1/1.json');
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
      recordCheck: jest.fn(),
      tool: {
        writeToolData: jest.fn(() => Promise.resolve()),
        deleteToolFile: jest.fn(() => Promise.resolve()),
        toolDataPathExists: jest.fn(() => Promise.resolve(false))
      },
      tc: {
        contextId: {reference: {bookId: 'mybook'}},
        sourceBook: {
          1: {
            1: {
              verseObjects: [{
                type: 'text',
                text: "olleh"
              }]
            }
          }
        },
        targetBook: {
          1: {
            1: "hello"
          }
        }
      },
      repairAndInspectVerse: jest.fn(() => true),
    };
    api.props = props;
    expect(api._validateVerse(props, 1, 1)).toEqual(false);
    expect(props.repairAndInspectVerse).toHaveBeenCalledTimes(1);
    expect(props.tool.writeToolData).not.toBeCalled();
    expect(props.tool.deleteToolFile).toBeCalledWith('completed/1/1.json');
  });

  it('repairs a verse without alignment changes', () => {
    reducers.__setIsVerseValid(false);
    reducers.__setVerseAlignedTargetTokens(['some', 'data']);
    const api = new Api();
    api.context = {
      store: {
        getState: jest.fn()
      }
    };
    const props = {
      recordCheck: jest.fn(),
      tool: {
        writeToolData: jest.fn(),
        deleteToolFile: jest.fn(() => Promise.resolve())
      },
      tc: {
        contextId: {reference: {bookId: 'mybook'}},
        sourceBook: {
          1: {
            1: {
              verseObjects: [{
                type: 'text',
                text: "olleh"
              }]
            }
          }
        },
        targetBook: {
          1: {
            1: "hello"
          }
        }
      },
      repairAndInspectVerse: jest.fn(() => false),
    };
    api.props = props;
    expect(api._validateVerse(props, 1, 1)).toEqual(true);
    expect(props.repairAndInspectVerse).toHaveBeenCalledTimes(1);
    expect(props.tool.writeToolData).not.toBeCalled();
    expect(props.tool.deleteToolFile).toBeCalledWith('completed/1/1.json');
  });

  it('does not repair a verse', () => {
    reducers.__setIsVerseValid(true);
    const api = new Api();
    api.context = {
      store: {
        getState: jest.fn()
      }
    };
    const props = {
      tool: {
        writeToolData: jest.fn(() => Promise.resolve()),
        toolDataPathExists: jest.fn(() => Promise.resolve(false)),
        deleteToolFile: jest.fn(() => Promise.resolve())
      },
      tc: {
        contextId: {reference: {bookId: 'mybook'}},
        sourceBook: {
          1: {
            1: {
              verseObjects: [{
                type: 'text',
                text: "olleh"
              }]
            }
          }
        },
        targetBook: {
          1: {
            1: "hello"
          }
        }
      },
      repairAndInspectVerse: jest.fn(() => false),
    };
    api.props = props;
    expect(api._validateVerse(props, 1, 1)).toEqual(true);
    expect(props.repairAndInspectVerse).not.toBeCalled();
    expect(props.tool.writeToolData).not.toBeCalled();
    expect(props.tool.deleteToolFile).not.toBeCalled();
  });
});

describe('get number of invalid checks', () => {
  it('has no invalid checks', () => {
    const props = {
      tool: {
        toolDataPathExistsSync: () => false
      },
      tc: {
        targetBook: {
          '1': {
            '1': {

            }
          }
        }
      }
    };
    const api = new Api();
    api.props = props;
    const numInvalidChecks = api.getInvalidChecks();
    expect(numInvalidChecks).toEqual(0);
  });

  it('has some invalid checks', () => {
    const props = {
      tool: {
        toolDataPathExistsSync: () => true
      },
      tc: {
        targetBook: {
          '1': {
            '1': {},
            '2': {}
          }
        }
      }
    };
    const api = new Api();
    api.props = props;
    const numInvalidChecks = api.getInvalidChecks();
    expect(numInvalidChecks).toEqual(2);
  });
});
