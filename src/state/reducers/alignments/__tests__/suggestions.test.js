import {Token} from 'wordmap-lexer';
import * as types from '../../../actions/actionTypes';
import alignments from '../index';
import {reducerTest} from './alignments.test';

describe('set alignment suggestions', () => {
  const stateBefore = {
    '1': {
      '1': {
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
            position: 1
          }
        ],
        targetTokens: [
          {
            text: 'olleh',
            occurrence: 1,
            occurrences: 1,
            position: 0
          }
        ],
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
        suggestions: [
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
            suggestion: 0,
            alignments: [0],
            sourceNgram: [0],
            targetNgram: []
          },
          {
            suggestion: 1,
            alignments: [1],
            sourceNgram: [1],
            targetNgram: []
          }
        ]
      }
    }
  };
  const action = {
    type: types.SET_ALIGNMENT_SUGGESTIONS,
    chapter: 1,
    verse: 1,
    alignments: [
      {
        sourceNgram: [
          new Token({text: 'hello', position: 0})],
        targetNgram: [
          new Token({text: 'olleh', position: 0})]
      },
      {
        sourceNgram: [
          new Token({text: 'world', position: 1})],
        targetNgram: [
          new Token({text: 'dlrow', position: 1})]
      }
    ]
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
          },
          {
            text: 'world',
            occurrence: 1,
            occurrences: 1,
            position: 1
          }
        ],
        targetTokens: [
          {
            text: 'olleh',
            occurrence: 1,
            occurrences: 1,
            position: 0
          }
        ],
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
        suggestions: [
          {
            sourceNgram: [0],
            targetNgram: [0]
          },
          {
            sourceNgram: [1],
            targetNgram: [1]
          }
        ],
        renderedAlignments: [
          {
            suggestion: 0,
            alignments: [0],
            sourceNgram: [0],
            targetNgram: [0],
            suggestedTargetTokens: [0]
          },
          {
            suggestion: 1,
            alignments: [1],
            sourceNgram: [1],
            targetNgram: [1],
            suggestedTargetTokens: [1]
          }
        ]
      }
    }
  };
  reducerTest('Adds an alignment suggestion', alignments, stateBefore, action,
    stateAfter);
});

describe('remove token suggestion', () => {
  const stateBefore = {
    '1': {
      '1': {
        sourceTokens: [
          {
            text: 'hello',
            occurrence: 1,
            occurrences: 1,
            position: 0
          }
        ],
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
          }
        ],
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: []
          }
        ],
        renderedAlignments: [
          {
            sourceNgram: [0],
            targetNgram: [0, 1],
            alignments: [0],
            suggestion: 0,
            suggestedTargetTokens: [0, 1]
          }
        ],
        suggestions: [
          {
            sourceNgram: [0],
            targetNgram: [0, 1]
          }
        ]
      }
    }
  };
  const action = {
    type: types.REMOVE_TOKEN_SUGGESTION,
    chapter: 1,
    verse: 1,
    index: 0,
    token: new Token({text: 'hi', position: 1})
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
          }
        ],
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
          }
        ],
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: []
          }
        ],
        suggestions: [{
          sourceNgram: [0],
          targetNgram: [0]
        }],
        renderedAlignments: [
          {
            alignments: [0],
            suggestion: 0,
            sourceNgram: [0],
            targetNgram: [0],
            suggestedTargetTokens: [0]
          }
        ]
      }
    }
  };
  reducerTest('Removes a single token from a suggestion', alignments, stateBefore,
    action, stateAfter);
});

describe('accepts last token in a suggestion', () => {
  const stateBefore = {
    '1': {
      '1': {
        sourceTokens: [
          {
            text: 'hello',
            occurrence: 1,
            occurrences: 1,
            position: 0
          }
        ],
        targetTokens: [
          {
            text: 'olleh',
            occurrence: 1,
            occurrences: 1,
            position: 0
          }
        ],
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: []
          }
        ],
        renderedAlignments: [
          {
            sourceNgram: [0],
            targetNgram: [0],
            alignments: [0],
            suggestion: 0,
            suggestedTargetTokens: [0]
          }
        ],
        suggestions: [
          {
            sourceNgram: [0],
            targetNgram: [0]
          }
        ]
      }
    }
  };
  const action = {
    type: types.ACCEPT_TOKEN_SUGGESTION,
    chapter: 1,
    verse: 1,
    index: 0,
    token: new Token({text: 'olleh', position: 0})
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
          }
        ],
        targetTokens: [
          {
            text: 'olleh',
            occurrence: 1,
            occurrences: 1,
            position: 0
          }
        ],
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: [0]
          }
        ],
        suggestions: [{
          sourceNgram: [0],
          targetNgram: [0]
        }],
        renderedAlignments: [
          {
            sourceNgram: [0],
            targetNgram: [0],
            alignments: [0]
          }
        ]
      }
    }
  };
  reducerTest('Accepts a single token suggestion', alignments, stateBefore,
    action, stateAfter);
});

describe('accepts second token in a three token suggestion', () => {
  // the first token has already been accepted
  const stateBefore = {
    '1': {
      '1': {
        sourceTokens: [
          {
            text: 'hello',
            occurrence: 1,
            occurrences: 1,
            position: 0
          }
        ],
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
          },
          {
            text: 'ih',
            occurrence: 1,
            occurrences: 1,
            position: 2
          }
        ],
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: [0]
          }
        ],
        renderedAlignments: [
          {
            sourceNgram: [0],
            targetNgram: [0, 1, 2],
            alignments: [0],
            suggestion: 0,
            suggestedTargetTokens: [1, 2]
          }
        ],
        suggestions: [
          {
            sourceNgram: [0],
            targetNgram: [0, 1, 2]
          }
        ]
      }
    }
  };
  const action = {
    type: types.ACCEPT_TOKEN_SUGGESTION,
    chapter: 1,
    verse: 1,
    index: 0,
    token: new Token({text: 'dlrow', position: 1})
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
          }
        ],
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
          },
          {
            text: 'ih',
            occurrence: 1,
            occurrences: 1,
            position: 2
          }
        ],
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: [0, 1]
          }
        ],
        renderedAlignments: [
          {
            sourceNgram: [0],
            targetNgram: [0, 1, 2],
            alignments: [0],
            suggestion: 0,
            suggestedTargetTokens: [2]
          }
        ],
        suggestions: [
          {
            sourceNgram: [0],
            targetNgram: [0, 1, 2]
          }
        ]
      }
    }
  };
  reducerTest('Accepts a single token suggestion', alignments, stateBefore,
    action, stateAfter);
});

describe('accepts token suggestion', () => {
  const stateBefore = {
    '1': {
      '1': {
        sourceTokens: [
          {
            text: 'hello',
            occurrence: 1,
            occurrences: 1,
            position: 0
          }
        ],
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
          }
        ],
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: []
          }
        ],
        renderedAlignments: [
          {
            sourceNgram: [0],
            targetNgram: [0, 1],
            alignments: [0],
            suggestion: 0,
            suggestedTargetTokens: [0, 1]
          }
        ],
        suggestions: [
          {
            sourceNgram: [0],
            targetNgram: [0, 1]
          }
        ]
      }
    }
  };
  const action = {
    type: types.ACCEPT_TOKEN_SUGGESTION,
    chapter: 1,
    verse: 1,
    index: 0,
    token: new Token({text: 'hi', position: 1})
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
          }
        ],
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
          }
        ],
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: [1]
          }
        ],
        suggestions: [{
          sourceNgram: [0],
          targetNgram: [0, 1]
        }],
        renderedAlignments: [
          {
            sourceNgram: [0],
            targetNgram: [0, 1],
            alignments: [0],
            suggestion: 0,
            suggestedTargetTokens: [0]
          }
        ]
      }
    }
  };
  reducerTest('Accepts a single token suggestion', alignments, stateBefore,
    action, stateAfter);
});

describe('accepts token on a left split suggestion', () => {
  const stateBefore = {
    '1': {
      '1': {
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
            position: 1
          }
        ],
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
          }
        ],
        alignments: [
          {
            sourceNgram: [0, 1],
            targetNgram: []
          }
        ],
        renderedAlignments: [
          {
            sourceNgram: [0],
            targetNgram: [0, 1],
            alignments: [0],
            suggestion: 0,
            suggestedTargetTokens: [0, 1]
          },
          {
            sourceNgram: [1],
            targetNgram: [],
            alignments: [0],
            suggestion: 1,
            suggestedTargetTokens: []
          }
        ],
        suggestions: [
          {
            sourceNgram: [0],
            targetNgram: [0, 1]
          },
          {
            sourceNgram: [1],
            targetNgram: []
          }
        ]
      }
    }
  };
  const action = {
    type: types.ACCEPT_TOKEN_SUGGESTION,
    chapter: 1,
    verse: 1,
    index: 0,
    token: new Token({text: 'hello', position: 0, occurrence: 1, occurrences: 1})
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
          },
          {
            text: 'world',
            occurrence: 1,
            occurrences: 1,
            position: 1
          }
        ],
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
          }
        ],
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: [0]
          },
          {
            sourceNgram: [1],
            targetNgram: []
          }
        ],
        renderedAlignments: [
          {
            sourceNgram: [0],
            targetNgram: [0, 1],
            alignments: [0],
            suggestion: 0,
            suggestedTargetTokens: [1]
          },
          {
            sourceNgram: [1],
            targetNgram: [],
            alignments: [1]
          }
        ],
        suggestions: [
          {
            sourceNgram: [0],
            targetNgram: [0, 1]
          },
          {
            sourceNgram: [1],
            targetNgram: []
          }
        ]
      }
    }
  };
  reducerTest('Accepts a single token suggestion', alignments, stateBefore,
    action, stateAfter);
});

describe('accepts token on a right split suggestion', () => {
  const stateBefore = {
    '1': {
      '1': {
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
            position: 1
          }
        ],
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
          }
        ],
        alignments: [
          {
            sourceNgram: [0, 1],
            targetNgram: []
          }
        ],
        renderedAlignments: [
          {
            sourceNgram: [0],
            targetNgram: [],
            alignments: [0],
            suggestion: 0,
            suggestedTargetTokens: []
          },
          {
            sourceNgram: [1],
            targetNgram: [0, 1],
            alignments: [0],
            suggestion: 1,
            suggestedTargetTokens: [0, 1]
          }
        ],
        suggestions: [
          {
            sourceNgram: [0],
            targetNgram: []
          },
          {
            sourceNgram: [1],
            targetNgram: [0, 1]
          }
        ]
      }
    }
  };
  const action = {
    type: types.ACCEPT_TOKEN_SUGGESTION,
    chapter: 1,
    verse: 1,
    index: 1,
    token: new Token({text: 'hello', position: 0, occurrence: 1, occurrences: 1})
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
          },
          {
            text: 'world',
            occurrence: 1,
            occurrences: 1,
            position: 1
          }
        ],
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
          }
        ],
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: []
          },
          {
            sourceNgram: [1],
            targetNgram: [0]
          }
        ],
        renderedAlignments: [
          {
            sourceNgram: [0],
            targetNgram: [],
            alignments: [0]
          },
          {
            sourceNgram: [1],
            targetNgram: [0, 1],
            alignments: [1],
            suggestion: 1,
            suggestedTargetTokens: [1]
          }
        ],
        suggestions: [
          {
            sourceNgram: [0],
            targetNgram: []
          },
          {
            sourceNgram: [1],
            targetNgram: [0, 1]
          }
        ]
      }
    }
  };
  reducerTest('Accepts a single token suggestion', alignments, stateBefore,
    action, stateAfter);
});

describe('clear alignment suggestions', () => {
  const stateBefore = {
    '1': {
      '1': {
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
            position: 1
          }
        ],
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
          }
        ],
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
        suggestions: [
          {
            // alignmentIndices: [0, 1],
            sourceNgram: [0, 1],
            targetNgram: [0, 1]
          }
        ]
      }
    }
  };
  const action = {
    type: types.RESET_VERSE_ALIGNMENT_SUGGESTIONS,
    chapter: 1,
    verse: 1
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
          },
          {
            text: 'world',
            occurrence: 1,
            occurrences: 1,
            position: 1
          }
        ],
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
          }
        ],
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
  reducerTest('Resets the verse alignment suggestions', alignments, stateBefore,
    action, stateAfter);
});

describe('accept all verse suggestions', () => {
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
          }],
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: []
          }],
        renderedAlignments: [
          {
            alignments: [0],
            suggestion: 0,
            sourceNgram: [0],
            targetNgram: [0],
            suggestedTargetTokens: [0]
          }
        ],
        suggestions: [
          {
            sourceNgram: [0],
            targetNgram: [0]
          }
        ]
      }
    }
  };
  const action = {
    type: types.ACCEPT_VERSE_ALIGNMENT_SUGGESTIONS,
    chapter: 1,
    verse: 1
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
          }],
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: [0]
          }],
        renderedAlignments: [
          {
            alignments: [0],
            sourceNgram: [0],
            targetNgram: [0]
          }],
        suggestions: []
      }
    }
  };
  reducerTest('Accept suggested alignments', alignments, stateBefore, action,
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
            targetNgram: []
          },
          {
            sourceNgram: [1],
            targetNgram: []
          }],
        renderedAlignments: [
          {
            alignments: [0, 1],
            suggestion: 0,
            sourceNgram: [0, 1],
            targetNgram: [0],
            suggestedTargetTokens: [0]
          }
        ],
        suggestions: [
          {
            sourceNgram: [0, 1],
            targetNgram: [0]
          }
        ]
      }
    }
  };
  const action = {
    type: types.ALIGN_RENDERED_TARGET_TOKEN,
    chapter: 1,
    verse: 1,
    index: 0,
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
            sourceNgram: [0, 1],
            targetNgram: [0, 1]
          }],
        renderedAlignments: [
          {
            alignments: [0],
            sourceNgram: [0, 1],
            targetNgram: [0, 1]
          }],
        suggestions: [
          {
            sourceNgram: [0, 1],
            targetNgram: []
          }
        ]
      }
    }
  };
  reducerTest('Add Alignment', alignments, stateBefore, action,
    stateAfter);
});

describe('align target token to split alignment', () => {
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
            text: 'oof',
            occurrence: 1,
            occurrences: 1,
            position: 2
          },
          {
            text: 'rab',
            occurrence: 1,
            occurrences: 1,
            position: 3
          }
        ],
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
          },
          {
            text: 'foo',
            occurrence: 1,
            occurrences: 1,
            position: 2
          },
          {
            text: 'bar',
            occurrence: 1,
            occurrences: 1,
            position: 3
          }
        ],
        alignments: [
          {
            sourceNgram: [0, 1],
            targetNgram: []
          },
          {
            sourceNgram: [2],
            targetNgram: []
          }
        ],
        renderedAlignments: [
          {
            alignments: [0],
            suggestion: 0,
            sourceNgram: [0],
            targetNgram: [0],
            suggestedTargetTokens: [0]
          },
          {
            alignments: [0],
            suggestion: 1,
            sourceNgram: [1],
            targetNgram: [1],
            suggestedTargetTokens: [1]
          },
          {
            alignments: [1],
            suggestion: 2,
            sourceNgram: [2],
            targetNgram: [2],
            suggestedTargetTokens: [2]
          }
        ],
        suggestions: [
          {
            sourceNgram: [0],
            targetNgram: [0]
          },
          {
            sourceNgram: [1],
            targetNgram: [1]
          },
          {
            sourceNgram: [2],
            targetNgram: [2]
          }
        ]
      }
    }
  };
  const action = {
    type: types.ALIGN_RENDERED_TARGET_TOKEN,
    chapter: 1,
    verse: 1,
    index: 0,
    token: new Token({
      text: 'bar',
      position: 3,
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
          },
          {
            text: 'oof',
            occurrence: 1,
            occurrences: 1,
            position: 2
          },
          {
            text: 'rab',
            occurrence: 1,
            occurrences: 1,
            position: 3
          }
        ],
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
          },
          {
            text: 'foo',
            occurrence: 1,
            occurrences: 1,
            position: 2
          },
          {
            text: 'bar',
            occurrence: 1,
            occurrences: 1,
            position: 3
          }
        ],
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: [0, 3]
          },
          {
            sourceNgram: [1],
            targetNgram: []
          },
          {
            sourceNgram: [2],
            targetNgram: []
          }
        ],
        renderedAlignments: [
          {
            alignments: [0],
            sourceNgram: [0],
            targetNgram: [0, 3]
          },
          {
            alignments: [1],
            suggestion: 1,
            sourceNgram: [1],
            targetNgram: [1],
            suggestedTargetTokens: [1]
          },
          {
            alignments: [2],
            suggestion: 2,
            sourceNgram: [2],
            targetNgram: [2],
            suggestedTargetTokens: [2]
          }
        ],
        suggestions: [
          {
            sourceNgram: [0],
            targetNgram: []
          },
          {
            sourceNgram: [1],
            targetNgram: [1]
          },
          {
            sourceNgram: [2],
            targetNgram: [2]
          }
        ]
      }
    }
  };
  reducerTest('Add Alignment', alignments, stateBefore, action,
    stateAfter);
});

describe('align target token to empty split of alignment suggestion', () => {
  const stateBefore = {
    '1': {
      '1': {
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
            position: 1
          }
        ],
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
          },
        ],
        alignments: [
          {
            sourceNgram: [0, 1],
            targetNgram: []
          },
        ],
        renderedAlignments: [
          {
            alignments: [0],
            suggestion: 0,
            sourceNgram: [0],
            targetNgram: [0],
            suggestedTargetTokens: [0]
          },
          {
            alignments: [0],
            suggestion: 1,
            sourceNgram: [1],
            targetNgram: [],
            suggestedTargetTokens: []
          }
        ],
        suggestions: [
          {
            sourceNgram: [0],
            targetNgram: [0]
          },
          {
            sourceNgram: [1],
            targetNgram: []
          }
        ]
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
          }
        ],
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
          }
        ],
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: []
          },
          {
            sourceNgram: [1],
            targetNgram: [1]
          }
        ],
        renderedAlignments: [
          {
            alignments: [0],
            suggestion: 0,
            sourceNgram: [0],
            targetNgram: [0],
            suggestedTargetTokens: [0]
          },
          {
            alignments: [1],
            sourceNgram: [1],
            targetNgram: [1]
          }
        ],
        suggestions: [
          {
            sourceNgram: [0],
            targetNgram: [0]
          },
          {
            sourceNgram: [1],
            targetNgram: []
          }
        ]
      }
    }
  };
  reducerTest('Add Alignment', alignments, stateBefore, action,
    stateAfter);
});

describe('align target token to middle alignment', () => {
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
            text: 'oof',
            occurrence: 1,
            occurrences: 1,
            position: 2
          },
          {
            text: 'rab',
            occurrence: 1,
            occurrences: 1,
            position: 3
          }
        ],
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
          },
          {
            text: 'foo',
            occurrence: 1,
            occurrences: 1,
            position: 2
          },
          {
            text: 'bar',
            occurrence: 1,
            occurrences: 1,
            position: 3
          }
        ],
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: []
          },
          {
            sourceNgram: [1],
            targetNgram: []
          },
          {
            sourceNgram: [2],
            targetNgram: []
          },
          {
            sourceNgram: [3],
            targetNgram: []
          }
        ],
        renderedAlignments: [
          {
            alignments: [0],
            suggestion: 0,
            sourceNgram: [0],
            targetNgram: [0],
            suggestedTargetTokens: [0]
          },
          {
            alignments: [1, 2],
            suggestion: 1,
            sourceNgram: [1, 2],
            targetNgram: [1],
            suggestedTargetTokens: [1]
          },
          {
            alignments: [3],
            suggestion: 2,
            sourceNgram: [3],
            targetNgram: [3],
            suggestedTargetTokens: [3]
          }
        ],
        suggestions: [
          {
            sourceNgram: [0],
            targetNgram: [0]
          },
          {
            sourceNgram: [1, 2],
            targetNgram: [1]
          },
          {
            sourceNgram: [3],
            targetNgram: [3]
          }
        ]
      }
    }
  };
  const action = {
    type: types.ALIGN_RENDERED_TARGET_TOKEN,
    chapter: 1,
    verse: 1,
    index: 1,
    token: new Token({
      text: 'foo',
      position: 2,
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
          },
          {
            text: 'oof',
            occurrence: 1,
            occurrences: 1,
            position: 2
          },
          {
            text: 'rab',
            occurrence: 1,
            occurrences: 1,
            position: 3
          }
        ],
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
          },
          {
            text: 'foo',
            occurrence: 1,
            occurrences: 1,
            position: 2
          },
          {
            text: 'bar',
            occurrence: 1,
            occurrences: 1,
            position: 3
          }
        ],
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: []
          },
          {
            sourceNgram: [1, 2],
            targetNgram: [1, 2]
          },
          {
            sourceNgram: [3],
            targetNgram: []
          }
        ],
        renderedAlignments: [
          {
            alignments: [0],
            suggestion: 0,
            sourceNgram: [0],
            targetNgram: [0],
            suggestedTargetTokens: [0]
          },
          {
            alignments: [1],
            sourceNgram: [1, 2],
            targetNgram: [1, 2]
          },
          {
            alignments: [2],
            suggestion: 2,
            sourceNgram: [3],
            targetNgram: [3],
            suggestedTargetTokens: [3]
          }
        ],
        suggestions: [
          {
            sourceNgram: [0],
            targetNgram: [0]
          },
          {
            sourceNgram: [1, 2],
            targetNgram: []
          },
          {
            sourceNgram: [3],
            targetNgram: [3]
          }
        ]
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
          }],
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: []
          }],
        renderedAlignments: [
          {
            alignments: [0],
            suggestion: 0,
            sourceNgram: [0],
            targetNgram: [0],
            suggestedTargetTokens: [0]
          }],
        suggestions: [
          {
            sourceNgram: [0],
            targetNgram: [0]
          }
        ]
      }
    }
  };
  const action = {
    type: types.UNALIGN_RENDERED_TARGET_TOKEN,
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
        suggestions: [
          {
            sourceNgram: [0],
            targetNgram: []
          }
        ]
      }
    }
  };
  reducerTest('Remove Alignment', alignments, stateBefore, action,
    stateAfter);
});

describe('remove source token from merged suggestion', () => {
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
            text: 'world',
            occurrence: 1,
            occurrences: 1,
            position: 0
          }
        ],
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
            alignments: [0, 1],
            suggestion: 0,
            sourceNgram: [0, 1],
            targetNgram: [0],
            suggestedTargetTokens: [0]
          }
        ],
        suggestions: [
          {
            sourceNgram: [0, 1],
            targetNgram: [0]
          }
        ]
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
        targetTokens: [
          {
            text: 'world',
            occurrence: 1,
            occurrences: 1,
            position: 0
          }
        ],
        alignments: [
          {
            sourceNgram: [1],
            targetNgram: []
          }],
        renderedAlignments: [
          {
            alignments: [0],
            sourceNgram: [1],
            targetNgram: []
          }],
        suggestions: [
          {
            sourceNgram: [0, 1],
            targetNgram: []
          }
        ]
      }
    }
  };
  reducerTest('Remove Alignment', alignments, stateBefore, action,
    stateAfter);
});

describe('remove source token from matched merged suggestion', () => {
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
            text: 'world',
            occurrence: 1,
            occurrences: 1,
            position: 0
          }
        ],
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: []
          },
          {
            sourceNgram: [1],
            targetNgram: []
          }],
        renderedAlignments: [
          {
            alignments: [0, 1],
            suggestion: 0,
            sourceNgram: [0, 1],
            targetNgram: [0],
            suggestedTargetTokens: [0]
          }],
        suggestions: [
          {
            sourceNgram: [0, 1],
            targetNgram: [0]
          }
        ]
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
        targetTokens: [
          {
            text: 'world',
            occurrence: 1,
            occurrences: 1,
            position: 0
          }
        ],
        alignments: [
          {
            sourceNgram: [1],
            targetNgram: []
          }],
        renderedAlignments: [
          {
            alignments: [0],
            sourceNgram: [1],
            targetNgram: []
          }],
        suggestions: [
          {
            sourceNgram: [0, 1],
            targetNgram: []
          }
        ]
      }
    }
  };
  reducerTest('Remove Alignment', alignments, stateBefore, action,
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
          }
        ],
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
          }
        ],
        alignments: [
          {
            sourceNgram: [1],
            targetNgram: [1]
          }
        ],
        renderedAlignments: [
          {
            alignments: [0],
            suggestion: 1,
            sourceNgram: [1],
            targetNgram: [1]
          }
        ],
        suggestions: [
          {
            sourceNgram: [0],
            targetNgram: []
          },
          {
            sourceNgram: [1],
            targetNgram: [1]
          }
        ]
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
          }
        ],
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
          }
        ],
        alignments: [
          {
            sourceNgram: [0, 1],
            targetNgram: [1]
          }
        ],
        renderedAlignments: [
          {
            alignments: [0],
            sourceNgram: [0, 1],
            targetNgram: [1]
          }],
        suggestions: [
          {
            sourceNgram: [0],
            targetNgram: []
          },
          {
            sourceNgram: [1],
            targetNgram: []
          }
        ]
      }
    }
  };
  reducerTest('Add Alignment', alignments, stateBefore, action,
    stateAfter);
});
