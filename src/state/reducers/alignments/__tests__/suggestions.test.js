import {reducerTest} from 'redux-jest';
import * as types from '../../../actions/actionTypes';
import alignments from '../index';
import * as fromVerse from '../verse';
import Token from 'word-map/structures/Token';

describe('add alignment suggestion', () => {
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
        suggestions: []
      }
    }
  };
  const action = {
    type: types.ADD_ALIGNMENT_SUGGESTION,
    chapter: 1,
    verse: 1,
    alignment: {
      sourceNgram: [new Token({text: 'olleh', position: 0}), new Token({text: 'dlrow', position: 1})],
      targetNgram: [new Token({text: 'hello', position: 0}), new Token({text: 'world', position: 1})]
    }
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
  reducerTest('Adds an alignment suggestion', alignments, stateBefore, action, stateAfter);
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
        suggestions: []
      }
    }
  };
  reducerTest('Resets the verse alignment suggestions', alignments, stateBefore, action, stateAfter);
});

describe('get suggestions', () => {
  it('has no alignments', () => {
    const state = {
      sourceTokens: [{}, {}, {}],
      targetTokens: [{}, {}, {}],
      alignments: [
        {sourceNgram: [0], targetNgram: []},
        {sourceNgram: [1], targetNgram: []},
        {sourceNgram: [2], targetNgram: []},
      ],
      suggestions: [
        {sourceNgram: [0, 1], targetNgram: []},
        {sourceNgram: [2], targetNgram: []}
      ]
    };
    const result = fromVerse.getSuggestions(state);
    expect(result).toEqual([
      {sourceNgram: [0, 1], targetNgram: []},
      {sourceNgram: [2], targetNgram: []}
    ]);
  });

  it('has a match', () => {
    const state = {
      sourceTokens: [{}, {}],
      targetTokens: [{}, {}],
      alignments: [
        {sourceNgram: [0, 1], targetNgram: [0]},
      ],
      suggestions: [
        {sourceNgram: [0, 1], targetNgram: [0, 1]}
      ]
    };
    const result = fromVerse.getSuggestions(state);
    expect(result).toEqual([
      {sourceNgram: [0, 1], targetNgram: [0, 1]},
    ]);
  });

  it('spans multiple with one aligned', () => {
    const state = {
      sourceTokens: [{}, {}],
      targetTokens: [{}, {}],
      alignments: [
        {sourceNgram: [0], targetNgram: [0]},
        {sourceNgram: [1], targetNgram: []},
      ],
      suggestions: [
        {sourceNgram: [0, 1], targetNgram: [0, 1]}
      ]
    };
    const result = fromVerse.getSuggestions(state);
    expect(result).toEqual([
      {sourceNgram: [0], targetNgram: [0]},
      {sourceNgram: [1], targetNgram: []},
    ]);
  });

  it('has a prefect match', () => {
    const state = {
      sourceTokens: [{}, {}],
      targetTokens: [{}, {}],
      alignments: [
        {sourceNgram: [0, 1], targetNgram: [0]},
      ],
      suggestions: [
        {sourceNgram: [0, 1], targetNgram: [0]}
      ]
    };
    const result = fromVerse.getSuggestions(state);
    expect(result).toEqual([
      {sourceNgram: [0, 1], targetNgram: [0]},
    ]);
  });

  it('has a split alignment', () => {
    const state = {
      sourceTokens: [{}, {}, {}],
      targetTokens: [{}, {}, {}],
      alignments: [
        {sourceNgram: [0, 1], targetNgram: []},
        {sourceNgram: [2], targetNgram: []},
      ],
      suggestions: [
        {sourceNgram: [0], targetNgram: [0]},
        {sourceNgram: [1], targetNgram: [1]},
        {sourceNgram: [2], targetNgram: [2]}
      ]
    };
    const result = fromVerse.getSuggestions(state);
    expect(result).toEqual([
      {sourceNgram: [0], targetNgram: [0]},
      {sourceNgram: [1], targetNgram: [1]},
      {sourceNgram: [2], targetNgram: [2]}
    ]);
  });

  it('has a split and merged alignment', () => {
    const state = {
      sourceTokens: [{}, {}, {}],
      targetTokens: [{}, {}, {}],
      alignments: [
        {sourceNgram: [0, 1], targetNgram: []},
        {sourceNgram: [2], targetNgram: []},
      ],
      suggestions: [
        {sourceNgram: [0], targetNgram: []},
        {sourceNgram: [1, 2], targetNgram: [0]}
      ]
    };
    const result = fromVerse.getSuggestions(state);
    expect(result).toEqual([
      {sourceNgram: [0], targetNgram: []},
      {sourceNgram: [1, 2], targetNgram: [0]}
    ]);
  });

  it('has a merged alignment', () => {
    const state = {
      sourceTokens: [{}, {}, {}],
      targetTokens: [{}, {}, {}],
      alignments: [
        {sourceNgram: [0, 1], targetNgram: []},
        {sourceNgram: [2], targetNgram: []},
      ],
      suggestions: [
        {sourceNgram: [0, 1, 2], targetNgram: [0]}
      ]
    };
    const result = fromVerse.getSuggestions(state);
    expect(result).toEqual([
      {sourceNgram: [0, 1, 2], targetNgram: [0]}
    ]);
  });

  it('has partial suggestions', () => {
    const state = {
      sourceTokens: [{}, {}, {}],
      targetTokens: [{}, {}, {}],
      alignments: [
        {sourceNgram: [0, 1], targetNgram: []},
        {sourceNgram: [2], targetNgram: [0]},
      ],
      suggestions: [
        {sourceNgram: [0], targetNgram: [0]}
      ]
    };
    expect(fromVerse.getSuggestions.bind(state)).toThrow();
    // partial suggestions are not currently supported
  });

  it('has no suggestions', () => {
    const state = {
      sourceTokens: [{}, {}, {}],
      targetTokens: [{}, {}, {}],
      alignments: [
        {sourceNgram: [0], targetNgram: []},
        {sourceNgram: [1], targetNgram: []},
        {sourceNgram: [2], targetNgram: [0]},
      ],
      suggestions: []
    };
    const result = fromVerse.getSuggestions(state);
    expect(result).toEqual([
      {sourceNgram: [0], targetNgram: []},
      {sourceNgram: [1], targetNgram: []},
      {sourceNgram: [2], targetNgram: [0]},
    ]);
  });
});

// TODO: test aligning a target token to a pseudo merged source n-gram actually merges the source n-gram

// TODO: test merging a source token with a suggestion merges all source tokens in the suggestion.

// TODO: test un-merging a token in a suggestion merges all source tokens in the resulting alignments (target tokens will still be cleared).

describe('alignments with suggestions', () => {
  it('returns alignments', () => {

    // const alignments = fromVerse.getAlignmentsWithSuggestions();
  });
});

describe('alignment matches suggestion', () => {
  it('matches', () => {
    const alignment = {
      sourceNgram: [0],
      targetNgram: []
    };
    const suggestion = {
      sourceNgram: [0],
      targetNgram: []
    };
    expect(fromVerse.getAlignmentMatchesSuggestion(alignment, suggestion)).toEqual(true);
  });

  it('matches with alignments', () => {
    const alignment = {
      sourceNgram: [0],
      targetNgram: [0]
    };
    const suggestion = {
      sourceNgram: [0],
      targetNgram: []
    };
    expect(fromVerse.getAlignmentMatchesSuggestion(alignment, suggestion)).toEqual(true);
  });

  it('is a large match', () => {
    const alignment = {
      sourceNgram: [0, 1],
      targetNgram: []
    };
    const suggestion = {
      sourceNgram: [0, 1],
      targetNgram: []
    };
    expect(fromVerse.getAlignmentMatchesSuggestion(alignment, suggestion)).toEqual(true);
  });

  it('does not match', () => {
    const alignment = {
      sourceNgram: [0],
      targetNgram: []
    };
    const suggestion = {
      sourceNgram: [0, 1],
      targetNgram: []
    };
    expect(fromVerse.getAlignmentMatchesSuggestion(alignment, suggestion)).toEqual(false);
  });
});

describe('alignment subsets suggestion', () => {
  it('is a subset', () => {
    const alignment = {
      sourceNgram: [0],
      targetNgram: []
    };
    const suggestion = {
      sourceNgram: [0, 1],
      targetNgram: []
    };
    expect(fromVerse.getAlignmentSubsetsSuggestion(alignment, suggestion)).toEqual(true);
  });

  it('is a middle subset', () => {
    const alignment = {
      sourceNgram: [1],
      targetNgram: []
    };
    const suggestion = {
      sourceNgram: [0, 1, 2],
      targetNgram: []
    };
    expect(fromVerse.getAlignmentSubsetsSuggestion(alignment, suggestion)).toEqual(true);
  });

  it('is an end subset', () => {
    const alignment = {
      sourceNgram: [1],
      targetNgram: []
    };
    const suggestion = {
      sourceNgram: [0, 1],
      targetNgram: []
    };
    expect(fromVerse.getAlignmentSubsetsSuggestion(alignment, suggestion)).toEqual(true);
  });

  it('is a large subset', () => {
    const alignment = {
      sourceNgram: [1, 2],
      targetNgram: []
    };
    const suggestion = {
      sourceNgram: [0, 1, 2],
      targetNgram: []
    };
    expect(fromVerse.getAlignmentSubsetsSuggestion(alignment, suggestion)).toEqual(true);
  });

  it('is full match', () => {
    const alignment = {
      sourceNgram: [0, 1],
      targetNgram: []
    };
    const suggestion = {
      sourceNgram: [0, 1],
      targetNgram: []
    };
    expect(fromVerse.getAlignmentSubsetsSuggestion(alignment, suggestion)).toEqual(false);
  });

  it('is aligned', () => {
    const alignment = {
      sourceNgram: [1],
      targetNgram: [0]
    };
    const suggestion = {
      sourceNgram: [0, 1, 2],
      targetNgram: []
    };
    expect(fromVerse.getAlignmentSubsetsSuggestion(alignment, suggestion)).toEqual(false);
  });
});
