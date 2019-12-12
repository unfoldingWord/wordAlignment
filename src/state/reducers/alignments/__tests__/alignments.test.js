import {Token} from 'wordmap-lexer';
import _ from "lodash";
import deepFreeze from 'deep-freeze';
import alignments, * as fromAlignments from '../index';
import * as types from '../../../actions/actionTypes';

describe('set chapter alignments when empty', () => {
  const stateBefore = {};
  const action = {
    type: types.SET_CHAPTER_ALIGNMENTS,
    chapter: 1,
    alignments: {
      '1': {
        sourceTokens: [],
        targetTokens: [],
        alignments: [],
        suggestions: []
      }
    }
  };
  const stateAfter = {
    '1': {
      '1': {
        alignments: [],
        sourceTokens: [],
        targetTokens: [],
        suggestions: [],
        renderedAlignments: []
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
        sourceTokens: [],
        targetTokens: [
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
          }],
        alignments: [
          {
            sourceNgram: [],
            targetNgram: [1]
          }],
        suggestions: [],
        renderedAlignments: [
          {
            alignments: [0],
            sourceNgram: [],
            targetNgram: [1]
          }]
      }
    }
  };
  const action = {
    type: types.ALIGN_RENDERED_TARGET_TOKEN,
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
        sourceTokens: [],
        targetTokens: [
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
          }],
        alignments: [],
        suggestions: [],
        renderedAlignments: []
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
        sourceTokens: [
          {
            text: 'olleh',
            occurrence: 1,
            occurrences: 1,
            position: 0
          }],
        targetTokens: [
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
          }],
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: [1]
          }],
        renderedAlignments: [
          {
            alignments: [0],
            sourceNgram: [0],
            targetNgram: [1]
          }],
        suggestions: []
      }
    }
  };
  const action = {
    type: types.ALIGN_RENDERED_TARGET_TOKEN,
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
        sourceTokens: [
          {
            text: 'olleh',
            occurrence: 1,
            occurrences: 1,
            position: 0
          }],
        targetTokens: [
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
          }],
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: [0, 1]
          }],
        renderedAlignments: [
          {
            alignments: [0],
            sourceNgram: [0],
            targetNgram: [0, 1]
          }],
        suggestions: []
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
        sourceTokens: [
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
          }],
        targetTokens: [
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
          }],
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: [0]
          },
          {
            sourceNgram: [1],
            targetNgram: []
          }],
        renderedAlignments: [
          {
            alignments: [0],
            sourceNgram: [0],
            targetNgram: [0]
          },
          {
            alignments: [1],
            sourceNgram: [1],
            targetNgram: []
          }],
        suggestions: []
      }
    }
  };
  const action = {
    type: types.ALIGN_RENDERED_TARGET_TOKEN,
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
        sourceTokens: [
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
          }],
        targetTokens: [
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
          }],
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: [0]
          },
          {
            sourceNgram: [1],
            targetNgram: [1]
          }],
        renderedAlignments: [
          {
            alignments: [0],
            sourceNgram: [0],
            targetNgram: [0]
          },
          {
            alignments: [1],
            sourceNgram: [1],
            targetNgram: [1]
          }],
        suggestions: []
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
        sourceTokens: [
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
          }],
        targetTokens: [],
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: []
          }
        ],
        renderedAlignments: [
          {
            alignments: [0],
            sourceNgram: [0],
            targetNgram: []
          }]
      }
    }
  };
  const action = {
    type: types.INSERT_RENDERED_ALIGNMENT,
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
        sourceTokens: [
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
          }],
        targetTokens: [],
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: []
          },
          {
            sourceNgram: [1],
            targetNgram: []
          }
        ],
        renderedAlignments: [
          {
            alignments: [0],
            sourceNgram: [0],
            targetNgram: []
          },
          {
            alignments: [1],
            sourceNgram: [1],
            targetNgram: []
          }
        ]
      }
    }
  };
  reducerTest('Insert Alignment', alignments, stateBefore, action,
    stateAfter);
});

describe('insert alignment in the middle', () => {
  const stateBefore = {
    '1': {
      '4': {
        'sourceTokens': [
          {'text': 'τοῦ', 'position': 0, 'occurrence': 1, 'occurrences': 4},
          {'text': 'δόντος', 'position': 1, 'occurrence': 1, 'occurrences': 1},
          {'text': 'ἑαυτὸν', 'position': 2, 'occurrence': 1, 'occurrences': 1}],
        'targetTokens': [],
        'alignments': [
          {'sourceNgram': [0], 'targetNgram': []},
          {'sourceNgram': [2], 'targetNgram': []}
        ],
        'suggestions': [],
        'renderedAlignments': [
          {'sourceNgram': [0], 'targetNgram': [], 'alignments': [0]},
          {'sourceNgram': [2], 'targetNgram': [], 'alignments': [1]}
        ]
      }
    }
  };
  const action = {
    'type': types.INSERT_RENDERED_ALIGNMENT,
    'chapter': 1,
    'verse': 4,
    'token': {'text': 'ἁμαρτιῶν', 'position': 1, 'occurrence': 1, 'occurrences': 1}
  };
  const stateAfter = {
    '1': {
      '4': {
        'sourceTokens': [
          {'text': 'τοῦ', 'position': 0, 'occurrence': 1, 'occurrences': 4},
          {'text': 'δόντος', 'position': 1, 'occurrence': 1, 'occurrences': 1},
          {'text': 'ἑαυτὸν', 'position': 2, 'occurrence': 1, 'occurrences': 1}],
        'targetTokens': [],
        'alignments': [
          {'sourceNgram': [0], 'targetNgram': []},
          {'sourceNgram': [1], 'targetNgram': []},
          {'sourceNgram': [2], 'targetNgram': []}
        ],
        'suggestions': [],
        'renderedAlignments': [
          {'sourceNgram': [0], 'targetNgram': [], 'alignments': [0]},
          {'sourceNgram': [1], 'targetNgram': [], 'alignments': [1]},
          {'sourceNgram': [2], 'targetNgram': [], 'alignments': [2]}
        ]
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
        sourceTokens: [
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
          }],
        targetTokens: [],
        alignments: [
          {
            sourceNgram: [2, 1],
            targetNgram: []
          }],
        renderedAlignments: [
          {
            alignments: [0],
            sourceNgram: [2, 1],
            targetNgram: []
          }],
        suggestions: []
      }
    }
  };
  const action = {
    type: types.ALIGN_RENDERED_SOURCE_TOKEN,
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
        sourceTokens: [
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
          }],
        targetTokens: [],
        alignments: [
          {
            sourceNgram: [0, 1, 2],
            targetNgram: []
          }],
        renderedAlignments: [
          {
            alignments: [0],
            sourceNgram: [0, 1, 2],
            targetNgram: []
          }],
        suggestions: []
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
        sourceTokens: [
          {
            text: 'hello',
            occurrence: 1,
            occurrences: 1,
            position: 0
          }],
        targetTokens: [
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
          }],
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: [1]
          }],
        renderedAlignments: [
          {
            alignments: [0],
            sourceNgram: [0],
            targetNgram: [1]
          }],
        suggestions: []
      }
    }
  };
  const action = {
    type: types.UNALIGN_RENDERED_TARGET_TOKEN,
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
        sourceTokens: [
          {
            text: 'hello',
            occurrence: 1,
            occurrences: 1,
            position: 0
          }],
        targetTokens: [
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
          }],
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: []
          }],
        renderedAlignments: [
          {
            alignments: [0],
            sourceNgram: [0],
            targetNgram: []
          }],
        suggestions: []
      }
    }
  };
  reducerTest('Remove Alignment', alignments, stateBefore, action, stateAfter);
});

describe('remove source token alignment', () => {
  const stateBefore = {
    '1': {
      '1': {
        sourceTokens: [
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
          }],
        targetTokens: [],
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: []
          }],
        renderedAlignments: [
          {
            alignments: [0],
            sourceNgram: [0],
            targetNgram: []
          }],
        suggestions: []
      }
    }
  };
  const action = {
    type: types.UNALIGN_RENDERED_SOURCE_TOKEN,
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
        sourceTokens: [
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
          }],
        targetTokens: [],
        alignments: [],
        renderedAlignments: [],
        suggestions: []
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
        sourceTokens: [],
        targeTokens: [
          {
            text: 'world',
            position: 0,
            occurrence: 1,
            occurrences: 1
          }],
        alignments: [
          {
            sourceNgram: [],
            targetNgram: [0]
          }
        ],
        suggestions: []
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
        sourceTokens: [],
        targetTokens: [],
        alignments: [],
        suggestions: [],
        renderedAlignments: []
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
          }
        ],
        alignments: [
          {
            sourceNgram: [],
            targetNgram: [1]
          }
        ],
        renderedAlignments: [
          {
            alignments: [0],
            sourceNgram: [],
            targetNgram: [1]
          }
        ],
        suggestions: []
      }
    }
  };
  reducerTest('Set Chapter Alignments', alignments, stateBefore, action,
    stateAfter);
});

describe('repair alignments', () => {
  const tokensBefore = {
    sourceTokens: [
      {text: '0', position: 0},
      {text: '1', position: 1},
      {text: '2', position: 2}, // will update
      {text: '3', position: 3}, // will removed
      {text: '4', position: 4},
      {text: '5', position: 5}
    ],
    targetTokens: [
      {text: 'woh', position: 0},
      {text: 'era', position: 1},
      {text: 'uoy', position: 2}, // will update
      {text: 'yadot', position: 3} // will removed
    ]
  };
  const tokensAfter = {
    sourceTokens: [
      {
        text: '0', position: 0, occurrence: 1, occurrences: 1,
        lemma: '', morph: '', strong: ''
      },
      {
        text: '1', position: 1, occurrence: 1, occurrences: 1,
        lemma: '', morph: '', strong: ''
      },
      {
        text: '*2', position: 2, occurrence: 1, occurrences: 1,
        lemma: '', morph: '', strong: ''
      },
      {
        text: '4', position: 3, occurrence: 1, occurrences: 1,
        lemma: '', morph: '', strong: ''
      },
      {
        text: '5', position: 4, occurrence: 1, occurrences: 1,
        lemma: '', morph: '', strong: ''
      },
      {
        text: '6', position: 5, occurrence: 1, occurrences: 1,
        lemma: '', morph: '', strong: ''
      }
    ],
    targetTokens: [
      {text: 'woh', position: 0, occurrence: 1, occurrences: 1},
      {text: 'era', position: 1, occurrence: 1, occurrences: 1},
      {text: 'yeht', position: 2, occurrence: 1, occurrences: 1}
    ]
  };

  const action = {
    type: types.REPAIR_VERSE_ALIGNMENTS,
    chapter: 1,
    verse: 1,
    sourceTokens: [
      new Token({text: '0', position: 0}),
      new Token({text: '1', position: 1}),
      new Token({text: '*2', position: 2}), // updated,
      // removed one
      new Token({text: '4', position: 3}),
      new Token({text: '5', position: 4}),
      new Token({text: '6', position: 5})
    ],
    targetTokens: [
      new Token({text: 'woh', position: 0}),
      new Token({text: 'era', position: 1}),
      new Token({text: 'yeht', position: 2}) // updated
      // removed one
    ]
  };

  describe('move un-aligned target token form end of text to directly in front of first instance of an aligned word', () => {
    const stateBefore = {
      '1': {
        '1': {
          sourceTokens: [
            {text: '0', position: 0, occurrence: 1, occurrences: 2},
            {text: '1', position: 1, occurrence: 1, occurrences: 2},
            {text: '2', position: 2, occurrence: 1, occurrences: 1},
            {text: '0', position: 3, occurrence: 2, occurrences: 2},
            {text: '1', position: 4, occurrence: 2, occurrences: 2},
          ],
          targetTokens: [
            {text: '1', position: 0, occurrence: 1, occurrences: 2},
            {text: '2', position: 1, occurrence: 1, occurrences: 1},
            {text: '0', position: 2, occurrence: 1, occurrences: 2},
            {text: '1', position: 3, occurrence: 2, occurrences: 2},
            {text: '0', position: 4, occurrence: 2, occurrences: 2},
          ],
          alignments: [
            {sourceNgram: [0], targetNgram: []},
            {sourceNgram: [1], targetNgram: [0]},
            {sourceNgram: [2], targetNgram: [1]},
            {sourceNgram: [3], targetNgram: []},
            {sourceNgram: [4], targetNgram: [3]}
          ]
        }
      }
    };
    const action = {
      type: types.REPAIR_VERSE_ALIGNMENTS,
      chapter: 1,
      verse: 1,
      sourceTokens: [
        new Token({text: '0', position: 0, occurrence: 1, occurrences: 2}),
        new Token({text: '1', position: 1, occurrence: 1, occurrences: 2}),
        new Token({text: '2', position: 2, occurrence: 1, occurrences: 1}),
        new Token({text: '0', position: 3, occurrence: 2, occurrences: 2}),
        new Token({text: '1', position: 4, occurrence: 2, occurrences: 2})
      ],
      targetTokens: [
        new Token({text: '0', position: 0, occurrence: 1, occurrences: 2}), // moved to front
        new Token({text: '1', position: 1, occurrence: 1, occurrences: 2}),
        new Token({text: '2', position: 2, occurrence: 1, occurrences: 1}),
        new Token({text: '0', position: 3, occurrence: 2, occurrences: 2}),
        new Token({text: '1', position: 4, occurrence: 2, occurrences: 2})
      ]
    };
    const stateAfter = {
      '1': {
        '1': {
          sourceTokens: [
            {
              text: '0', position: 0, occurrence: 1, occurrences: 2, lemma: '',
              morph: '', strong: ''
            },
            {
              text: '1', position: 1, occurrence: 1, occurrences: 2, lemma: '',
              morph: '', strong: ''
            },
            {
              text: '2', position: 2, occurrence: 1, occurrences: 1, lemma: '',
              morph: '', strong: ''
            },
            {
              text: '0', position: 3, occurrence: 2, occurrences: 2, lemma: '',
              morph: '', strong: ''
            },
            {
              text: '1', position: 4, occurrence: 2, occurrences: 2, lemma: '',
              morph: '', strong: ''
            },
          ],
          targetTokens: [
            {text: '0', position: 0, occurrence: 1, occurrences: 2},
            {text: '1', position: 1, occurrence: 1, occurrences: 2},
            {text: '2', position: 2, occurrence: 1, occurrences: 1},
            {text: '0', position: 3, occurrence: 2, occurrences: 2},
            {text: '1', position: 4, occurrence: 2, occurrences: 2},
          ],
          alignments: [
            {sourceNgram: [0], targetNgram: []},
            {sourceNgram: [1], targetNgram: [1]},
            {sourceNgram: [2], targetNgram: [2]},
            {sourceNgram: [3], targetNgram: []},
            {sourceNgram: [4], targetNgram: [4]}
          ],
          renderedAlignments: [
            {alignments: [0], sourceNgram: [0], targetNgram: []},
            {alignments: [1], sourceNgram: [1], targetNgram: [1]},
            {alignments: [2], sourceNgram: [2], targetNgram: [2]},
            {alignments: [3], sourceNgram: [3], targetNgram: []},
            {alignments: [4], sourceNgram: [4], targetNgram: [4]}
          ],
          suggestions: []
        }
      }
    };
    reducerTest('fixes a middle alignment without breaking later alignments',
      alignments, stateBefore,
      action,
      stateAfter);
  });

  describe('delete source token from middle alignment', () => {
    const stateBefore = {
      '1': {
        '1': {
          sourceTokens: [
            {text: '0', position: 0},
            {text: '1', position: 1},
            {text: '2', position: 2}
          ],
          targetTokens: [
            {text: '0', position: 0},
            {text: '1', position: 1},
            {text: '2', position: 2}
          ],
          alignments: [
            {sourceNgram: [0], targetNgram: [0]},
            {sourceNgram: [1], targetNgram: [1]},
            {sourceNgram: [2], targetNgram: [2]}
          ]
        }
      }
    };
    const action = {
      type: types.REPAIR_VERSE_ALIGNMENTS,
      chapter: 1,
      verse: 1,
      sourceTokens: [
        new Token({text: '0', position: 0}),
        new Token({text: '2', position: 1})
      ],
      targetTokens: [
        new Token({text: '0', position: 0}),
        new Token({text: '1', position: 1}),
        new Token({text: '2', position: 2})
      ]
    };
    const stateAfter = {
      '1': {
        '1': {
          sourceTokens: [
            {
              text: '0', position: 0, occurrence: 1, occurrences: 1, lemma: '',
              morph: '', strong: ''
            },
            {
              text: '2', position: 1, occurrence: 1, occurrences: 1, lemma: '',
              morph: '', strong: ''
            }
          ],
          targetTokens: [
            {text: '0', position: 0, occurrence: 1, occurrences: 1},
            {text: '1', position: 1, occurrence: 1, occurrences: 1},
            {text: '2', position: 2, occurrence: 1, occurrences: 1}
          ],
          alignments: [
            {sourceNgram: [0], targetNgram: [0]},
            {sourceNgram: [1], targetNgram: [2]}
          ],
          renderedAlignments: [
            {alignments: [0], sourceNgram: [0], targetNgram: [0]},
            {alignments: [1], sourceNgram: [1], targetNgram: [2]}
          ],
          suggestions: []
        }
      }
    };
    reducerTest('fixes a middle alignment without breaking later alignments',
      alignments, stateBefore,
      action,
      stateAfter);
  });

  describe('edits target token from the midst of identical tokens', () => {
    const stateBefore = {
      '1': {
        '1': {
          sourceTokens: [
            {text: '0', position: 0},
            {text: '1', position: 1},
            {text: '2', position: 2}
          ],
          targetTokens: [
            {text: '0', position: 0},
            {text: '0', position: 1},
            {text: '0', position: 2}
          ],
          alignments: [
            {sourceNgram: [0], targetNgram: [0]},
            {sourceNgram: [1], targetNgram: [1]},
            {sourceNgram: [2], targetNgram: [2]}
          ]
        }
      }
    };
    const action = {
      type: types.REPAIR_VERSE_ALIGNMENTS,
      chapter: 1,
      verse: 1,
      sourceTokens: [
        new Token({text: '0', position: 0}),
        new Token({text: '1', position: 1}),
        new Token({text: '2', position: 2})
      ],
      targetTokens: [
        new Token({text: '0', position: 0, occurrence: 1, occurrences: 2}),
        new Token({text: '0*', position: 1, occurrence: 1, occurrences: 1}),
        new Token({text: '0', position: 2, occurrence: 2, occurrences: 2})
      ]
    };
    const stateAfter = {
      '1': {
        '1': {
          sourceTokens: [
            {
              text: '0', position: 0, occurrence: 1, occurrences: 1, lemma: '',
              morph: '', strong: ''
            },
            {
              text: '1', position: 1, occurrence: 1, occurrences: 1, lemma: '',
              morph: '', strong: ''
            },
            {
              text: '2', position: 2, occurrence: 1, occurrences: 1, lemma: '',
              morph: '', strong: ''
            }
          ],
          targetTokens: [
            {text: '0', position: 0, occurrence: 1, occurrences: 2},
            {text: '0*', position: 1, occurrence: 1, occurrences: 1},
            {text: '0', position: 2, occurrence: 2, occurrences: 2}
          ],
          alignments: [
            {sourceNgram: [0], targetNgram: [0]},
            {sourceNgram: [1], targetNgram: []},
            {sourceNgram: [2], targetNgram: [2]}
          ],
          renderedAlignments: [
            {alignments: [0], sourceNgram: [0], targetNgram: [0]},
            {alignments: [1], sourceNgram: [1], targetNgram: []},
            {alignments: [2], sourceNgram: [2], targetNgram: [2]}
          ],
          suggestions: []
        }
      }
    };
    reducerTest('fixes a middle alignment without breaking later alignments',
      alignments, stateBefore,
      action,
      stateAfter);
  });

  describe('delete target token from the midst of identical tokens', () => {
    const stateBefore = {
      '1': {
        '1': {
          sourceTokens: [
            {text: '0', position: 0},
            {text: '1', position: 1},
            {text: '2', position: 2}
          ],
          targetTokens: [
            {text: '0', position: 0, occurrence: 1, occurrences: 3},
            {text: '0', position: 1, occurrence: 2, occurrences: 3},
            {text: '0', position: 2, occurrence: 3, occurrences: 3}
          ],
          alignments: [
            {sourceNgram: [0], targetNgram: [0]},
            {sourceNgram: [1], targetNgram: [1]},
            {sourceNgram: [2], targetNgram: [2]}
          ]
        }
      }
    };
    const action = {
      type: types.REPAIR_VERSE_ALIGNMENTS,
      chapter: 1,
      verse: 1,
      sourceTokens: [
        new Token({text: '0', position: 0}),
        new Token({text: '1', position: 1}),
        new Token({text: '2', position: 2})
      ],
      targetTokens: [
        new Token({text: '0', position: 0, occurrence: 1, occurrences: 2}),
        new Token({text: '0', position: 1, occurrence: 2, occurrences: 2})
      ]
    };
    const stateAfter = {
      '1': {
        '1': {
          sourceTokens: [
            {
              text: '0', position: 0, occurrence: 1, occurrences: 1, lemma: '',
              morph: '', strong: ''
            },
            {
              text: '1', position: 1, occurrence: 1, occurrences: 1, lemma: '',
              morph: '', strong: ''
            },
            {
              text: '2', position: 2, occurrence: 1, occurrences: 1, lemma: '',
              morph: '', strong: ''
            }
          ],
          targetTokens: [
            {text: '0', position: 0, occurrence: 1, occurrences: 2},
            {text: '0', position: 1, occurrence: 2, occurrences: 2}
          ],
          alignments: [
            {sourceNgram: [0], targetNgram: [0]},
            {sourceNgram: [1], targetNgram: [1]},
            {sourceNgram: [2], targetNgram: []}
          ],
          renderedAlignments: [
            {alignments: [0], sourceNgram: [0], targetNgram: [0]},
            {alignments: [1], sourceNgram: [1], targetNgram: [1]},
            {alignments: [2], sourceNgram: [2], targetNgram: []}
          ],
          suggestions: []
        }
      }
    };
    reducerTest('fixes a middle alignment without breaking later alignments',
      alignments, stateBefore,
      action,
      stateAfter);
  });

  describe(
    'delete target token from the midst of identical tokens separated by other tokens',
    () => {
      const stateBefore = {
        '1': {
          '1': {
            sourceTokens: [
              {text: '0', position: 0},
              {text: '1', position: 1},
              {text: '2', position: 2}
            ],
            targetTokens: [
              {text: '0', position: 0, occurrence: 1, occurrences: 3},
              {text: '1', position: 1, occurrence: 1, occurrences: 1},
              {text: '0', position: 2, occurrence: 2, occurrences: 3},
              {text: '2', position: 3, occurrence: 1, occurrences: 1},
              {text: '0', position: 4, occurrence: 3, occurrences: 3}
            ],
            alignments: [
              {sourceNgram: [0], targetNgram: [0]},
              {sourceNgram: [1], targetNgram: [2]},
              {sourceNgram: [2], targetNgram: [4]}
            ]
          }
        }
      };
      const action = {
        type: types.REPAIR_VERSE_ALIGNMENTS,
        chapter: 1,
        verse: 1,
        sourceTokens: [
          new Token({text: '0', position: 0}),
          new Token({text: '1', position: 1}),
          new Token({text: '2', position: 2})
        ],
        targetTokens: [
          new Token({text: '0', position: 0, occurrence: 1, occurrences: 2}),
          new Token({text: '1', position: 1, occurrence: 1, occurrences: 1}),
          // deleted 0 here
          new Token({text: '2', position: 2, occurrence: 1, occurrences: 1}),
          new Token({text: '0', position: 3, occurrence: 2, occurrences: 2})
        ]
      };
      const stateAfter = {
        '1': {
          '1': {
            sourceTokens: [
              {
                text: '0',
                position: 0,
                occurrence: 1,
                occurrences: 1,
                lemma: '',
                morph: '',
                strong: ''
              },
              {
                text: '1',
                position: 1,
                occurrence: 1,
                occurrences: 1,
                lemma: '',
                morph: '',
                strong: ''
              },
              {
                text: '2',
                position: 2,
                occurrence: 1,
                occurrences: 1,
                lemma: '',
                morph: '',
                strong: ''
              }
            ],
            targetTokens: [
              {text: '0', position: 0, occurrence: 1, occurrences: 2},
              {text: '1', position: 1, occurrence: 1, occurrences: 1},
              {text: '2', position: 2, occurrence: 1, occurrences: 1},
              {text: '0', position: 3, occurrence: 2, occurrences: 2}
            ],
            alignments: [
              {sourceNgram: [0], targetNgram: [0]},
              {sourceNgram: [1], targetNgram: []},
              {sourceNgram: [2], targetNgram: [3]}
            ],
            renderedAlignments: [
              {alignments: [0], sourceNgram: [0], targetNgram: [0]},
              {alignments: [1], sourceNgram: [1], targetNgram: []},
              {alignments: [2], sourceNgram: [2], targetNgram: [3]}
            ],
            suggestions: []
          }
        }
      };
      reducerTest('fixes a middle alignment without breaking later alignments',
        alignments, stateBefore,
        action,
        stateAfter);
    });

  describe('delete target token from middle alignment', () => {
    const stateBefore = {
      '1': {
        '1': {
          sourceTokens: [
            {text: '0', position: 0},
            {text: '1', position: 1},
            {text: '2', position: 2}
          ],
          targetTokens: [
            {text: '0', position: 0},
            {text: '1', position: 1},
            {text: '2', position: 2}
          ],
          alignments: [
            {sourceNgram: [0], targetNgram: [0]},
            {sourceNgram: [1], targetNgram: [1]},
            {sourceNgram: [2], targetNgram: [2]}
          ]
        }
      }
    };
    const action = {
      type: types.REPAIR_VERSE_ALIGNMENTS,
      chapter: 1,
      verse: 1,
      sourceTokens: [
        new Token({text: '0', position: 0}),
        new Token({text: '1', position: 1}),
        new Token({text: '2', position: 2})
      ],
      targetTokens: [
        new Token({text: '0', position: 0}),
        new Token({text: '2', position: 1})
      ]
    };
    const stateAfter = {
      '1': {
        '1': {
          sourceTokens: [
            {
              text: '0', position: 0, occurrence: 1, occurrences: 1, lemma: '',
              morph: '', strong: ''
            },
            {
              text: '1', position: 1, occurrence: 1, occurrences: 1, lemma: '',
              morph: '', strong: ''
            },
            {
              text: '2', position: 2, occurrence: 1, occurrences: 1, lemma: '',
              morph: '', strong: ''
            }
          ],
          targetTokens: [
            {text: '0', position: 0, occurrence: 1, occurrences: 1},
            {text: '2', position: 1, occurrence: 1, occurrences: 1}
          ],
          alignments: [
            {sourceNgram: [0], targetNgram: [0]},
            {sourceNgram: [1], targetNgram: []},
            {sourceNgram: [2], targetNgram: [1]}
          ],
          renderedAlignments: [
            {alignments: [0], sourceNgram: [0], targetNgram: [0]},
            {alignments: [1], sourceNgram: [1], targetNgram: []},
            {alignments: [2], sourceNgram: [2], targetNgram: [1]}
          ],
          suggestions: []
        }
      }
    };
    reducerTest('fixes a middle alignment without breaking later alignments',
      alignments, stateBefore,
      action,
      stateAfter);
  });

  describe('valid alignments', () => {
    const stateBefore = {
      '1': {
        '1': {
          ...tokensBefore,
          alignments: [
            {sourceNgram: [0], targetNgram: [0]},
            {sourceNgram: [0, 1], targetNgram: [0]},
            {sourceNgram: [0], targetNgram: [0, 1]},
            {sourceNgram: [0, 1], targetNgram: [0, 1]}
          ]
        }
      }
    };
    const stateAfter = {
      '1': {
        '1': {
          ...tokensAfter,
          alignments: [
            {sourceNgram: [0], targetNgram: [0]},
            {sourceNgram: [1], targetNgram: []},
            {sourceNgram: [2], targetNgram: []},
            {sourceNgram: [3], targetNgram: []},
            {sourceNgram: [4], targetNgram: []},
            {sourceNgram: [5], targetNgram: []}
          ],
          renderedAlignments: [
            {alignments: [0], sourceNgram: [0], targetNgram: [0]},
            {alignments: [1], sourceNgram: [1], targetNgram: []},
            {alignments: [2], sourceNgram: [2], targetNgram: []},
            {alignments: [3], sourceNgram: [3], targetNgram: []},
            {alignments: [4], sourceNgram: [4], targetNgram: []},
            {alignments: [5], sourceNgram: [5], targetNgram: []}
          ],
          suggestions: []
        }
      }
    };
    reducerTest('does not repair valid alignments alignments', alignments,
      stateBefore, action,
      stateAfter);
  });

  describe('updated source token', () => {
    const stateBefore = {
      '1': {
        '1': {
          ...tokensBefore,
          alignments: [
            {sourceNgram: [2], targetNgram: [0]},
            {sourceNgram: [0, 2], targetNgram: [0]},
            {sourceNgram: [2], targetNgram: [0, 1]},
            {sourceNgram: [0, 2], targetNgram: [0, 1]}
          ]
        }
      }
    };
    const stateAfter = {
      '1': {
        '1': {
          ...tokensAfter,
          alignments: [
            {sourceNgram: [0], targetNgram: []},
            {sourceNgram: [1], targetNgram: []},
            {sourceNgram: [2], targetNgram: []},
            {sourceNgram: [3], targetNgram: []},
            {sourceNgram: [4], targetNgram: []},
            {sourceNgram: [5], targetNgram: []}
          ],
          renderedAlignments: [
            {alignments: [0], sourceNgram: [0], targetNgram: []},
            {alignments: [1], sourceNgram: [1], targetNgram: []},
            {alignments: [2], sourceNgram: [2], targetNgram: []},
            {alignments: [3], sourceNgram: [3], targetNgram: []},
            {alignments: [4], sourceNgram: [4], targetNgram: []},
            {alignments: [5], sourceNgram: [5], targetNgram: []}
          ],
          suggestions: []
        }
      }
    };
    reducerTest('repairs updated source tokens', alignments, stateBefore,
      action,
      stateAfter);
  });

  describe('deleted source token', () => {
    const stateBefore = {
      '1': {
        '1': {
          ...tokensBefore,
          alignments: [
            {sourceNgram: [3], targetNgram: [0]},
            {sourceNgram: [0, 3], targetNgram: [0]},
            {sourceNgram: [3], targetNgram: [0, 1]},
            {sourceNgram: [0, 3], targetNgram: [0, 1]},
            {sourceNgram: [1], targetNgram: []},
            {sourceNgram: [3], targetNgram: []},
            {sourceNgram: [4], targetNgram: []},
            {sourceNgram: [5], targetNgram: []}
          ]
        }
      }
    };
    const stateAfter = {
      '1': {
        '1': {
          ...tokensAfter,
          alignments: [
            {sourceNgram: [0], targetNgram: []},
            {sourceNgram: [1], targetNgram: []},
            {sourceNgram: [2], targetNgram: []},
            {sourceNgram: [3], targetNgram: []},
            {sourceNgram: [4], targetNgram: []},
            {sourceNgram: [5], targetNgram: []}
          ],
          renderedAlignments: [
            {alignments: [0], sourceNgram: [0], targetNgram: []},
            {alignments: [1], sourceNgram: [1], targetNgram: []},
            {alignments: [2], sourceNgram: [2], targetNgram: []},
            {alignments: [3], sourceNgram: [3], targetNgram: []},
            {alignments: [4], sourceNgram: [4], targetNgram: []},
            {alignments: [5], sourceNgram: [5], targetNgram: []}
          ],
          suggestions: []
        }
      }
    };
    reducerTest('repairs deleted source tokens', alignments, stateBefore,
      action,
      stateAfter);
  });

  describe('updated target token', () => {
    const stateBefore = {
      '1': {
        '1': {
          ...tokensBefore,
          alignments: [
            {targetNgram: [2], sourceNgram: [0]},
            {targetNgram: [0, 2], sourceNgram: [0]},
            {targetNgram: [2], sourceNgram: [0, 1]},
            {targetNgram: [0, 2], sourceNgram: [0, 1]}
          ]
        }
      }
    };
    const stateAfter = {
      '1': {
        '1': {
          ...tokensAfter,
          alignments: [
            {sourceNgram: [0], targetNgram: []},
            {sourceNgram: [1], targetNgram: []},
            {sourceNgram: [2], targetNgram: []},
            {sourceNgram: [3], targetNgram: []},
            {sourceNgram: [4], targetNgram: []},
            {sourceNgram: [5], targetNgram: []}
          ],
          renderedAlignments: [
            {alignments: [0], sourceNgram: [0], targetNgram: []},
            {alignments: [1], sourceNgram: [1], targetNgram: []},
            {alignments: [2], sourceNgram: [2], targetNgram: []},
            {alignments: [3], sourceNgram: [3], targetNgram: []},
            {alignments: [4], sourceNgram: [4], targetNgram: []},
            {alignments: [5], sourceNgram: [5], targetNgram: []}
          ],
          suggestions: []
        }
      }
    };
    reducerTest('repairs updated target tokens', alignments, stateBefore,
      action,
      stateAfter);
  });

  describe('deleted target token', () => {
    const stateBefore = {
      '1': {
        '1': {
          ...tokensBefore,
          alignments: [
            {targetNgram: [3], sourceNgram: [0]},
            {targetNgram: [0, 3], sourceNgram: [0]},
            {targetNgram: [3], sourceNgram: [0, 1]},
            {targetNgram: [0, 3], sourceNgram: [0, 1]}
          ]
        }
      }
    };
    const stateAfter = {
      '1': {
        '1': {
          ...tokensAfter,
          alignments: [
            {sourceNgram: [0], targetNgram: []},
            {sourceNgram: [1], targetNgram: []},
            {sourceNgram: [2], targetNgram: []},
            {sourceNgram: [3], targetNgram: []},
            {sourceNgram: [4], targetNgram: []},
            {sourceNgram: [5], targetNgram: []}
          ],
          renderedAlignments: [
            {alignments: [0], sourceNgram: [0], targetNgram: []},
            {alignments: [1], sourceNgram: [1], targetNgram: []},
            {alignments: [2], sourceNgram: [2], targetNgram: []},
            {alignments: [3], sourceNgram: [3], targetNgram: []},
            {alignments: [4], sourceNgram: [4], targetNgram: []},
            {alignments: [5], sourceNgram: [5], targetNgram: []}
          ],
          suggestions: []
        }
      }
    };
    reducerTest('repairs deleted target tokens', alignments, stateBefore,
      action,
      stateAfter);
  });

  describe('removes duplicate tokens', () => {
    const stateBefore = {
      '1': {
        '1': {
          sourceTokens: [
            {text: '0', position: 0},
            {text: '1', position: 1},
            {text: '2', position: 2}],
          targetTokens: [
            {text: '0', position: 0},
            {text: '1', position: 1},
            {text: '2', position: 2},
            {text: '3', position: 3}],
          alignments: [
            {sourceNgram: [0], targetNgram: [1, 1, 2]},
            {sourceNgram: [1], targetNgram: [0, 2]},
            {sourceNgram: [1], targetNgram: [1]},
            {sourceNgram: [1], targetNgram: []},
            {sourceNgram: [2, 2], targetNgram: [3]},
            {sourceNgram: [4], targetNgram: []},
            {sourceNgram: [5], targetNgram: []}
          ]
        }
      }
    };
    const action = {
      type: types.REPAIR_VERSE_ALIGNMENTS,
      chapter: 1,
      verse: 1,
      sourceTokens: [
        new Token({text: '0', position: 0}),
        new Token({text: '1', position: 1}),
        new Token({text: '2', position: 2})
      ],
      targetTokens: [
        new Token({text: '0', position: 0}),
        new Token({text: '1', position: 1}),
        new Token({text: '2', position: 2}),
        new Token({text: '3', position: 3})
      ]
    };
    const stateAfter = {
      '1': {
        '1': {
          sourceTokens: [
            {
              text: '0', position: 0, occurrence: 1, occurrences: 1,
              lemma: '', morph: '', strong: ''
            },
            {
              text: '1', position: 1, occurrence: 1, occurrences: 1,
              lemma: '', morph: '', strong: ''
            },
            {
              text: '2', position: 2, occurrence: 1, occurrences: 1,
              lemma: '', morph: '', strong: ''
            }
          ],
          targetTokens: [
            {text: '0', position: 0, occurrence: 1, occurrences: 1},
            {text: '1', position: 1, occurrence: 1, occurrences: 1},
            {text: '2', position: 2, occurrence: 1, occurrences: 1},
            {text: '3', position: 3, occurrence: 1, occurrences: 1}
          ],
          alignments: [
            {sourceNgram: [0], targetNgram: [1, 2]},
            {sourceNgram: [1], targetNgram: [0, 2]},
            {sourceNgram: [2], targetNgram: []}
          ],
          renderedAlignments: [
            {alignments: [0], sourceNgram: [0], targetNgram: [1, 2]},
            {alignments: [1], sourceNgram: [1], targetNgram: [0, 2]},
            {alignments: [2], sourceNgram: [2], targetNgram: []}
          ],
          suggestions: []
        }
      }
    };
    reducerTest('repairs deleted target tokens', alignments, stateBefore,
      action,
      stateAfter);
  });
});

describe('reset alignments', () => {
  const stateBefore = {
    '1': {
      '1': {
        sourceTokens: [
          {
            text: 'hello',
            position: 0,
            occurrence: 1,
            occurrences: 1
          },
          {
            text: 'world',
            position: 1,
            occurrence: 1,
            occurrences: 1
          }
        ],
        targetTokens: [
          {
            text: 'dlrow',
            position: 0,
            occurrence: 1,
            occurrences: 1
          }],
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: [0]
          }
        ]
      }
    }
  };
  const action = {
    type: types.RESET_VERSE_ALIGNMENTS,
    chapter: 1,
    verse: 1
  };
  const stateAfter = {
    '1': {
      '1': {
        sourceTokens: [
          {
            text: 'hello',
            position: 0,
            occurrence: 1,
            occurrences: 1
          },
          {
            text: 'world',
            position: 1,
            occurrence: 1,
            occurrences: 1
          }
        ],
        targetTokens: [
          {
            text: 'dlrow',
            position: 0,
            occurrence: 1,
            occurrences: 1
          }],
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: []
          },
          {
            sourceNgram: [1],
            targetNgram: []
          }],
        suggestions: [],
        renderedAlignments: [
          {
            alignments: [0],
            sourceNgram: [0],
            targetNgram: []
          },
          {
            alignments: [1],
            sourceNgram: [1],
            targetNgram: []
          }
        ]
      }
    }
  };
  reducerTest('Clear verse alignments', alignments, stateBefore, action,
    stateAfter);
});

describe('reset state', () => {
  const stateBefore = {
    '1': {
      '1': {
        sourceTokens: [
          {
            text: 'hello',
            position: 0,
            occurrence: 1,
            occurrences: 1
          }
        ],
        targetTokens: [
          {
            text: 'world',
            position: 0,
            occurrence: 1,
            occurrences: 1
          }],
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: [0]
          }
        ]
      }
    }
  };
  const action = {
    type: types.CLEAR_STATE
  };
  const stateAfter = {};
  reducerTest('Clear tool state', alignments, stateBefore, action,
    stateAfter);
});

describe('selectors', () => {
  let state = {};

  beforeEach(() => {
    state = {
      '1': {
        '1': {
          sourceTokens: [
            {
              text: 'olleh',
              occurrence: 1,
              occurrences: 1,
              position: 0
            }],
          targetTokens: [
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
            }],
          alignments: [
            {
              sourceNgram: [0],
              targetNgram: [0]
            }
          ],
          suggestions: []
        }
      }
    };
  });

  it('checks if the verse is fully aligned', () => {
    const alignedState = {
      '1': {
        '1': {
          sourceTokens: [
            {
              text: 'olleh',
              occurrence: 1,
              occurrences: 1,
              position: 0
            }],
          targetTokens: [
            {
              text: 'hello',
              occurrence: 1,
              occurrences: 1,
              position: 0
            }],
          alignments: [
            {
              sourceNgram: [0],
              targetNgram: [0]
            }
          ],
          suggestions: []
        }
      }
    };
    expect(fromAlignments.getIsVerseAligned(alignedState, 1, 1)).toEqual(true);
  });

  it('gives the legacy alignment format', () => {
    const result = fromAlignments.getLegacyChapterAlignments(state, 1);
    expect(result).
      toEqual({
        '1': {
          'alignments': [
            {
              'bottomWords': [
                {
                  'occurrence': 1,
                  'occurrences': 1,
                  'type': 'bottomWord',
                  'word': 'hello'
                }],
              'topWords': [
                {
                  'lemma': '',
                  'morph': '',
                  'occurrence': 1,
                  'occurrences': 1,
                  'strong': '',
                  'word': 'olleh'
                }]
            }],
          'wordBank': [
            {
              'occurrence': 1,
              'occurrences': 1,
              'type': 'bottomWord',
              'word': 'world'
            }]
        }
      });
  });

  it('returns alignments of the entire chapter', () => {
    const result = fromAlignments.getChapterAlignments(state, 1);
    expect(JSON.parse(JSON.stringify(result))).toEqual({
      '1': [
        {
          index: 0,
          sourceNgram: [
            {
              text: 'olleh',
              occurrence: 1,
              occurrences: 1,
              position: 0,
              index: 0
            }],
          targetNgram: [
            {
              text: 'hello',
              occurrence: 1,
              occurrences: 1,
              position: 0,
              index: 0
            }]
        }]
    });
  });

  it('returns the verse alignments', () => {
    const result = fromAlignments.getVerseAlignments(state, 1, 1);
    expect(JSON.parse(JSON.stringify(result))).toEqual([
      {
        index: 0,
        sourceNgram: [
          {
            text: 'olleh',
            occurrence: 1,
            occurrences: 1,
            position: 0,
            index: 0
          }],
        targetNgram: [
          {
            text: 'hello',
            occurrence: 1,
            occurrences: 1,
            position: 0,
            index: 0
          }]
      }]);
  });

  it('returns the aligned target tokens for the verse', () => {
    const result = fromAlignments.getVerseAlignedTargetTokens(state, 1, 1);
    expect(JSON.parse(JSON.stringify(result))).toEqual([
      {
        text: 'hello',
        occurrence: 1,
        occurrences: 1,
        position: 0,
        index: 0
      }]);
  });

  it('checks if the verse is valid (valid)', () => {
    const result = fromAlignments.getIsVerseValid(state, 1, 1, 'olleh',
      'hello world');
    expect(result).toEqual(true);
  });

  it('checks if the verse is valid (invalid)', () => {
    const result = fromAlignments.getIsVerseValid(state, 1, 1, 'foo', 'bar');
    expect(result).toEqual(false);
  });

});

describe('has rendered verse alignments', () => {

  it('has rendered suggestions', () => {
    const state = {
      1: {
        1: {
          alignments: [
            {
              sourceNgram: [0],
              targetNgram: []
            }],
          renderedAlignments: [
            {
              sourceNgram: [0],
              targetNgram: [0],
              alignments: [0]
            }]
        }
      }
    };
    expect(fromAlignments.getVerseHasRenderedSuggestions(state, 1, 1)).
      toEqual(true);
  });

  it('has no alignments', () => {
    const state = {
      1: {
        1: {
          alignments: [],
          renderedAlignments: []
        }
      }
    };
    expect(fromAlignments.getVerseHasRenderedSuggestions(state, 1, 1)).
      toEqual(false);
  });

  it('does not have rendered suggestions', () => {
    const state = {
      1: {
        1: {
          alignments: [
            {
              sourceNgram: [0],
              targetNgram: [0]
            }],
          renderedAlignments: [
            {
              sourceNgram: [0],
              targetNgram: [0],
              alignments: [0]
            }]
        }
      }
    };
    expect(fromAlignments.getVerseHasRenderedSuggestions(state, 1, 1)).
      toEqual(false);
  });

  it('has no state', () => {
    const state = {};
    expect(fromAlignments.getVerseHasRenderedSuggestions(state, 1, 1)).
      toEqual(false);
  });
});

describe('target tokens', () => {
  const stateBefore = {
    '1': {
      '1': {
        sourceTokens: [],
        targetTokens: [
          {
            text: 'woot',
            occurrence: 1,
            occurrences: 1,
            position: 0
          }],
        alignments: []
      }
    }
  };
  const action = {
    type: types.SET_TARGET_TOKENS,
    chapter: 1,
    verse: 1,
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
        position: 0
      }
    ]
  };
  const stateAfter = {
    '1': {
      '1': {
        sourceTokens: [],
        targetTokens: [
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
            position: 0
          }
        ],
        alignments: []
      }
    }
  };
  reducerTest('Sets the target tokens', alignments, stateBefore, action,
    stateAfter);
});

describe('source tokens', () => {
  const stateBefore = {
    '1': {
      '1': {
        targetTokens: [],
        sourceTokens: [
          {
            text: 'woot',
            occurrence: 1,
            occurrences: 1,
            position: 0
          }],
        alignments: []
      }
    }
  };
  const action = {
    type: types.SET_SOURCE_TOKENS,
    chapter: 1,
    verse: 1,
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
        position: 0
      }
    ]
  };
  const stateAfter = {
    '1': {
      '1': {
        targetTokens: [],
        sourceTokens: [
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
            position: 0
          }
        ],
        alignments: []
      }
    }
  };
  reducerTest('Sets the source tokens', alignments, stateBefore, action,
    stateAfter);
});

//
// Helpers
//

/**
 * runs reducerTest, but ignores sort field
 * @param {string} description
 * @param (Function} reducer
 * @param {Object} stateBefore
 * @param {Object} action
 * @param {Object} stateAfter
 */
export function reducerTest(description, reducer, stateBefore, action, stateAfter) {
  it(description, function () {
    deepFreeze(action); // protect aganst changes
    deepFreeze(stateBefore); // protect aganst changes

    const rawResults = reducer(stateBefore, action);
    const results = _.cloneDeep(rawResults);
    cleanOutSortFromObject(results);
    expect(results).toEqual(stateAfter);
  });
}

/**
 * removes sort field from objects recursively
 * @param {Object|Array} item
 */
function cleanOutSortFromObject(item) {
  if (Array.isArray(item)) {
    cleanOutSortFromArray(item);
  } else { // is object
    if (item.sort !== undefined) {
      delete item.sort;
    }
    const keys = Object.keys(item);
    for (let key of keys) {
      let element = item[key];
      const subKeys = element && Object.keys(element) || {};
      if (subKeys.length && !(typeof element === 'string')) {
        cleanOutSortFromObject(element);
      }
    }
  }
}

/**
 * removes sort field from objects within array
 * @param {Array} array
 */
function cleanOutSortFromArray(array) {
  if (Array.isArray(array)) {
    for (let i = 0, l = array.length; i < l; i++) {
      const item = array[i];
      cleanOutSortFromObject(item);
    }
  }
}
