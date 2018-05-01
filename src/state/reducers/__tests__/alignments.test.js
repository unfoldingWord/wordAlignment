import {reducerTest} from 'redux-jest';
import * as types from '../../actions/actionTypes';
import alignments, * as fromAlignments from '../alignments';
import Token from 'word-map/structures/Token';

describe('set chapter alignments when empty', () => {
  const stateBefore = {};
  const action = {
    type: types.SET_CHAPTER_ALIGNMENTS,
    chapter: 1,
    alignments: {
      '1': {
        sourceTokens: [],
        targetTokens: [],
        alignments: []
      }
    }
  };
  const stateAfter = {
    '1': {
      '1': {
        alignments: [],
        source: {
          text: '',
          tokens: []
        },
        target: {
          text: '',
          tokens: []
        }
      }
    }
  };
  reducerTest('Set Chapter Alignments', alignments, stateBefore, action,
    stateAfter);
});

describe('align target token to empty source token', () => {
  const stateBefore = {
    '1': {
      '1': {
        source: {
          tokens: []
        },
        target: {
          tokens: [
            {
              word: 'hello',
              occurrence: 1,
              occurrences: 1,
              position: 0
            },
            {
              word: 'world',
              occurrence: 1,
              occurrences: 1,
              position: 1
            }]
        },
        alignments: [
          {
            sourceNgram: [],
            targetNgram: [1]
          }]
      }
    }
  };
  const action = {
    type: types.ALIGN_TARGET_TOKEN,
    chapter: 1,
    verse: 1,
    index: 0,
    token: new Token({
      text: 'hello',
      position: 0,
      occurrence: 1,
      occurrences: 1
    })
  };
  const stateAfter = {
    '1': {
      '1': {
        source: {
          tokens: []
        },
        target: {
          tokens: [
            {
              word: 'hello',
              occurrence: 1,
              occurrences: 1,
              position: 0
            },
            {
              word: 'world',
              occurrence: 1,
              occurrences: 1,
              position: 1
            }]
        },
        alignments: []
      }
    }
  };
  reducerTest('Add Alignment', alignments, stateBefore, action,
    stateAfter);
});

describe('align target token', () => {
  const stateBefore = {
    '1': {
      '1': {
        source: {
          tokens: [
            {
              text: 'olleh',
              occurrence: 1,
              occurrences: 1,
              position: 0
            }]
        },
        target: {
          tokens: [
            {
              text: 'hello',
              occurrence: 1,
              occurrences: 1,
              position: 0
            },
            {
              text: 'world',
              occurrence: 1,
              occurrences: 1,
              position: 1
            }]
        },
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: [1]
          }]
      }
    }
  };
  const action = {
    type: types.ALIGN_TARGET_TOKEN,
    chapter: 1,
    verse: 1,
    index: 0,
    token: new Token({
      text: 'hello',
      position: 0,
      occurrence: 1,
      occurrences: 1
    })
  };
  const stateAfter = {
    '1': {
      '1': {
        source: {
          tokens: [
            {
              text: 'olleh',
              occurrence: 1,
              occurrences: 1,
              position: 0
            }]
        },
        target: {
          tokens: [
            {
              text: 'hello',
              occurrence: 1,
              occurrences: 1,
              position: 0
            },
            {
              text: 'world',
              occurrence: 1,
              occurrences: 1,
              position: 1
            }]
        },
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: [0, 1]
          }]
      }
    }
  };
  reducerTest('Add Alignment', alignments, stateBefore, action,
    stateAfter);
});

describe('align target token from second alignment', () => {
  const stateBefore = {
    '1': {
      '1': {
        source: {
          tokens: [
            {
              text: 'olleh',
              occurrence: 1,
              occurrences: 1,
              position: 0
            },
            {
              text: 'dlrow',
              occurrence: 1,
              occurrences: 1,
              position: 1
            }]
        },
        target: {
          tokens: [
            {
              text: 'hello',
              occurrence: 1,
              occurrences: 1,
              position: 0
            },
            {
              text: 'world',
              occurrence: 1,
              occurrences: 1,
              position: 1
            }]
        },
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: [0]
          },
          {
            sourceNgram: [1],
            targetNgram: []
          }]
      }
    }
  };
  const action = {
    type: types.ALIGN_TARGET_TOKEN,
    chapter: 1,
    verse: 1,
    index: 1,
    token: new Token({
      text: 'world',
      position: 1,
      occurrence: 1,
      occurrences: 1
    })
  };
  const stateAfter = {
    '1': {
      '1': {
        source: {
          tokens: [
            {
              text: 'olleh',
              occurrence: 1,
              occurrences: 1,
              position: 0
            },
            {
              text: 'dlrow',
              occurrence: 1,
              occurrences: 1,
              position: 1
            }]
        },
        target: {
          tokens: [
            {
              text: 'hello',
              occurrence: 1,
              occurrences: 1,
              position: 0
            },
            {
              text: 'world',
              occurrence: 1,
              occurrences: 1,
              position: 1
            }]
        },
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: [0]
          },
          {
            sourceNgram: [1],
            targetNgram: [1]
          }]
      }
    }
  };
  reducerTest('Add Alignment', alignments, stateBefore, action,
    stateAfter);
});

describe('insert source token', () => {
  const stateBefore = {
    '1': {
      '1': {
        source: {
          tokens: [
            {
              text: 'olleh',
              occurrence: 1,
              occurrences: 1,
              position: 0
            },
            {
              text: 'dlrow',
              occurrence: 1,
              occurrences: 1,
              position: 1
            }]
        },
        target: {
          tokens: []
        },
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: []
          }]
      }
    }
  };
  const action = {
    type: types.INSERT_ALIGNMENT,
    chapter: 1,
    verse: 1,
    token: new Token({
      text: 'dlrow',
      occurrence: 1,
      occurrences: 1,
      position: 1,
      strong: 'strong',
      morph: 'morph',
      lemma: 'lemma'
    })
  };
  const stateAfter = {
    '1': {
      '1': {
        source: {
          tokens: [
            {
              text: 'olleh',
              occurrence: 1,
              occurrences: 1,
              position: 0
            },
            {
              text: 'dlrow',
              occurrence: 1,
              occurrences: 1,
              position: 1
            }]
        },
        target: {
          tokens: []
        },
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: []
          },
          {
            sourceNgram: [1],
            targetNgram: []
          }]
      }
    }
  };
  reducerTest('Insert Alignment', alignments, stateBefore, action,
    stateAfter);
});

describe('align source token', () => {
  const stateBefore = {
    '1': {
      '1': {
        source: {
          tokens: [
            {
              text: 'olleh',
              occurrence: 1,
              occurrences: 1,
              position: 0
            },
            {
              text: 'dlrow',
              occurrence: 1,
              occurrences: 1,
              position: 1
            },
            {
              text: 'ih',
              occurrence: 1,
              occurrences: 1,
              position: 2
            }]
        },
        target: {
          tokens: []
        },
        alignments: [
          {
            sourceNgram: [2, 1],
            targetNgram: []
          }]
      }
    }
  };
  const action = {
    type: types.ALIGN_SOURCE_TOKEN,
    chapter: 1,
    verse: 1,
    index: 0,
    token: new Token({
      text: 'olleh',
      occurrence: 1,
      occurrences: 1,
      position: 0,
      strong: 'strong',
      morph: 'morph',
      lemma: 'lemma'
    })
  };
  const stateAfter = {
    '1': {
      '1': {
        source: {
          tokens: [
            {
              text: 'olleh',
              occurrence: 1,
              occurrences: 1,
              position: 0
            },
            {
              text: 'dlrow',
              occurrence: 1,
              occurrences: 1,
              position: 1
            },
            {
              text: 'ih',
              occurrence: 1,
              occurrences: 1,
              position: 2
            }]
        },
        target: {
          tokens: []
        },
        alignments: [
          {
            sourceNgram: [0, 1, 2],
            targetNgram: []
          }]
      }
    }
  };
  reducerTest('Add Alignment', alignments, stateBefore, action,
    stateAfter);
});

describe('remove target token alignment', () => {
  const stateBefore = {
    '1': {
      '1': {
        source: {
          tokens: [
            {
              text: 'hello',
              occurrence: 1,
              occurrences: 1,
              position: 0
            }]
        },
        target: {
          tokens: [
            {
              text: 'olleh',
              occurrence: 1,
              occurrences: 1,
              position: 0
            },
            {
              text: 'dlrow',
              occurrence: 1,
              occurrences: 1,
              position: 1
            }]
        },
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: [1]
          }]
      }
    }
  };
  const action = {
    type: types.UNALIGN_TARGET_TOKEN,
    chapter: 1,
    verse: 1,
    index: 0,
    token: new Token({
      text: 'dlrow',
      occurrence: 1,
      occurrences: 1,
      position: 1
    })
  };
  const stateAfter = {
    '1': {
      '1': {
        source: {
          tokens: [
            {
              text: 'hello',
              occurrence: 1,
              occurrences: 1,
              position: 0
            }]
        },
        target: {
          tokens: [
            {
              text: 'olleh',
              occurrence: 1,
              occurrences: 1,
              position: 0
            },
            {
              text: 'dlrow',
              occurrence: 1,
              occurrences: 1,
              position: 1
            }]
        },
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: []
          }]
      }
    }
  };
  reducerTest('Remove Alignment', alignments, stateBefore, action, stateAfter);
});

describe('remove source token alignment', () => {
  const stateBefore = {
    '1': {
      '1': {
        source: {
          tokens: [
            {
              text: 'olleh',
              occurrence: 1,
              occurrences: 1,
              position: 0
            },
            {
              text: 'dlrow',
              occurrence: 1,
              occurrences: 1,
              position: 1
            }]
        },
        target: {
          tokens: []
        },
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: []
          }]
      }
    }
  };
  const action = {
    type: types.UNALIGN_SOURCE_TOKEN,
    chapter: 1,
    verse: 1,
    index: 0,
    token: new Token({
      text: 'olleh',
      occurrence: 1,
      occurrences: 1,
      position: 0
    })
  };
  const stateAfter = {
    '1': {
      '1': {
        source: {
          tokens: [
            {
              text: 'olleh',
              occurrence: 1,
              occurrences: 1,
              position: 0
            },
            {
              text: 'dlrow',
              occurrence: 1,
              occurrences: 1,
              position: 1
            }]
        },
        target: {
          tokens: []
        },
        alignments: []
      }
    }
  };
  reducerTest('Remove Alignment', alignments, stateBefore, action,
    stateAfter);
});

describe('set chapter alignments', () => {
  const stateBefore = {
    '1': {
      '1': {
        source: {},
        target: {
          tokens: [
            {
              text: 'world',
              position: 0,
              occurrence: 1,
              occurrences: 1
            }]
        },
        alignments: [
          {
            primaryNgram: [],
            secondaryNgram: [0]
          }
        ]
      }
    }
  };
  const action = {
    type: types.SET_CHAPTER_ALIGNMENTS,
    chapter: 1,
    alignments: {
      '1': {
        sourceTokens: [],
        targetTokens: [],
        alignments: []
      },
      '2': {
        sourceTokens: [],
        targetTokens: [
          {
            text: 'hello',
            position: 0,
            occurrence: 1,
            occurrences: 1
          }, {
            text: 'world',
            position: 1,
            occurrence: 1,
            occurrences: 1
          }],
        alignments: [
          {
            sourceNgram: [],
            targetNgram: [1]
          }
        ]
      }
    }
  };
  const stateAfter = {
    '1': {
      '1': {
        source: {
          text: '',
          tokens: []
        },
        target: {
          text: '',
          tokens: []
        },
        alignments: []
      },
      '2': {
        source: {
          text: '',
          tokens: []
        },
        target: {
          text: 'hello world',
          tokens: [
            {
              text: 'hello',
              position: 0,
              occurrence: 1,
              occurrences: 1
            }, {
              text: 'world',
              position: 1,
              occurrence: 1,
              occurrences: 1
            }
          ]
        },
        alignments: [
          {
            sourceNgram: [],
            targetNgram: [1]
          }
        ]
      }
    }
  };
  reducerTest('Set Chapter Alignments', alignments, stateBefore, action,
    stateAfter);
});

describe('selectors', () => {
  it('returns the verse alignments', () => {
    const state = {
      '1': {
        '1': {
          source: {
            tokens: [
              {
                text: 'hello',
                occurrence: 1,
                occurrences: 1,
                position: 0
              }]
          },
          target: {
            tokens: [
              {
                text: 'world',
                occurrence: 1,
                occurrences: 1,
                position: 0
              }]
          },
          alignments: [
            {
              sourceNgram: [0],
              targetNgram: [0]
            }
          ]
        }
      }
    };
    const alignments = fromAlignments.getVerseAlignments(state, 1, 1);
    expect(JSON.parse(JSON.stringify(alignments))).toEqual([
      {
        sourceNgram: [
          {
            text: 'hello',
            occurrence: 1,
            occurrences: 1,
            index: 0
          }],
        targetNgram: [
          {
            text: 'world',
            occurrence: 1,
            occurrences: 1,
            index: 0
          }]
      }]);

    const chapterAlignments = fromAlignments.getChapterAlignments(state, 1);
    expect(JSON.parse(JSON.stringify(chapterAlignments))).toEqual({
      '1': [
        {
          sourceNgram: [
            {
              text: 'hello',
              occurrence: 1,
              occurrences: 1,
              index: 0
            }],
          targetNgram: [
            {
              text: 'world',
              occurrence: 1,
              occurrences: 1,
              index: 0
            }]
        }]
    });

    const alignedTargetTokens = fromAlignments.getAlignedVerseTokens(state, 1,
      1);
    expect(JSON.parse(JSON.stringify(alignedTargetTokens))).toEqual([
      {
        text: 'world',
        occurrence: 1,
        occurrences: 1,
        index: 0
      }]);
  });
});
