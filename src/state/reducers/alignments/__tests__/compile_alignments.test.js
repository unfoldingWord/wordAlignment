import compile, * as fromCompile from '../compile';

describe('compiles alignments', () => {
  it('compiles nothing', () => {
    const result = compile([], []);
    expect(result).toEqual({
      alignments: [],
      indices: {}
    });
  });

  describe('simple', () => {
    it('compiles a suggestion', () => {
      const alignments = [
        {
          sourceNgram: [0],
          targetNgram: []
        }
      ];
      const rendered = [
        {
          alignments: [0],
          suggestion: 0,
          sourceNgram: [0],
          targetNgram: [0],
          suggestedTargetTokens: [0]
        }
      ];
      const expected = {
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: []
          }
        ],
        indices: {'0': [0]}
      };
      const result = compile(rendered, alignments);
      expect(result).toEqual(expected);
    });

    it('compiles an accepted suggestion', () => {
      const alignments = [
        {
          sourceNgram: [0],
          targetNgram: []
        }
      ];
      const rendered = [
        {
          alignments: [0],
          sourceNgram: [0],
          targetNgram: [0]
        }
      ];
      const expected = {
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: [0]
          }
        ],
        indices: {'0': [0]}
      };
      const result = compile(rendered, alignments);
      expect(result).toEqual(expected);
    });

    it('compiles second accepted suggestion in group of 3', () => {
      const alignments = [
        {
          sourceNgram: [0],
          targetNgram: [0]
        }
      ];
      const rendered = [
        {
          alignments: [0],
          suggestion: 0,
          sourceNgram: [0],
          targetNgram: [0, 1, 2],
          suggestedTargetTokens: [2]
        }
      ];
      const expected = {
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: [0, 1]
          }
        ],
        indices: {'0': [0]}
      };
      const result = compile(rendered, alignments);
      expect(result).toEqual(expected);
    });
  });

  describe('merge', () => {
    it('compiles a merge suggestion', () => {
      const alignments = [
        {
          sourceNgram: [0],
          targetNgram: []
        },
        {
          sourceNgram: [1],
          targetNgram: []
        }
      ];
      const rendered = [
        {
          alignments: [0, 1],
          suggestion: 0,
          sourceNgram: [0, 1],
          targetNgram: [0, 1],
          suggestedTargetTokens: [0, 1]
        }
      ];
      const expected = {
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
        indices: {'0': [0, 1]}
      };
      const result = compile(rendered, alignments);
      expect(result).toEqual(expected);
    });

    it('compiles an accepted merge suggestion', () => {
      const alignments = [
        {
          sourceNgram: [0],
          targetNgram: []
        },
        {
          sourceNgram: [1],
          targetNgram: []
        }
      ];
      const rendered = [
        {
          alignments: [0, 1],
          sourceNgram: [0, 1],
          targetNgram: [0, 1]
        }
      ];
      const expected = {
        alignments: [
          {
            sourceNgram: [0, 1],
            targetNgram: [0, 1]
          }
        ],
        indices: {'0': [0]}
      };
      const result = compile(rendered, alignments);
      expect(result).toEqual(expected);
    });
  });

  describe('split', () => {
    it('compiles a split suggestion', () => {
      const alignments = [
        {
          sourceNgram: [0, 1],
          targetNgram: []
        }
      ];
      const rendered = [
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
        }
      ];
      const expected = {
        alignments: [
          {
            sourceNgram: [0, 1],
            targetNgram: []
          }
        ],
        indices: {'0': [0], '1': [0]}
      };
      const result = compile(rendered, alignments);
      expect(result).toEqual(expected);
    });

    it('compiles a partially accepted split suggestion', () => {
      const alignments = [
        {
          sourceNgram: [0, 1],
          targetNgram: []
        }
      ];
      const rendered = [
        {
          alignments: [0],
          suggestion: 0,
          sourceNgram: [0],
          targetNgram: [0],
          suggestedTargetTokens: [0]
        },
        {
          alignments: [0],
          sourceNgram: [1],
          targetNgram: [1]
        }
      ];
      const expected = {
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
        indices: {'0': [0], '1': [1]}
      };
      const result = compile(rendered, alignments);
      expect(result).toEqual(expected);
    });

    it('compiles an accepted split suggestion', () => {
      const alignments = [
        {
          sourceNgram: [0, 1],
          targetNgram: []
        }
      ];
      const rendered = [
        {
          alignments: [0],
          sourceNgram: [0],
          targetNgram: [0]
        },
        {
          alignments: [0],
          sourceNgram: [1],
          targetNgram: [1]
        }
      ];
      const expected = {
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: [0]
          },
          {
            sourceNgram: [1],
            targetNgram: [1]
          }
        ],
        indices: {'0': [0], '1': [1]}
      };
      const result = compile(rendered, alignments);
      expect(result).toEqual(expected);
    });
  });

  describe('complex', () => {
    it(
      'compiles an un-alignment where there is an un-accepted split suggestion',
      () => {
        const alignments = [
          {'sourceNgram': [0], 'targetNgram': [1]},
          {'sourceNgram': [1], 'targetNgram': [0]},
          {'sourceNgram': [2], 'targetNgram': [2]},
          {'sourceNgram': [3], 'targetNgram': [3]},
          {'sourceNgram': [4, 5], 'targetNgram': []},
          {'sourceNgram': [6, 7], 'targetNgram': [5, 6, 7]}
        ];
        const rendered = [
          {'sourceNgram': [0], 'targetNgram': [1], 'alignments': [0]},
          {'sourceNgram': [1], 'targetNgram': [0], 'alignments': [1]},
          {'sourceNgram': [2], 'targetNgram': [2], 'alignments': [2]},
          {'sourceNgram': [3], 'targetNgram': [3], 'alignments': [3]},
          {
            'sourceNgram': [4],
            'targetNgram': [],
            'suggestedTargetTokens': [],
            'alignments': [4],
            'suggestion': 4
          },
          {
            'sourceNgram': [5],
            'targetNgram': [],
            'suggestedTargetTokens': [],
            'alignments': [4],
            'suggestion': 5
          },
          {'sourceNgram': [6, 7], 'targetNgram': [6, 7], 'alignments': [5]} // removing target 5 from alignment 6
        ];
        const expected = {
          'alignments': [
            {'sourceNgram': [0], 'targetNgram': [1]},
            {'sourceNgram': [1], 'targetNgram': [0]},
            {'sourceNgram': [2], 'targetNgram': [2]},
            {'sourceNgram': [3], 'targetNgram': [3]},
            {'sourceNgram': [4, 5], 'targetNgram': []},
            {'sourceNgram': [6, 7], 'targetNgram': [6, 7]}
          ],
          'indices': {
            '0': [0],
            '1': [1],
            '2': [2],
            '3': [3],
            '4': [4],
            '5': [4],
            '6': [5]
          }
        };
        const result = compile(rendered, alignments);
        expect(result).toEqual(expected);
      });
  });
});

describe('utility methods', () => {
  describe('has alignment target changed', () => {
    it('has a new token from the render', () => {
      const rendered = {
        targetNgram: [0, 1],
        suggestedTargetTokens: [1]
      };
      const alignment = {
        targetNgram: []
      };
      const result = fromCompile.didAlignmentTargetChange(rendered, alignment);
      expect(result).toEqual(true);
    });

    it('has a suggestion with no change', () => {
      const rendered = {
        targetNgram: [0, 1],
        suggestedTargetTokens: [1]
      };
      const alignment = {
        targetNgram: [0]
      };
      const result = fromCompile.didAlignmentTargetChange(rendered, alignment);
      expect(result).toEqual(false);
    });

    it('has no tokens in the alignment', () => {
      const rendered = {
        targetNgram: [0],
        suggestedTargetTokens: [0]
      };
      const alignment = {
        targetNgram: []
      };
      const result = fromCompile.didAlignmentTargetChange(rendered, alignment);
      expect(result).toEqual(false);
    });

    it('has no tokens at all', () => {
      const rendered = {
        targetNgram: [],
        suggestedTargetTokens: []
      };
      const alignment = {
        targetNgram: []
      };
      const result = fromCompile.didAlignmentTargetChange(rendered, alignment);
      expect(result).toEqual(false);
    });

    it('has no suggestions', () => {
      const rendered = {
        targetNgram: [0],
        suggestedTargetTokens: []
      };
      const alignment = {
        targetNgram: [0]
      };
      const result = fromCompile.didAlignmentTargetChange(rendered, alignment);
      expect(result).toEqual(false);
    });
  });
});
