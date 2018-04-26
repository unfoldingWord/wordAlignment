import {reducerTest} from 'redux-jest';
import * as types from '../../actions/actionTypes';
import alignments from '../alignments';
import Token from 'word-map/structures/Token';

describe('set chapter alignments when empty', () => {
  const stateBefore = {};
  const action = {
    type: types.SET_CHAPTER_ALIGNMENTS,
    chapter: 1,
    alignments: {
      '1': {
        alignments: []
      }
    }
  };
  const stateAfter = {
    '1': {
      '1': []
    }
  };
  reducerTest('Set Chapter Alignments', alignments, stateBefore, action,
    stateAfter);
});

describe('align target token', () => {
  const stateBefore = {
    '1': {
      '1': [
        {
          topWords: [{}],
          bottomWords: [
            {
              word: 'world',
              occurrence: 1,
              occurrences: 1,
              position: 1
            }
          ]
        }
      ]
    }
  };
  const action = {
    type: types.ALIGN_TARGET_TOKEN,
    chapter: 1,
    verse: 1,
    index: 0,
    token: new Token({
      text: 'hello',
      occurrence: 1,
      occurrences: 1
    })
  };
  const stateAfter = {
    '1': {
      '1': [
        {
          topWords: [{}],
          bottomWords: [
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
            }
          ]
        }
      ]
    }
  };
  reducerTest('Add Alignment', alignments, stateBefore, action,
    stateAfter);
});

describe('insert source token', () => {
  const stateBefore = {
    '1': {
      '1': [
        {
          topWords: [
            {
              word: 'world',
              occurrence: 1,
              occurrences: 1,
              strong: 'strong',
              morph: 'morph',
              lemma: 'lemma',
              position: 1
            }
          ],
          bottomWords: []
        }
      ]
    }
  };
  const action = {
    type: types.INSERT_ALIGNMENT,
    chapter: 1,
    verse: 1,
    token: new Token({
      text: 'hello',
      occurrence: 1,
      occurrences: 1,
      strong: 'strong',
      morph: 'morph',
      lemma: 'lemma'
    })
  };
  const stateAfter = {
    '1': {
      '1': [
        {
          topWords: [
            {
              word: 'hello',
              occurrence: 1,
              occurrences: 1,
              strong: 'strong',
              morph: 'morph',
              lemma: 'lemma',
              position: 0
            }
          ],
          bottomWords: []
        },
        {
          topWords: [
            {
              word: 'world',
              occurrence: 1,
              occurrences: 1,
              strong: 'strong',
              morph: 'morph',
              lemma: 'lemma',
              position: 1
            }
          ],
          bottomWords: []
        }
      ]
    }
  };
  reducerTest('Insert Alignment', alignments, stateBefore, action,
    stateAfter);
});

describe('align source token', () => {
  const stateBefore = {
    '1': {
      '1': [
        {
          topWords: [],
          bottomWords: [
            {
              word: 'world',
              occurrence: 1,
              occurrences: 1
            }
          ]
        }
      ]
    }
  };
  const action = {
    type: types.ALIGN_SOURCE_TOKEN,
    chapter: 1,
    verse: 1,
    index: 0,
    token: new Token({
      text: 'hello',
      occurrence: 1,
      occurrences: 1,
      strong: 'strong',
      morph: 'morph',
      lemma: 'lemma'
    })
  };
  const stateAfter = {
    '1': {
      '1': [
        {
          topWords: [
            {
              word: 'hello',
              occurrence: 1,
              occurrences: 1,
              strong: 'strong',
              morph: 'morph',
              lemma: 'lemma',
              position: 0
            }
          ],
          bottomWords: [
            {
              word: 'world',
              occurrence: 1,
              occurrences: 1
            }
          ]
        }
      ]
    }
  };
  reducerTest('Add Alignment', alignments, stateBefore, action,
    stateAfter);
});

describe('remove target token alignment', () => {
  const stateBefore = {
    '1': {
      '1': [
        {
          topWords: [{}],
          bottomWords: [
            {
              word: 'world',
              occurrence: 1,
              occurrences: 1
            }
          ]
        }
      ]
    }
  };
  const action = {
    type: types.UNALIGN_TARGET_TOKEN,
    chapter: 1,
    verse: 1,
    index: 0,
    token: new Token({
      text: 'world',
      occurrence: 1,
      occurrences: 1
    })
  };
  const stateAfter = {
    '1': {
      '1': [
        {
          topWords: [{}],
          bottomWords: []
        }
      ]
    }
  };
  reducerTest('Remove Alignment', alignments, stateBefore, action, stateAfter);
});

describe('remove source token alignment', () => {
  const stateBefore = {
    '1': {
      '1': [
        {
          topWords: [
            {
              word: 'hello',
              occurrence: 1,
              occurrences: 1
            }
          ],
          bottomWords: [
            {
              word: 'world',
              occurrence: 1,
              occurrences: 1
            }
          ]
        }
      ]
    }
  };
  const action = {
    type: types.UNALIGN_SOURCE_TOKEN,
    chapter: 1,
    verse: 1,
    index: 0,
    token: new Token({
      text: 'hello',
      occurrence: 1,
      occurrences: 1
    })
  };
  const stateAfter = {
    '1': {
      '1': []
    }
  };
  reducerTest('Remove Alignment', alignments, stateBefore, action,
    stateAfter);
});

describe('set chapter alignments', () => {
  const stateBefore = {
    '1': {
      '1': [
        {
          topWords: [],
          bottomWords: [
            {
              word: 'world',
              occurrence: 1,
              occurrences: 1
            }
          ]
        }
      ]
    }
  };
  const action = {
    type: types.SET_CHAPTER_ALIGNMENTS,
    chapter: 1,
    alignments: {
      '1': {
        alignments: []
      },
      '2': {
        alignments: [
          {
            topWords: [],
            bottomWords: [
              {
                hello: 'world'
              }
            ]
          }
        ]
      }
    }
  };
  const stateAfter = {
    '1': {
      '1': [],
      '2': [
        {
          topWords: [],
          bottomWords: [
            {
              hello: 'world'
            }
          ]
        }
      ]
    }
  };
  reducerTest('Set Chapter Alignments', alignments, stateBefore, action,
    stateAfter);
});
