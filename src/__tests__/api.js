import configureMockStore from "redux-mock-store";
import thunk from 'redux-thunk';
import * as reducers from '../state/reducers';
import Api from '../Api';
import {
  INVALID_KEY,
} from "../state/reducers/GroupMenu";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('../state/reducers');
jest.mock('../state/actions');

const saveConsole = global.console;

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
      reducers.__setLegacyChapterAlignments({hello: "world"});
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
        tool: {hello: 'world'}
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

describe('verse unaligned', () => {
  it('is unaligned', () => {
    const api = new Api();
    api.context = {
      store: {
        getState: jest.fn(() => ({
          alignments: {
            1: {
              1: {
                alignments: [
                  {
                    "sourceNgram": [
                      0
                    ],
                    "targetNgram": [
                      0,
                      3
                    ]
                  },
                  {
                    "sourceNgram": [
                      1
                    ],
                    "targetNgram": [
                      1,
                      4
                    ]
                  },
                  {
                    "sourceNgram": [
                      2
                    ],
                    "targetNgram": [
                      2
                    ]
                  },
                ]
              }
            }
          }
        }))
      }
    };
    expect(reducers.getIsVerseAligned(api, 1, 1)).toEqual(false);
  });
});

describe('setVerseFinished()', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sets a verse as finished', () => {
    // given
    const api = new Api();
    const writeToolData = jest.fn(() => Promise.resolve());
    const deleteToolFile = jest.fn(() => Promise.resolve());
    const recordCheck = jest.fn();
    const toolDataPathExists = jest.fn(() => Promise.resolve(false));
    const setGroupMenuItemFinished = jest.fn();
    const setGroupMenuItemInvalid = jest.fn();
    api.props = {
      recordCheck,
      setGroupMenuItemFinished,
      setGroupMenuItemInvalid,
      tool: {
        writeToolData,
        deleteToolFile,
        toolDataPathExists,
      },
      tc: {
        username: 'username',
        contextId: {reference: {bookId: 'somebook'}}
      }
    };
    api.context = {
      store: {
        getState: () => ({}),
        dispatch: () => ({})
      }
    };
    reducers.getGroupMenuItem.mockReturnValue(null);

    // when
    api.setVerseFinished(1, 1, true);

    // then
    expect(writeToolData).toBeCalled();
    expect(deleteToolFile).not.toBeCalled();
    expect(reducers.getGroupMenuItem).toBeCalled();
    expect(api.props.setGroupMenuItemFinished).toBeCalledWith(1,1,true);
  });

  it('sets a verse has not finished', () => {
    // given
    const api = new Api();
    const writeToolData = jest.fn();
    const deleteToolFile = jest.fn(() => Promise.resolve());
    const setGroupMenuItemFinished = jest.fn();
    api.props = {
      setGroupMenuItemFinished,
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
    api.context = {
      store: {
        getState: jest.fn(() => ({})),
        dispatch: jest.fn()
      }
    };
    reducers.getGroupMenuItem.mockReturnValue(null);

    // when
    api.setVerseFinished(1, 1, false);

    // then
    expect(writeToolData).not.toBeCalled();
    expect(deleteToolFile).toBeCalled();
    expect(reducers.getGroupMenuItem).toBeCalled();
    expect(api.props.setGroupMenuItemFinished).toBeCalledWith(1,1,false);
  });
});

describe('validate', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    global.console = saveConsole; // restore original console
  });

  it('repairs a book', async () => {
    reducers.__setIsVerseValid(false);
    reducers.__setVerseAlignedTargetTokens(['some', 'data']);
    const alignmentCompleteFileExists = false;
    const alignmentInvalidFileExists = false;
    const api = new Api();
    api.context = {
      store: {
        getState: jest.fn()
      }
    };
    const props = {
      recordCheck: jest.fn(),
      loadGroupMenuItem: jest.fn(),
      setGroupMenuItemInvalid: jest.fn(),
      setGroupMenuItemFinished: jest.fn(),
      tool: {
        writeToolData: jest.fn(() => Promise.resolve()),
        toolDataPathExistsSync: jest.fn(() => (alignmentCompleteFileExists)),
        toolDataPathExists: jest.fn(() => Promise.resolve(alignmentInvalidFileExists)),
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
    api.context = {
      store: {
        getState: jest.fn(() => ({})),
        dispatch: jest.fn()
      }
    };
    expect(api._validateBook(props, 1, 1)).toEqual(false);
    expect(props.repairAndInspectVerse).toHaveBeenCalledTimes(1);
    expect(props.tool.deleteToolFile).toBeCalledWith('completed/1/1.json');
    await delay(200); // wait for async file system to update
    expect(props.tool.writeToolData).toBeCalledWith('invalid/1/1.json', expect.any(String));
    expect(reducers.getGroupMenuItem).toBeCalled();
    expect(props.setGroupMenuItemInvalid).toBeCalledWith("1","1",true);
  });

  it('repairs a verse', async () => {
    reducers.__setIsVerseValid(false);
    reducers.__setVerseAlignedTargetTokens(['some', 'data']);
    const alignmentCompleteFileExists = false;
    const alignmentInvalidFileExists = false;
    const api = new Api();
    api.context = {
      store: {
        getState: jest.fn()
      }
    };
    const props = {
      recordCheck: jest.fn(),
      loadGroupMenuItem: jest.fn(),
      setGroupMenuItemInvalid: jest.fn(),
      setGroupMenuItemFinished: jest.fn(),
      tool: {
        writeToolData: jest.fn(() => Promise.resolve()),
        deleteToolFile: jest.fn(() => Promise.resolve()),
        toolDataPathExistsSync: jest.fn(() => (alignmentCompleteFileExists)),
        toolDataPathExists: jest.fn(() => Promise.resolve(alignmentInvalidFileExists))
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
    api.context = {
      store: {
        getState: jest.fn(() => ({})),
        dispatch: jest.fn()
      }
    };
    expect(api._validateVerse(props, 1, 1)).toEqual(false);
    expect(props.repairAndInspectVerse).toHaveBeenCalledTimes(1);
    expect(props.tool.deleteToolFile).toBeCalledWith('completed/1/1.json');
    await delay(200); // wait for async file system to update
    expect(props.tool.writeToolData).toBeCalledWith('invalid/1/1.json', expect.any(String));
    expect(reducers.getGroupMenuItem).toBeCalled();
    expect(props.setGroupMenuItemInvalid).toBeCalledWith(1,1,true);
  });

  it('repairs a verse without alignment changes', async () => {
    reducers.__setIsVerseValid(false);
    reducers.__setIsVerseAligned(1, 1, false);
    reducers.__setVerseAlignedTargetTokens(['some', 'data']);
    const alignmentCompleteFileExists = false;
    const alignmentInvalidFileExists = false;
    const wasChangedByRepair = false;
    const api = new Api();
    api.context = {
      store: {
        getState: jest.fn()
      }
    };
    const props = {
      recordCheck: jest.fn(),
      loadGroupMenuItem: jest.fn(),
      setGroupMenuItemInvalid: jest.fn(),
      setGroupMenuItemFinished: jest.fn(),
      tool: {
        writeToolData: jest.fn(),
        deleteToolFile: jest.fn(() => Promise.resolve()),
        toolDataPathExistsSync: jest.fn(() => (alignmentCompleteFileExists)),
        toolDataPathExists: jest.fn(() => Promise.resolve(alignmentInvalidFileExists))
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
      repairAndInspectVerse: jest.fn(() => wasChangedByRepair),
    };
    api.props = props;
    api.context = {
      store: {
        getState: jest.fn(() => ({})),
        dispatch: jest.fn()
      }
    };
    expect(api._validateVerse(props, 1, 1)).toEqual(true);
    expect(props.repairAndInspectVerse).toHaveBeenCalledTimes(1);
    expect(props.tool.deleteToolFile).toBeCalledWith('completed/1/1.json');
    await delay(200); // wait for async file system to update
    expect(props.tool.writeToolData).not.toBeCalled();
    expect(props.setGroupMenuItemInvalid).not.toBeCalled();
  });

  it('repairs modified aligned verse without alignment changes and returns not valid', async () => {
    reducers.__setIsVerseValid(false);
    reducers.__setIsVerseAligned(1, 1, true);
    reducers.__setVerseAlignedTargetTokens(['some', 'data']);
    const alignmentCompleteFileExists = false;
    const alignmentInvalidFileExists = false;
    const wasChangedByRepair = false;
    const api = new Api();
    api.context = {
      store: {
        getState: jest.fn()
      }
    };

    const props = {
      recordCheck: jest.fn(),
      loadGroupMenuItem: jest.fn(),
      setGroupMenuItemInvalid: jest.fn(),
      setGroupMenuItemFinished: jest.fn(),
      tool: {
        writeToolData: jest.fn(() => Promise.resolve()),
        deleteToolFile: jest.fn(() => Promise.resolve()),
        toolDataPathExistsSync: jest.fn(() => (alignmentCompleteFileExists)),
        toolDataPathExists: jest.fn(() => Promise.resolve(alignmentInvalidFileExists))
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
      repairAndInspectVerse: jest.fn(() => wasChangedByRepair),
    };
    api.props = props;
    api.context = {
      store: {
        getState: jest.fn(() => ({})),
        dispatch: jest.fn()
      }
    };
    expect(api._validateVerse(props, 1, 1)).toEqual(false);
    expect(props.repairAndInspectVerse).toHaveBeenCalledTimes(1);
    expect(props.tool.deleteToolFile).toBeCalledWith('completed/1/1.json');
    await delay(200); // wait for async file system to update
    expect(props.tool.writeToolData).toBeCalledWith('invalid/1/1.json', expect.any(String));
    expect(props.setGroupMenuItemInvalid).toBeCalledWith(1,1,true);
  });

  it('repairs modified aligned verse with alignment changes and returns not valid', async () => {
    reducers.__setIsVerseValid(false);
    reducers.__setIsVerseAligned(1, 1, true);
    reducers.__setVerseAlignedTargetTokens(['some', 'data']);
    const alignmentCompleteFileExists = false;
    const alignmentInvalidFileExists = false;
    const wasChangedByRepair = true;
    const api = new Api();
    api.context = {
      store: {
        getState: jest.fn()
      }
    };

    const props = {
      recordCheck: jest.fn(),
      loadGroupMenuItem: jest.fn(),
      setGroupMenuItemInvalid: jest.fn(),
      setGroupMenuItemFinished: jest.fn(),
      tool: {
        writeToolData: jest.fn(() => Promise.resolve()),
        deleteToolFile: jest.fn(() => Promise.resolve()),
        toolDataPathExistsSync: jest.fn(() => (alignmentCompleteFileExists)),
        toolDataPathExists: jest.fn(() => Promise.resolve(alignmentInvalidFileExists))
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
      repairAndInspectVerse: jest.fn(() => wasChangedByRepair),
    };
    api.props = props;
    api.context = {
      store: {
        getState: jest.fn(() => ({})),
        dispatch: jest.fn()
      }
    };
    expect(api._validateVerse(props, 1, 1)).toEqual(false);
    expect(props.repairAndInspectVerse).toHaveBeenCalledTimes(1);
    expect(props.tool.deleteToolFile).toBeCalledWith('completed/1/1.json');
    await delay(200); // wait for async file system to update
    expect(props.tool.writeToolData).toBeCalledWith('invalid/1/1.json', expect.any(String));
    expect(reducers.getGroupMenuItem).toBeCalled();
    expect(props.setGroupMenuItemInvalid).toBeCalledWith(1,1,true);
  });

  it('repairs modified complete without alignment changes and returns not valid', async () => {
    reducers.__setIsVerseValid(false);
    reducers.__setIsVerseAligned(1, 1, true);
    reducers.__setVerseAlignedTargetTokens(['some', 'data']);
    const alignmentCompleteFileExists = true;
    const alignmentInvalidFileExists = false;
    const api = new Api();
    api.context = {
      store: {
        getState: jest.fn()
      }
    };
    const props = {
      recordCheck: jest.fn(),
      loadGroupMenuItem: jest.fn(),
      setGroupMenuItemInvalid: jest.fn(),
      setGroupMenuItemFinished: jest.fn(),
      tool: {
        writeToolData: jest.fn(() => new Promise(resolve => {resolve()})),
        deleteToolFile: jest.fn(() => Promise.resolve()),
        toolDataPathExistsSync: jest.fn(() => (alignmentCompleteFileExists)),
        toolDataPathExists: jest.fn(() => Promise.resolve(alignmentInvalidFileExists))
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
    api.context = {
      store: {
        getState: jest.fn(() => ({})),
        dispatch: jest.fn()
      }
    };
    expect(api._validateVerse(props, 1, 1)).toEqual(false);
    expect(props.repairAndInspectVerse).toHaveBeenCalledTimes(1);
    expect(props.tool.deleteToolFile).toBeCalledWith('completed/1/1.json');
    await delay(200); // wait for async file system to update
    expect(props.tool.writeToolData).toHaveBeenCalledTimes(1);
    expect(reducers.getGroupMenuItem).toBeCalled();
    expect(props.setGroupMenuItemInvalid).toBeCalledWith(1,1,true);
  });

  it('does not repair valid aligned verse', async () => {
    reducers.__setIsVerseValid(true);
    reducers.__setIsVerseAligned(1, 1, true);
    const alignmentCompleteFileExists = true;
    const alignmentInvalidFileExists = false;
    const api = new Api();
    api.context = {
      store: {
        getState: jest.fn()
      }
    };
    const props = {
      loadGroupMenuItem: jest.fn(),
      setGroupMenuItemInvalid: jest.fn(),
      setGroupMenuItemFinished: jest.fn(),
      tool: {
        writeToolData: jest.fn(() => Promise.resolve()),
        toolDataPathExistsSync: jest.fn(() => (alignmentCompleteFileExists)),
        toolDataPathExists: jest.fn(() => Promise.resolve(alignmentInvalidFileExists)),
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
      repairAndInspectVerse: jest.fn(),
    };
    api.props = props;
    api.context = {
      store: {
        getState: jest.fn(() => ({})),
        dispatch: jest.fn()
      }
    };
    expect(api._validateVerse(props, 1, 1)).toEqual(true);
    expect(props.repairAndInspectVerse).not.toBeCalled();
    expect(props.tool.writeToolData).not.toBeCalled();
    expect(props.tool.deleteToolFile).not.toBeCalled();
    await delay(200); // wait for async file system to update
    expect(props.tool.writeToolData).not.toBeCalled();
    expect(props.setGroupMenuItemInvalid).not.toBeCalled();
  });

  it('does not invalidate empty verse', async () => {
    // given
    global.console = {warn: jest.fn()};
    reducers.__setIsVerseValid(true);
    reducers.__setIsVerseAligned(1, 1, true);
    const alignmentCompleteFileExists = true;
    const alignmentInvalidFileExists = false;
    const api = new Api();
    api.context = {
      store: {
        getState: jest.fn()
      }
    };
    const props = {
      loadGroupMenuItem: jest.fn(),
      setGroupMenuItemInvalid: jest.fn(),
      setGroupMenuItemFinished: jest.fn(),
      tool: {
        writeToolData: jest.fn(() => Promise.resolve()),
        toolDataPathExistsSync: jest.fn(() => (alignmentCompleteFileExists)),
        toolDataPathExists: jest.fn(() => Promise.resolve(alignmentInvalidFileExists)),
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
            1: ""
          }
        }
      },
      repairAndInspectVerse: jest.fn(() => false),
    };
    api.props = props;
    api.context = {
      store: {
        getState: jest.fn(() => ({})),
        dispatch: jest.fn()
      }
    };

    // when
    expect(api._validateVerse(props, 1, 1)).toEqual(true);

    // then
    expect(console.warn).toBeCalled();
    expect(props.repairAndInspectVerse).not.toBeCalled();
    expect(props.tool.writeToolData).not.toBeCalled();
    expect(props.tool.deleteToolFile).not.toBeCalled();
    await delay(200); // wait for async file system to update
    expect(props.tool.writeToolData).not.toBeCalled();
    expect(props.setGroupMenuItemInvalid).not.toBeCalled();
  });
});

describe('get number of invalid checks', () => {
  it('has no invalid checks', () => {
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
            '1': { }
          }
        }
      }
    };
    const api = new Api();
    api.props = props;
    api.context.store = store;
    reducers.getGroupMenuItem.mockReset();
    reducers.getGroupMenuItem.mockReturnValue({ [INVALID_KEY]: false });

    // when
    const numInvalidChecks = api.getInvalidChecks();

    // then
    expect(numInvalidChecks).toEqual(0);
    expect(reducers.getGroupMenuItem).toHaveBeenCalledTimes(1);
    expect(reducers.getGroupMenuItem).toBeCalledWith(state,'1','1');
  });

  it('has some invalid checks', () => {
    // given
    const state = {
      tool: {
        groupMenu: { }
      }
    };
    const store = mockStore(state);
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
    api.context.store = store;
    reducers.getGroupMenuItem.mockReset();
    reducers.getGroupMenuItem.mockReturnValue({ [INVALID_KEY]: true });

    // when
    const numInvalidChecks = api.getInvalidChecks();

    // then
    expect(numInvalidChecks).toEqual(2);
    expect(reducers.getGroupMenuItem).toHaveBeenCalledTimes(2);
  });
});

//
// helper functions
//

function delay(ms) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}
