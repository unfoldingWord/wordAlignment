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

    it('compiles broken stuff', () => {
      const alignments = [
        {'sourceNgram': [0], 'targetNgram': []},
        {'sourceNgram': [1], 'targetNgram': [1]},
        {'sourceNgram': [2], 'targetNgram': [2]},
        {'sourceNgram': [3], 'targetNgram': [3]},
        {'sourceNgram': [4], 'targetNgram': []},
        {'sourceNgram': [5], 'targetNgram': []},
        {'sourceNgram': [6], 'targetNgram': [4]},
        {'sourceNgram': [7], 'targetNgram': [6, 7]},
        {'sourceNgram': [8], 'targetNgram': [8, 9, 10]},
        {'sourceNgram': [9], 'targetNgram': [11]},
        {'sourceNgram': [10], 'targetNgram': [12]},
        {'sourceNgram': [11], 'targetNgram': [13]},
        {'sourceNgram': [12], 'targetNgram': [16]},
        {'sourceNgram': [13], 'targetNgram': []},
        {'sourceNgram': [14], 'targetNgram': [14]},
        {'sourceNgram': [15], 'targetNgram': [15]},
        {'sourceNgram': [16], 'targetNgram': [17, 18]},
        {'sourceNgram': [17], 'targetNgram': []},
        {'sourceNgram': [18], 'targetNgram': []},
        {'sourceNgram': [19], 'targetNgram': []},
        {'sourceNgram': [20], 'targetNgram': []},
        {'sourceNgram': [21], 'targetNgram': []},
        {'sourceNgram': [22], 'targetNgram': []},
        {'sourceNgram': [23], 'targetNgram': []}];
      const rendered = [
        {
          'alignments': [0],
          'sourceNgram': [0],
          'targetNgram': [0]
        },
        {'sourceNgram': [1], 'targetNgram': [1], 'alignments': [1]},
        {'sourceNgram': [2], 'targetNgram': [2], 'alignments': [2]},
        {'sourceNgram': [3], 'targetNgram': [3], 'alignments': [3]},
        {'alignments': [4], 'sourceNgram': [4], 'targetNgram': []},
        {'alignments': [5], 'sourceNgram': [5], 'targetNgram': []},
        {'sourceNgram': [6], 'targetNgram': [4], 'alignments': [5]},
        {'sourceNgram': [7], 'targetNgram': [6, 7], 'alignments': [6]},
        {'sourceNgram': [8], 'targetNgram': [8, 9, 10], 'alignments': [7]},
        {'sourceNgram': [9], 'targetNgram': [11], 'alignments': [8]},
        {'sourceNgram': [10], 'targetNgram': [12], 'alignments': [9]},
        {'sourceNgram': [11], 'targetNgram': [13], 'alignments': [10]},
        {'sourceNgram': [12], 'targetNgram': [16], 'alignments': [11]},
        {'sourceNgram': [13], 'targetNgram': [], 'alignments': [12]},
        {'sourceNgram': [14], 'targetNgram': [14], 'alignments': [13]},
        {'sourceNgram': [15], 'targetNgram': [15], 'alignments': [14]},
        {'sourceNgram': [16], 'targetNgram': [17, 18], 'alignments': [15]},
        {'sourceNgram': [17], 'targetNgram': [], 'alignments': [16]},
        {'sourceNgram': [18], 'targetNgram': [], 'alignments': [17]},
        {'sourceNgram': [19], 'targetNgram': [], 'alignments': [18]},
        {
          'sourceNgram': [20],
          'targetNgram': [23],
          'suggestedTargetTokens': [23],
          'alignments': [19],
          'suggestion': 20
        },
        {
          'sourceNgram': [21],
          'targetNgram': [24],
          'suggestedTargetTokens': [24],
          'alignments': [20],
          'suggestion': 21
        },
        {'sourceNgram': [22], 'targetNgram': [], 'alignments': []},
        {
          'sourceNgram': [23],
          'targetNgram': [19],
          'suggestedTargetTokens': [19],
          'alignments': [21, 22],
          'suggestion': 23
        }];
      const expected = {
        'alignments': [
          {'sourceNgram': [0], 'targetNgram': [0]},
          {'sourceNgram': [1], 'targetNgram': [1]},
          {'sourceNgram': [2], 'targetNgram': [2]},
          {'sourceNgram': [3], 'targetNgram': [3]},
          {'sourceNgram': [4], 'targetNgram': []},
          {'sourceNgram': [5], 'targetNgram': []},
          {'sourceNgram': [6], 'targetNgram': [4]},
          {'sourceNgram': [7], 'targetNgram': [6, 7]},
          {'sourceNgram': [8], 'targetNgram': [8, 9, 10]},
          {'sourceNgram': [9], 'targetNgram': [11]},
          {'sourceNgram': [10], 'targetNgram': [12]},
          {'sourceNgram': [11], 'targetNgram': [13]},
          {'sourceNgram': [12], 'targetNgram': [16]},
          {'sourceNgram': [13], 'targetNgram': []},
          {'sourceNgram': [14], 'targetNgram': [14]},
          {'sourceNgram': [15], 'targetNgram': [15]},
          {'sourceNgram': [16], 'targetNgram': [17, 18]},
          {'sourceNgram': [17], 'targetNgram': []},
          {'sourceNgram': [18], 'targetNgram': []},
          {'sourceNgram': [19], 'targetNgram': []},
          {'sourceNgram': [20], 'targetNgram': []},
          {'sourceNgram': [21], 'targetNgram': []}, // TODO: for some reason this gets sorted to the end
          {'sourceNgram': [22], 'targetNgram': []},
          {'sourceNgram': [23], 'targetNgram': []} // TODO: for some reason this is 21 instead of 23
        ],
        'indices': {
          '0': [0],
          '1': [1],
          '2': [2],
          '3': [3],
          '4': [4],
          '5': [5],
          '6': [6],
          '7': [7],
          '8': [8],
          '9': [9],
          '10': [10],
          '11': [11],
          '12': [12],
          '13': [13],
          '14': [14],
          '15': [15],
          '16': [16],
          '17': [17],
          '18': [18],
          '19': [19],
          '20': [20],
          '21': [21],
          '22': [22],
          '23': [23]
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
