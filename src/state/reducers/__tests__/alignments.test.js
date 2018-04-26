import {reducerTest} from 'redux-jest';
import * as types from '../../actions/actionTypes';
import alignments from '../alignments';
import Token from 'word-map/structures/Token';

{
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
}

{
  const stateBefore = {
    '1': {
      '1': [
        {
          topWords: [],
          bottomWords: []
        }
      ]
    }
  };
  const action = {
    type: types.ADD_TO_ALIGNMENT,
    chapter: 1,
    verse: 1,
    alignmentIndex: 0,
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
          topWords: [],
          bottomWords: [
            {
              word: 'hello',
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
}

{
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
    type: types.REMOVE_FROM_ALIGNMENT,
    chapter: 1,
    verse: 1,
    alignmentIndex: 0,
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
          topWords: [],
          bottomWords: []
        }
      ]
    }
  };
  reducerTest('Remove Alignment', alignments, stateBefore, action, stateAfter);
}

{
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
}
