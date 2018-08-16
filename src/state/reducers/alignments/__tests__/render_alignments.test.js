import render from '../render';

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
      expect(result).toEqual([
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
      expect(result).toEqual([
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
      expect(result).toEqual([
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
      expect(result).toEqual([
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
      expect(result).toEqual([
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
      expect(result).toEqual([
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
        expect(result).toEqual([
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
      expect(result).toEqual([
        {
          alignments: [0],
          sourceNgram: [0],
          targetNgram: [0, 1]
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
      expect(result).toEqual([
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
      expect(result).toEqual([
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
      expect(result).toEqual([
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
      expect(result).toEqual([
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
      expect(result).toEqual([
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
      expect(result).toEqual([
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
      expect(result).toEqual([
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
      expect(result).toEqual([
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
      expect(result).toEqual([
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
      expect(result).toEqual([
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

    it('cannot suggest an additional token that has already been used in an alignment', () => {
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
      expect(result).toEqual([
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
      expect(result).toEqual([
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

    it('cannot suggest an additional token that will later be used in an alignment', () => {
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
      expect(result).toEqual([
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
      expect(result).toEqual([
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
