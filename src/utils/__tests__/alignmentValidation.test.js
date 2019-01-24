import {areAlignmentsEquivalent} from '../alignmentValidation';

describe('Determine alignment equivalence', () => {

  it('has empty input', () => {
    const prev = [];
    const next = [];
    expect(areAlignmentsEquivalent(prev, next)).toBe(true);
  });

  it('has no change', () => {
    const prev = [];
    const next = [];
    expect(areAlignmentsEquivalent(prev, next)).toBe(true);
  });

  it('changed the target word text', () => {
    const prev = [
      {
        'sourceNgram': [
          {
            'text': 'source',
            'position': 1,
            'occurrence': 1,
            'occurrences': 1
          }
        ],
        'targetNgram': [
          {
            'text': 'target',
            'occurrence': 2,
            'occurrences': 2,
            'position': 2
          }
        ]
      }
    ];
    const next = [
      {
        'sourceNgram': [
          {
            'text': 'source',
            'position': 1,
            'occurrence': 1,
            'occurrences': 1
          }
        ],
        'targetNgram': [
          {
            'text': 'target-changed',
            'occurrence': 2,
            'occurrences': 2,
            'position': 2
          }
        ]
      }
    ];
    expect(areAlignmentsEquivalent(prev, next)).toBe(false);
  });

  it('changed the source word text', () => {
    const prev = [
      {
        'sourceNgram': [
          {
            'text': 'source',
            'position': 1,
            'occurrence': 1,
            'occurrences': 1
          }
        ],
        'targetNgram': [
          {
            'text': 'target',
            'occurrence': 2,
            'occurrences': 2,
            'position': 2
          }
        ]
      }
    ];
    const next = [
      {
        'sourceNgram': [
          {
            'text': 'source-changed',
            'position': 1,
            'occurrence': 1,
            'occurrences': 1
          }
        ],
        'targetNgram': [
          {
            'text': 'target',
            'occurrence': 2,
            'occurrences': 2,
            'position': 2
          }
        ]
      }
    ];
    expect(areAlignmentsEquivalent(prev, next)).toBe(false);
  });

  it('changed the target word occurrence', () => {
    const prev = [
      {
        'sourceNgram': [
          {
            'text': 'source',
            'position': 1,
            'occurrence': 1,
            'occurrences': 1
          }
        ],
        'targetNgram': [
          {
            'text': 'target',
            'occurrence': 2,
            'occurrences': 2,
            'position': 2
          }
        ]
      }
    ];
    const next = [
      {
        'sourceNgram': [
          {
            'text': 'source',
            'position': 1,
            'occurrence': 1,
            'occurrences': 1
          }
        ],
        'targetNgram': [
          {
            'text': 'target',
            'occurrence': 500,
            'occurrences': 2,
            'position': 2
          }
        ]
      }
    ];
    expect(areAlignmentsEquivalent(prev, next)).toBe(true);
  });

  it('changed the source word occurrence', () => {
    const prev = [
      {
        'sourceNgram': [
          {
            'text': 'source',
            'position': 1,
            'occurrence': 1,
            'occurrences': 1
          }
        ],
        'targetNgram': [
          {
            'text': 'target',
            'occurrence': 2,
            'occurrences': 2,
            'position': 2
          }
        ]
      }
    ];
    const next = [
      {
        'sourceNgram': [
          {
            'text': 'source',
            'position': 1,
            'occurrence': 500,
            'occurrences': 1
          }
        ],
        'targetNgram': [
          {
            'text': 'target',
            'occurrence': 2,
            'occurrences': 2,
            'position': 2
          }
        ]
      }
    ];
    expect(areAlignmentsEquivalent(prev, next)).toBe(true);
  });

  it('changed the target word total occurrences', () => {
    const prev = [
      {
        'sourceNgram': [
          {
            'text': 'source',
            'position': 1,
            'occurrence': 1,
            'occurrences': 1
          }
        ],
        'targetNgram': [
          {
            'text': 'target',
            'occurrence': 2,
            'occurrences': 2,
            'position': 2
          }
        ]
      }
    ];
    const next = [
      {
        'sourceNgram': [
          {
            'text': 'source',
            'position': 1,
            'occurrence': 1,
            'occurrences': 1
          }
        ],
        'targetNgram': [
          {
            'text': 'target',
            'occurrence': 2,
            'occurrences': 500,
            'position': 2
          }
        ]
      }
    ];
    expect(areAlignmentsEquivalent(prev, next)).toBe(true);
  });

  it('changed the source word total occurrences', () => {
    const prev = [
      {
        'sourceNgram': [
          {
            'text': 'source',
            'position': 1,
            'occurrence': 1,
            'occurrences': 1
          }
        ],
        'targetNgram': [
          {
            'text': 'target',
            'occurrence': 2,
            'occurrences': 2,
            'position': 2
          }
        ]
      }
    ];
    const next = [
      {
        'sourceNgram': [
          {
            'text': 'source',
            'position': 1,
            'occurrence': 1,
            'occurrences': 500
          }
        ],
        'targetNgram': [
          {
            'text': 'target',
            'occurrence': 2,
            'occurrences': 2,
            'position': 2
          }
        ]
      }
    ];
    expect(areAlignmentsEquivalent(prev, next)).toBe(true);
  });

  it('changed the target word position', () => {
    const prev = [
      {
        'sourceNgram': [
          {
            'text': 'source',
            'position': 1,
            'occurrence': 1,
            'occurrences': 1
          }
        ],
        'targetNgram': [
          {
            'text': 'target',
            'occurrence': 2,
            'occurrences': 2,
            'position': 2
          }
        ]
      }
    ];
    const next = [
      {
        'sourceNgram': [
          {
            'text': 'source',
            'position': 1,
            'occurrence': 1,
            'occurrences': 1
          }
        ],
        'targetNgram': [
          {
            'text': 'target',
            'occurrence': 2,
            'occurrences': 2,
            'position': 500
          }
        ]
      }
    ];
    expect(areAlignmentsEquivalent(prev, next)).toBe(true);
  });

  it('changed the source word position', () => {
    const prev = [
      {
        'sourceNgram': [
          {
            'text': 'source',
            'position': 1,
            'occurrence': 1,
            'occurrences': 1
          }
        ],
        'targetNgram': [
          {
            'text': 'target',
            'occurrence': 2,
            'occurrences': 2,
            'position': 2
          }
        ]
      }
    ];
    const next = [
      {
        'sourceNgram': [
          {
            'text': 'source',
            'position': 500,
            'occurrence': 1,
            'occurrences': 1
          }
        ],
        'targetNgram': [
          {
            'text': 'target',
            'occurrence': 2,
            'occurrences': 2,
            'position': 2
          }
        ]
      }
    ];
    expect(areAlignmentsEquivalent(prev, next)).toBe(true);
  });

  it('lost a target word', () => {
    const prev = [
      {
        'sourceNgram': [
          {
            'text': 'source',
            'position': 1,
            'occurrence': 1,
            'occurrences': 1
          }
        ],
        'targetNgram': [
          {
            'text': 'target',
            'occurrence': 2,
            'occurrences': 2,
            'position': 2
          }
        ]
      }
    ];
    const next = [
      {
        'sourceNgram': [
          {
            'text': 'source',
            'position': 1,
            'occurrence': 1,
            'occurrences': 1
          }
        ],
        'targetNgram': []
      }
    ];
    expect(areAlignmentsEquivalent(prev, next)).toBe(false);
    // gained a word
    expect(areAlignmentsEquivalent(next, prev)).toBe(false);
  });

  it('lost a source word', () => {
    const prev = [
      {
        'sourceNgram': [
          {
            'text': 'source',
            'position': 1,
            'occurrence': 1,
            'occurrences': 1
          }
        ],
        'targetNgram': [
          {
            'text': 'target',
            'occurrence': 2,
            'occurrences': 2,
            'position': 2
          }
        ]
      }
    ];
    const next = [
      {
        'sourceNgram': [],
        'targetNgram': [
          {
            'text': 'target',
            'occurrence': 2,
            'occurrences': 2,
            'position': 2
          }
        ]
      }
    ];
    expect(areAlignmentsEquivalent(prev, next)).toBe(false);
    // gained a word
    expect(areAlignmentsEquivalent(next, prev)).toBe(false);
  });

  it('has a different number of alignments', () => {
    expect(areAlignmentsEquivalent([], [{}])).toBe(false);
  });
});
