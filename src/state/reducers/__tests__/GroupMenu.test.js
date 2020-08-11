import _ from "lodash";
import {reducerTest} from 'redux-jest';
import * as types from '../../actions/actionTypes';
import groupMenu, * as fromGroupMenu from '../GroupMenu';
import {getGroupMenuItem} from "../index";

describe('test CLEAR_GROUP_MENU', () => {
  const before = { stuff: {stuff: {}} };
  const action = {
    type: types.CLEAR_GROUP_MENU
  };
  const after = {};
  reducerTest('groupMenu', groupMenu, before, action, after);
});

describe('test SET_GROUP_MENU_FINISHED true', () => {
  const before = {};
  const action = {
    type: types.SET_GROUP_MENU_FINISHED,
    chapter: 1,
    verse: 2,
    value: true
  };
  const after = {
    '1': {
      '2': {
        finished: action.value
      }
    }
  };
  reducerTest('groupMenu', groupMenu, before, action, after);
});

describe('test SET_GROUP_MENU_FINISHED false', () => {
  const before = {
    '1': {
      '2': {
        finished: true,
        invalid: true
      }
    }
  };
  const action = {
    type: types.SET_GROUP_MENU_FINISHED,
    chapter: 1,
    verse: 2,
    value: false
  };
  const after = {
    '1': {
      '2': {
        finished: action.value,
        invalid: true
      }
    }
  };
  reducerTest('groupMenu', groupMenu, before, action, after);
});

describe('test SET_GROUP_MENU_FINISHED invalid chapter should not crash', () => {
  const before = {
    '1': {
      '2': {
        finished: true,
        invalid: true
      }
    }
  };
  const action = {
    type: types.SET_GROUP_MENU_FINISHED,
    chapter: undefined,
    verse: 2,
    value: false
  };
  const after = {
    '1': {
      '2': {
        finished: true,
        invalid: true
      }
    }
  };
  reducerTest('groupMenu', groupMenu, before, action, after);
});

describe('test SET_GROUP_MENU_FINISHED invalid verse should not crash', () => {
  const before = {
    '1': {
      '2': {
        finished: true,
        invalid: true
      }
    }
  };
  const action = {
    type: types.SET_GROUP_MENU_FINISHED,
    chapter: 1,
    verse: undefined,
    value: false
  };
  const after = {
    '1': {
      '2': {
        finished: true,
        invalid: true
      }
    }
  };
  reducerTest('groupMenu', groupMenu, before, action, after);
});

describe('test SET_GROUP_MENU_INVALID true', () => {
  const before = {};
  const action = {
    type: types.SET_GROUP_MENU_INVALID,
    chapter: 1,
    verse: 2,
    value: true
  };
  const after = {
    '1': {
      '2': {
        invalid: action.value
      }
    }
  };
  reducerTest('groupMenu', groupMenu, before, action, after);
});

describe('test SET_GROUP_MENU_INVALID false', () => {
  const before = {
    '1': {
      '2': {
        finished: true,
        invalid: true
      }
    }
  };
  const action = {
    type: types.SET_GROUP_MENU_INVALID,
    chapter: 1,
    verse: 2,
    value: false
  };
  const after = {
    '1': {
      '2': {
        finished: true,
        invalid: action.value
      }
    }
  };
  reducerTest('groupMenu', groupMenu, before, action, after);
});

describe('test SET_GROUP_MENU_UNALIGNED true', () => {
  const before = {
    '2': {}
  };
  const action = {
    type: types.SET_GROUP_MENU_UNALIGNED,
    chapter: 1,
    verse: 2,
    value: true
  };
  const after = {
    '1': {
      '2': {
        unaligned: action.value
      }
    },
    '2': {}
  };
  reducerTest('groupMenu', groupMenu, before, action, after);
});

describe('test SET_GROUP_MENU_UNALIGNED false', () => {
  const before = {
    '1': {
      '2': {
        finished: true,
        invalid: true,
        unaligned: true
      }
    }
  };
  const action = {
    type: types.SET_GROUP_MENU_UNALIGNED,
    chapter: 1,
    verse: 2,
    value: false
  };
  const after = {
    '1': {
      '2': {
        finished: true,
        invalid: true,
        unaligned: action.value
      }
    }
  };
  reducerTest('groupMenu', groupMenu, before, action, after);
});

describe('test SET_GROUP_MENU_EDITED true', () => {
  const before = {
    '2': {
      '1': {}
    }
  };
  const action = {
    type: types.SET_GROUP_MENU_EDITED,
    chapter: 1,
    verse: 2,
    value: true
  };
  const after = {
    '1': {
      '2': {
        edited: action.value
      }
    },
    '2': before['2']
  };
  reducerTest('groupMenu', groupMenu, before, action, after);
});

describe('test SET_GROUP_MENU_EDITED false', () => {
  const before = {
    '1': {
      '2': {
        finished: true,
        invalid: true,
        edited: true
      }
    }
  };
  const action = {
    type: types.SET_GROUP_MENU_EDITED,
    chapter: 1,
    verse: 2,
    value: false
  };
  const after = {
    '1': {
      '2': {
        finished: true,
        invalid: true,
        edited: action.value
      }
    }
  };
  reducerTest('groupMenu', groupMenu, before, action, after);
});

describe('test SET_GROUP_MENU_STATE finished', () => {
  const before = {
    '1': {
      '2': {
        finished: true,
        invalid: true,
        edited: true,
        unaligned: true
      }
    }
  };
  const action = {
    type: types.SET_GROUP_MENU_STATE,
    chapter: 1,
    verse: 2,
    values: {finished: false}
  };
  const after = {
    '1': {
      '2': {
        edited: true,
        invalid: true,
        unaligned: true,
        finished: action.values.finished
      }
    }
  };
  reducerTest('groupMenu', groupMenu, before, action, after);
});

describe('test SET_GROUP_MENU_STATE finished empty reducer', () => {
  const before = {};
  const action = {
    type: types.SET_GROUP_MENU_STATE,
    chapter: 1,
    verse: 2,
    values: {finished: false}
  };
  const after = {
    '1': {
      '2': {
        finished: action.values.finished
      }
    }
  };
  reducerTest('groupMenu', groupMenu, before, action, after);
});

describe('test SET_GROUP_MENU_STATE finished, invalid', () => {
  const before = {
    '1': {
      '2': {
        finished: true,
        invalid: true,
        edited: true,
        unaligned: true
      }
    }
  };
  const action = {
    type: types.SET_GROUP_MENU_STATE,
    chapter: 1,
    verse: 2,
    values: {finished: false, invalid: false}
  };
  const after = {
    '1': {
      '2': {
        edited: true,
        invalid: action.values.invalid,
        unaligned: true,
        finished: action.values.finished
      }
    }
  };
  reducerTest('groupMenu', groupMenu, before, action, after);
});

describe('test SET_GROUP_MENU_STATE finished, invalid, edited', () => {
  const before = {
    '1': {
      '2': {
        finished: true,
        invalid: true,
        edited: true,
        unaligned: true
      }
    }
  };
  const action = {
    type: types.SET_GROUP_MENU_STATE,
    chapter: 1,
    verse: 2,
    values: {finished: false, invalid: false, edited: false}
  };
  const after = {
    '1': {
      '2': {
        edited: action.values.edited,
        invalid: action.values.invalid,
        unaligned: true,
        finished: action.values.finished
      }
    }
  };
  reducerTest('groupMenu', groupMenu, before, action, after);
});

describe('test SET_GROUP_MENU_STATE finished, invalid, edited, unaligned', () => {
  const before = {
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
    },
    '2': {
      '2': {
        finished: true,
        invalid: true,
        edited: true,
        unaligned: true
      }
    }
  };
  const action = {
    type: types.SET_GROUP_MENU_STATE,
    chapter: 1,
    verse: 2,
    values: {finished: false, invalid: false, edited: false, unaligned: false}
  };
  const after = {
    '1': {
      '2': {
        edited: action.values.edited,
        invalid: action.values.invalid,
        unaligned: action.values.unaligned,
        finished: action.values.finished
      },
      '3': before['1']['3']
    },
    '2': before['2']
  };
  reducerTest('groupMenu', groupMenu, before, action, after);
});

describe('test SET_GROUP_MENU_STATE invalid chapter should not crash', () => {
  const before = {
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
    },
    '2': {
      '2': {
        finished: true,
        invalid: true,
        edited: true,
        unaligned: true
      }
    }
  };
  const action = {
    type: types.SET_GROUP_MENU_STATE,
    chapter: undefined,
    verse: 2,
    values: {finished: false, invalid: false, edited: false, unaligned: false}
  };
  const after = _.cloneDeep(before);
  reducerTest('groupMenu', groupMenu, before, action, after);
});

describe('test SET_GROUP_MENU_STATE invalid verse should not crash', () => {
  const before = {
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
    },
    '2': {
      '2': {
        finished: true,
        invalid: true,
        edited: true,
        unaligned: true
      }
    }
  };
  const action = {
    type: types.SET_GROUP_MENU_STATE,
    chapter: 1,
    verse: undefined,
    values: {finished: false, invalid: false, edited: false, unaligned: false}
  };
  const after = _.cloneDeep(before);
  reducerTest('groupMenu', groupMenu, before, action, after);
});

describe('test SET_GROUP_MENU_STATE invalid values should not crash', () => {
  const before = {
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
    },
    '2': {
      '2': {
        finished: true,
        invalid: true,
        edited: true,
        unaligned: true
      }
    }
  };
  const action = {
    type: types.SET_GROUP_MENU_STATE,
    chapter: 1,
    verse: 2,
    values: null
  };
  const after = _.cloneDeep(before);
  reducerTest('groupMenu', groupMenu, before, action, after);
});

describe('test SET_GROUP_MENU_STATE missing values should not crash', () => {
  const before = {
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
    },
    '2': {
      '2': {
        finished: true,
        invalid: true,
        edited: true,
        unaligned: true
      }
    }
  };
  const action = {
    type: types.SET_GROUP_MENU_STATE,
    chapter: 1,
    verse: 2
  };
  const after = _.cloneDeep(before);
  reducerTest('groupMenu', groupMenu, before, action, after);
});

describe('getMenuItem', () => {
  it('empty reducer', () => {
    const state = {};
    const expectedResults = null;
    const results = fromGroupMenu.getMenuItem(state, 1, 1);
    expect(results).toEqual(expectedResults);
  });

  it('empty chapter', () => {
    const state = {
      '1': {}
    };
    const expectedResults = null;
    const results = fromGroupMenu.getMenuItem(state, 1, 1);
    expect(results).toEqual(expectedResults);
  });

  it('empty item', () => {
    const state = {
      '1': {
        '5': {}
      }
    };
    const expectedResults = {};
    const results = fromGroupMenu.getMenuItem(state, 1, 5);
    expect(results).toEqual(expectedResults);
  });

  it('populated item', () => {
    const state = {
      '1': {
        '7': {
          dummy: "dum"
        }
      }
    };
    const expectedResults = state['1']['7'];
    const results = fromGroupMenu.getMenuItem(state, 1, 7);
    expect(results).toEqual(expectedResults);
  });

  it('invalid chapter', () => {
    const state = {
      '1': {
        '5': {}
      }
    };
    const expectedResults = null;
    const results = fromGroupMenu.getMenuItem(state, undefined, 5);
    expect(results).toEqual(expectedResults);
  });

  it('invalid verse', () => {
    const state = {
      '1': {
        '5': {}
      }
    };
    const expectedResults = null;
    const results = fromGroupMenu.getMenuItem(state, 1, undefined);
    expect(results).toEqual(expectedResults);
  });
});

describe('test Selector', () => {
  it('populated reminder', () => {
    // given
    const loadData = {
      '1': {
        '7': {
          dummy: "dum"
        }
      }
    };
    const state = {
      tool: {
        groupMenu:  _.cloneDeep(loadData)
      }
    };

    // when
    const menuItem = getGroupMenuItem(state, 1, 7);

    // then
    expect(menuItem).toEqual(loadData[1][7]);
  });
});
