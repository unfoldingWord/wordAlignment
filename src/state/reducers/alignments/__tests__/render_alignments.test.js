import _ from 'lodash';
import render, {
  indexAlignmentSuggestions,
  indexSuggestionAlignments,
  indexTokens
} from '../render';

describe('alignment suggestions index', () => {
  it('indexes alignments', () => {
    const tokenIndex = {
      source: [
        {
          alignment: 0,
          suggestions: [0]
        },
        {
          alignment: 0,
          suggestions: [1]
        },
        {
          alignment: 1,
          suggestions: [1]
        }
      ],
      target: [
        {
          alignment: null,
          suggestions: [0]
        },
        {
          alignment: null,
          suggestions: [1]
        }
      ]
    };
    const result = indexAlignmentSuggestions(tokenIndex);
    expect(result).toEqual({
      0: [0, 1],
      1: [1]
    });
  });
});

describe('suggestion alignments index', () => {
  it('indexes suggestions', () => {
    const alignmentIndex = {
      0: [0, 1],
      1: [1]
    };
    const result = indexSuggestionAlignments(alignmentIndex);
    expect(result).toEqual({
      0: [0],
      1: [0, 1]
    });
  });
});

describe('token index', () => {
  it('indexes a merge', () => {
    const alignments = [
      {sourceNgram: [0], targetNgram: []},
      {sourceNgram: [1], targetNgram: []}
    ];
    const suggestions = [
      {sourceNgram: [0, 1], targetNgram: [0]}
    ];
    const result = indexTokens(alignments, suggestions);
    expect(result).toEqual({
      source: [
        {
          alignment: 0,
          suggestions: [0]
        },
        {
          alignment: 1,
          suggestions: [0]
        }
      ],
      target: [
        {
          alignment: null,
          suggestions: [0]
        }
      ]
    });
  });

  it('indexes a split', () => {
    const alignments = [
      {sourceNgram: [0, 1], targetNgram: []}
    ];
    const suggestions = [
      {sourceNgram: [0], targetNgram: [0]},
      {sourceNgram: [1], targetNgram: [1]}
    ];
    const result = indexTokens(alignments, suggestions);
    expect(result).toEqual({
      source: [
        {
          alignment: 0,
          suggestions: [0]
        },
        {
          alignment: 0,
          suggestions: [1]
        }
      ],
      target: [
        {
          alignment: null,
          suggestions: [0]
        },
        {
          alignment: null,
          suggestions: [1]
        }
      ]
    });
  });

  it('indexes a duplicate addition', () => {
    const alignments = [
      {sourceNgram: [0], targetNgram: [0]},
      {sourceNgram: [1], targetNgram: []}
    ];
    const suggestions = [
      {sourceNgram: [0], targetNgram: [0]},
      {sourceNgram: [1], targetNgram: [0]}
    ];
    const result = indexTokens(alignments, suggestions);
    expect(result).toEqual({
      source: [
        {
          alignment: 0,
          suggestions: [0]
        },
        {
          alignment: 1,
          suggestions: [1]
        }
      ],
      target: [
        {
          alignment: 0,
          suggestions: [0, 1]
        }
      ]
    });
  });
});

describe('render alignments', () => {
  const testRenderer = state => render(state.alignments, state.suggestions,
    state.sourceTokens.length);

  describe('matches', () => {

    it('has an empty suggestion that matches perfectly', () => {
      const state = {
        sourceTokens: [{}],
        targetTokens: [{}],
        alignments: [
          {sourceNgram: [0], targetNgram: []}
        ],
        suggestions: [{sourceNgram: [0], targetNgram: []}]
      };
      const result = testRenderer(state);
      expect(cleanOutSort(result)).toEqual([
        {alignments: [0], sourceNgram: [0], targetNgram: []}
      ]);
    });

    it('matches an aligned alignment', () => {
      const state = {
        sourceTokens: [{}, {}],
        targetTokens: [{}, {}],
        alignments: [
          {sourceNgram: [0, 1], targetNgram: [0]}
        ],
        suggestions: [
          {sourceNgram: [0, 1], targetNgram: [0, 1]}
        ]
      };
      const result = testRenderer(state);
      expect(cleanOutSort(result)).toEqual([
        {
          alignments: [0],
          suggestion: 0,
          sourceNgram: [0, 1],
          targetNgram: [0, 1],
          suggestedTargetTokens: [1]
        }
      ]);
    });

    it('matches an un-aligned alignment', () => {
      const state = {
        sourceTokens: [{}, {}],
        targetTokens: [{}, {}],
        alignments: [
          {sourceNgram: [0, 1], targetNgram: []}
        ],
        suggestions: [
          {sourceNgram: [0, 1], targetNgram: [0, 1]}
        ]
      };
      const result = testRenderer(state);
      expect(cleanOutSort(result)).toEqual([
        {
          alignments: [0],
          suggestion: 0,
          sourceNgram: [0, 1],
          targetNgram: [0, 1],
          suggestedTargetTokens: [0, 1]
        }
      ]);
    });

    it('does not match an aligned alignment', () => {
      const state = {
        sourceTokens: [{}, {}],
        targetTokens: [{}, {}],
        alignments: [
          {sourceNgram: [0, 1], targetNgram: [0]}
        ],
        suggestions: [
          {sourceNgram: [0], targetNgram: [0]},
          {sourceNgram: [1], targetNgram: [1]}
        ]
      };
      const result = testRenderer(state);
      expect(cleanOutSort(result)).toEqual([
        {
          alignments: [0],
          sourceNgram: [0, 1],
          targetNgram: [0]
        }
      ]);
    });

    it('is not a superset of an aligned alignment', () => {
      const state = {
        sourceTokens: [{}, {}],
        targetTokens: [{}, {}],
        alignments: [
          {sourceNgram: [0, 1], targetNgram: [0]}
        ],
        suggestions: [
          {sourceNgram: [0, 1], targetNgram: [1]}
        ]
      };
      const result = testRenderer(state);
      expect(cleanOutSort(result)).toEqual([
        {
          alignments: [0],
          sourceNgram: [0, 1],
          targetNgram: [0]
        }
      ]);
    });

    it('matches an aligned alignment perfectly', () => {
      const state = {
        sourceTokens: [{}, {}],
        targetTokens: [{}, {}],
        alignments: [
          {sourceNgram: [0, 1], targetNgram: [0]}
        ],
        suggestions: [
          {sourceNgram: [0, 1], targetNgram: [0]}
        ]
      };
      const result = testRenderer(state);
      expect(cleanOutSort(result)).toEqual([
        {
          alignments: [0],
          sourceNgram: [0, 1],
          targetNgram: [0]
        }
      ]);
    });

    it('matches an aligned alignment perfectly but with extra target tokens',
      () => {
        const state = {
          sourceTokens: [{}, {}],
          targetTokens: [{}, {}],
          alignments: [
            {sourceNgram: [0, 1], targetNgram: [0]}
          ],
          suggestions: [
            {sourceNgram: [0, 1], targetNgram: [0, 1]}
          ]
        };
        const result = testRenderer(state);
        expect(cleanOutSort(result)).toEqual([
          {
            alignments: [0],
            suggestion: 0,
            sourceNgram: [0, 1],
            targetNgram: [0, 1],
            suggestedTargetTokens: [1]
          }
        ]);
      });

    it('matches an aligned alignment perfectly with partial coverage', () => {
      const state = {
        sourceTokens: [{}],
        targetTokens: [{}, {}],
        alignments: [
          {sourceNgram: [0], targetNgram: [0, 1]}
        ],
        suggestions: [
          {sourceNgram: [0], targetNgram: [0]}
        ]
      };
      const result = testRenderer(state);
      expect(cleanOutSort(result)).toEqual([
        {
          alignments: [0],
          sourceNgram: [0],
          targetNgram: [0, 1]
        }
      ]);
    });

    it('it should handle discontiguous alignments', () => {
      const state = {
        sourceTokens: Array(7).fill(0),
        alignments: [
          {
            "sourceNgram": [
              0
            ],
            "targetNgram": [
              0
            ]
          },
          {
            "sourceNgram": [
              1
            ],
            "targetNgram": [
              1,
              2
            ]
          },
          {
            "sourceNgram": [
              2
            ],
            "targetNgram": [
              3,
              4
            ]
          },
          {
            "sourceNgram": [
              3,
              5
            ],
            "targetNgram": []
          },
          {
            "sourceNgram": [
              4
            ],
            "targetNgram": []
          },
          {
            "sourceNgram": [
              6
            ],
            "targetNgram": [
              10
            ]
          }
        ],
        suggestions: [
          {
            "sourceNgram": [
              0
            ],
            "targetNgram": []
          },
          {
            "sourceNgram": [
              1
            ],
            "targetNgram": []
          },
          {
            "sourceNgram": [
              2
            ],
            "targetNgram": [
              4
            ]
          },
          {
            "sourceNgram": [
              3
            ],
            "targetNgram": []
          },
          {
            "sourceNgram": [
              4
            ],
            "targetNgram": []
          },
          {
            "sourceNgram": [
              5
            ],
            "targetNgram": [
              9
            ]
          },
          {
            "sourceNgram": [
              6
            ],
            "targetNgram": [
              10
            ]
          }
        ]
      };
      const result = testRenderer(state);
      expect(result.length).toEqual(6);
      expect(cleanOutSort(result)).toEqual([
        {
          "alignments": [
            0
          ],
          "sourceNgram": [
            0
          ],
          "targetNgram": [
            0
          ]
        },
        {
          "alignments": [
            1
          ],
          "sourceNgram": [
            1
          ],
          "targetNgram": [
            1,
            2
          ]
        },
        {
          "alignments": [
            2
          ],
          "sourceNgram": [
            2
          ],
          "targetNgram": [
            3,
            4
          ]
        },
        {
          "alignments": [
            3
          ],
          "sourceNgram": [
            3, 5
          ],
          "targetNgram": []
        },
        {
          "alignments": [
            4
          ],
          "sourceNgram": [
            4
          ],
          "targetNgram": []
        },
        {
          "alignments": [
            5
          ],
          "sourceNgram": [
            6
          ],
          "targetNgram": [
            10
          ]
        }
      ]);
    });

    it('it should handle middle unalignment', () => {
      const state = {
        sourceTokens: Array(11).fill(0),
        alignments: [
          {
            "sourceNgram": [
              0,
              1,
              2,
              4
            ],
            "targetNgram": []
          },
          {
            "sourceNgram": [
              3,
              5,
              6,
              7,
              8,
              10
            ],
            "targetNgram": []
          },
          {
            "sourceNgram": [
              9
            ],
            "targetNgram": []
          }
        ],
        suggestions: [
          {
            "sourceNgram": [
              0
            ],
            "targetNgram": []
          },
          {
            "sourceNgram": [
              1
            ],
            "targetNgram": []
          },
          {
            "sourceNgram": [
              2
            ],
            "targetNgram": []
          },
          {
            "sourceNgram": [
              3
            ],
            "targetNgram": []
          },
          {
            "sourceNgram": [
              4
            ],
            "targetNgram": []
          },
          {
            "sourceNgram": [
              5
            ],
            "targetNgram": []
          },
          {
            "sourceNgram": [
              6
            ],
            "targetNgram": []
          },
          {
            "sourceNgram": [
              7
            ],
            "targetNgram": []
          },
          {
            "sourceNgram": [
              8
            ],
            "targetNgram": []
          },
          {
            "sourceNgram": [
              9
            ],
            "targetNgram": []
          },
          {
            "sourceNgram": [
              10
            ],
            "targetNgram": []
          }
        ]
      };
      const result = testRenderer(state);
      expect(result.length).toEqual(3);
      expect(cleanOutSort(result)).toEqual([
        {
          "alignments": [
            0
          ],
          "sourceNgram": [
            0,
            1,
            2,
            4
          ],
          "targetNgram": []
        },
        {
          "alignments": [
            1
          ],
          "sourceNgram": [
            3,
            5,
            6,
            7,
            8,
            10
          ],
          "targetNgram": []
        },
        {
          "alignments": [
            2
          ],
          "sourceNgram": [
            9
          ],
          "targetNgram": []
        }
      ]);
    });
  });

  describe('merges', () => {

    it('has an empty merge suggestion that matches perfectly', () => {
      // empty merge suggestions should be ignored
      const state = {
        sourceTokens: [{}, {}],
        targetTokens: [{}, {}],
        alignments: [
          {sourceNgram: [0], targetNgram: []},
          {sourceNgram: [1], targetNgram: []}
        ],
        suggestions: [{sourceNgram: [0, 1], targetNgram: []}]
      };
      const result = testRenderer(state);
      expect(cleanOutSort(result)).toEqual([
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
      ]);
    });

    it('cannot merge an aligned alignment', () => {
      const state = {
        sourceTokens: [{}, {}],
        targetTokens: [{}, {}],
        alignments: [
          {sourceNgram: [0], targetNgram: [0]},
          {sourceNgram: [1], targetNgram: []}
        ],
        suggestions: [
          {sourceNgram: [0, 1], targetNgram: [0, 1]}
        ]
      };
      const result = testRenderer(state);
      expect(cleanOutSort(result)).toEqual([
        {
          alignments: [0],
          sourceNgram: [0],
          targetNgram: [0]
        },
        {
          alignments: [1],
          sourceNgram: [1],
          targetNgram: []
        }
      ]);
    });

    it('merges un-aligned alignments', () => {
      const state = {
        sourceTokens: [{}, {}],
        targetTokens: [{}, {}],
        alignments: [
          {sourceNgram: [0], targetNgram: []},
          {sourceNgram: [1], targetNgram: []}
        ],
        suggestions: [
          {sourceNgram: [0, 1], targetNgram: [0, 1]}
        ]
      };
      const result = testRenderer(state);
      expect(cleanOutSort(result)).toEqual([
        {
          sourceNgram: [0, 1],
          targetNgram: [0, 1],
          alignments: [0, 1],
          suggestion: 0,
          suggestedTargetTokens: [0, 1]
        }
      ]);
    });

    it('merges un-aligned alignments between aligned alignments', () => {
      const state = {
        sourceTokens: [{}, {}, {}, {}],
        targetTokens: [{}, {}, {}, {}],
        alignments: [
          {sourceNgram: [0], targetNgram: [0]},
          {sourceNgram: [1], targetNgram: []},
          {sourceNgram: [2], targetNgram: []},
          {sourceNgram: [3], targetNgram: [3]}
        ],
        suggestions: [
          {sourceNgram: [0], targetNgram: [0]},
          {sourceNgram: [1, 2], targetNgram: [1, 2]},
          {sourceNgram: [3], targetNgram: [3]}
        ]
      };
      const result = testRenderer(state);
      expect(cleanOutSort(result)).toEqual([
        {
          alignments: [0],
          sourceNgram: [0],
          targetNgram: [0]
        },
        {
          sourceNgram: [1, 2],
          targetNgram: [1, 2],
          alignments: [1, 2],
          suggestion: 1,
          suggestedTargetTokens: [1, 2]
        },
        {
          alignments: [3],
          sourceNgram: [3],
          targetNgram: [3]
        }
      ]);
    });
  });

  describe('splits', () => {

    it('has an empty split suggestion that matches perfectly', () => {
      // empty split suggestions should be ignored
      const state = {
        sourceTokens: [{}, {}],
        targetTokens: [{}, {}],
        alignments: [
          {sourceNgram: [0, 1], targetNgram: []}
        ],
        suggestions: [
          {sourceNgram: [0], targetNgram: []},
          {sourceNgram: [1], targetNgram: []}
        ]
      };
      const result = testRenderer(state);
      expect(cleanOutSort(result)).toEqual([
        {
          alignments: [0],
          sourceNgram: [0, 1],
          targetNgram: []
        }
      ]);
    });

    it('splits an un-aligned alignment', () => {
      const state = {
        sourceTokens: [{}, {}],
        targetTokens: [{}, {}],
        alignments: [
          {sourceNgram: [0, 1], targetNgram: []}
        ],
        suggestions: [
          {sourceNgram: [0], targetNgram: [0]},
          {sourceNgram: [1], targetNgram: [1]}
        ]
      };
      const result = testRenderer(state);

      // TRICKY: for now we do not allow splitting merged alignments
      expect(result).not.toEqual([
        {
          sourceNgram: [0],
          targetNgram: [0],
          alignments: [0],
          suggestion: 0,
          suggestedTargetTokens: [0]
        },
        {
          sourceNgram: [1],
          targetNgram: [1],
          alignments: [0],
          suggestion: 1,
          suggestedTargetTokens: [1]
        }
      ]);
    });

    it('splits an un-aligned alignment incompletely on the left', () => {
      const state = {
        sourceTokens: [{}, {}],
        targetTokens: [{}, {}],
        alignments: [
          {sourceNgram: [0, 1], targetNgram: []}
        ],
        suggestions: [
          {sourceNgram: [0], targetNgram: [0]},
          {sourceNgram: [1], targetNgram: []}
        ]
      };
      const result = testRenderer(state);

      // TRICKY: for now we do not allow splitting merged alignments
      expect(result).not.toEqual([
        {
          sourceNgram: [0],
          targetNgram: [0],
          alignments: [0],
          suggestion: 0,
          suggestedTargetTokens: [0]
        },
        {
          sourceNgram: [1],
          targetNgram: [],
          alignments: [0],
          suggestion: 1,
          suggestedTargetTokens: []
        }
      ]);
    });

    it('splits an un-aligned alignment incompletely on the right', () => {
      const state = {
        sourceTokens: [{}, {}],
        targetTokens: [{}, {}],
        alignments: [
          {sourceNgram: [0, 1], targetNgram: []}
        ],
        suggestions: [
          {sourceNgram: [0], targetNgram: []},
          {sourceNgram: [1], targetNgram: [1]}
        ]
      };
      const result = testRenderer(state);

      // TRICKY: for now we do nto allow splitting merged alignments
      expect(result).not.toEqual([
        {
          sourceNgram: [0],
          targetNgram: [],
          alignments: [0],
          suggestion: 0,
          suggestedTargetTokens: []
        },
        {
          sourceNgram: [1],
          targetNgram: [1],
          alignments: [0],
          suggestion: 1,
          suggestedTargetTokens: [1]
        }
      ]);
    });

    it('cannot split an aligned alignment', () => {
      const state = {
        sourceTokens: [{}, {}],
        targetTokens: [{}, {}],
        alignments: [
          {sourceNgram: [0, 1], targetNgram: [0]}
        ],
        suggestions: [
          {sourceNgram: [0], targetNgram: [0]},
          {sourceNgram: [1], targetNgram: [1]}
        ]
      };
      const result = testRenderer(state);
      expect(cleanOutSort(result)).toEqual([
        {
          alignments: [0],
          sourceNgram: [0, 1],
          targetNgram: [0]
        }
      ]);
    });
  });

  describe('corner cases', () => {

    it('has partial suggestions', () => {
      const state = {
        sourceTokens: [{}, {}, {}],
        targetTokens: [{}, {}, {}],
        alignments: [
          {sourceNgram: [0, 1], targetNgram: []},
          {sourceNgram: [2], targetNgram: [0]}
        ],
        suggestions: [
          {sourceNgram: [0], targetNgram: [0]}
        ]
      };
      expect(testRenderer.bind(state)).toThrow();
      // partial suggestions are not currently supported
    });

    it('cannot suggest a token previously used in an alignment', () => {
      // we try to trick the algorithm to use a token after it has already been used.
      const state = {
        sourceTokens: [{}, {}],
        targetTokens: [{}, {}],
        alignments: [
          {sourceNgram: [0], targetNgram: [0]},
          {sourceNgram: [1], targetNgram: []}
        ],
        suggestions: [
          {sourceNgram: [0], targetNgram: [1]},
          {sourceNgram: [1], targetNgram: [0]}
        ]
      };
      const result = testRenderer(state);
      expect(cleanOutSort(result)).toEqual([
        {
          alignments: [0],
          sourceNgram: [0],
          targetNgram: [0]
        },
        {
          alignments: [1],
          sourceNgram: [1],
          targetNgram: []
        }
      ]);
    });

    it(
      'cannot suggest an additional token that has already been used in an alignment',
      () => {
        // we try to trick the algorithm to use a token after it has already been used.
        const state = {
          sourceTokens: [{}, {}],
          targetTokens: [{}, {}, {}],
          alignments: [
            {sourceNgram: [0], targetNgram: [0]},
            {sourceNgram: [1], targetNgram: [2]}
          ],
          suggestions: [
            {sourceNgram: [0], targetNgram: [1]},
            {sourceNgram: [1], targetNgram: [2, 0]} // suggest adding 0
          ]
        };
        const result = testRenderer(state);
        expect(cleanOutSort(result)).toEqual([
          {
            alignments: [0],
            sourceNgram: [0],
            targetNgram: [0]
          },
          {
            alignments: [1],
            sourceNgram: [1],
            targetNgram: [2]
          }
        ]);
      });

    it('cannot suggest a token that will later be used in an alignment', () => {
      // we try to trick the algorithm to use a token after it has already been used.
      const state = {
        sourceTokens: [{}, {}],
        targetTokens: [{}, {}],
        alignments: [
          {sourceNgram: [0], targetNgram: []},
          {sourceNgram: [1], targetNgram: [0]}
        ],
        suggestions: [
          {sourceNgram: [0], targetNgram: [0]},
          {sourceNgram: [1], targetNgram: [1]}
        ]
      };
      const result = testRenderer(state);
      expect(cleanOutSort(result)).toEqual([
        {
          alignments: [0],
          sourceNgram: [0],
          targetNgram: []
        },
        {
          alignments: [1],
          sourceNgram: [1],
          targetNgram: [0]
        }
      ]);
    });

    it(
      'cannot suggest an additional token that will later be used in an alignment',
      () => {
        // we try to trick the algorithm to use a token after it has already been used.
        const state = {
          sourceTokens: [{}, {}],
          targetTokens: [{}, {}, {}],
          alignments: [
            {sourceNgram: [0], targetNgram: [2]},
            {sourceNgram: [1], targetNgram: [0]}
          ],
          suggestions: [
            {sourceNgram: [0], targetNgram: [0, 2]}, // suggest adding 0
            {sourceNgram: [1], targetNgram: [1]}
          ]
        };
        const result = testRenderer(state);
        expect(cleanOutSort(result)).toEqual([
          {
            alignments: [0],
            sourceNgram: [0],
            targetNgram: [2]
          },
          {
            alignments: [1],
            sourceNgram: [1],
            targetNgram: [0]
          }
        ]);
      });

    it('has no suggestions', () => {
      const state = {
        sourceTokens: [{}, {}],
        targetTokens: [{}, {}],
        alignments: [
          {sourceNgram: [0], targetNgram: []},
          {sourceNgram: [1], targetNgram: [0]}
        ],
        suggestions: []
      };
      const result = testRenderer(state);
      expect(cleanOutSort(result)).toEqual([
        {
          alignments: [0],
          sourceNgram: [0],
          targetNgram: []
        },
        {
          alignments: [1],
          sourceNgram: [1],
          targetNgram: [0]
        }
      ]);
    });
  });
});

//
// Helpers
//

/**
 * removes sort field from objects within array
 * @param array
 * @return {*}
 */
function cleanOutSort(array) {
  const cleanedArray = _.cloneDeep(array);
  if (Array.isArray(cleanedArray)) {
    for (let i = 0, l = cleanedArray.length; i < l; i++) {
      const item = cleanedArray[i];
      if (item.sort !== undefined) {
        delete item.sort;
      }
    }
  }
  return cleanedArray;
}
