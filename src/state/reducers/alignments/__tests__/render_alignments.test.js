import * as fromRenderedAlignments from '../renderedAlignments';

describe('render alignments', () => {
  const testRenderer = state =>
    fromRenderedAlignments.render(state.alignments, state.suggestions,
      state.sourceTokens.length);

  describe('matches', () => {
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

    it('has an empty suggestion that matches perfectly', () => {
      const state = {
        sourceTokens: [{}],
        targetTokens: [{}],
        alignments: [
          {sourceNgram: [0], targetNgram: []},
        ],
        suggestions: [{sourceNgram: [0], targetNgram: []}]
      };
      const result = testRenderer(state);
      expect(result).toEqual([
        {alignments: [0], sourceNgram: [0], targetNgram: []}
      ]);
    });

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

    it('cannot use a target token twice in suggestion', () => {
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
          sourceNgram: [0],
          targetNgram: [0]
        },
        {
          sourceNgram: [1],
          targetNgram: []
        }
      ]);
    });

    it('cannot use a target token twice in alignment', () => {
      // we try to trick the algorithm to use a token after it has already been used.
      const state = {
        sourceTokens: [{}, {}],
        targetTokens: [{}, {}],
        alignments: [
          {sourceNgram: [0], targetNgram: []},
          {sourceNgram: [1], targetNgram: [0]}
        ],
        suggestions: [
          {sourceNgram: [0], targetNgram: [1]},
          {sourceNgram: [1], targetNgram: [0]}
        ]
      };
      const result = testRenderer(state);
      expect(result).toEqual([
        {index: 0, position: 0, sourceNgram: [0], targetNgram: [0]},
        {index: 1, position: 1, sourceNgram: [1], targetNgram: []}
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
