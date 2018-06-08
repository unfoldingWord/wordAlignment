import {compile} from '../verse';

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
});
