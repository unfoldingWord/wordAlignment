import {canDropPrimaryToken} from '../index';

describe('acceptable drops', () => {
  test('single to single left', () => {
    const source = makeSingleSource('move left');
    const target = makeSingleTarget();
    const result = canDropPrimaryToken(target, source);
    expect(result).toEqual(true);
  });

  it('single to single right', () => {
    const source = makeSingleSource('move right');
    const target = makeSingleTarget();
    const result = canDropPrimaryToken(target, source);
    expect(result).toEqual(true);
  });

  test('merged (right word) to empty right', () => {
    const source = makeMergedSource('move right', 'right word');
    const target = makeEmptyTarget();
    // TRICKY: valid empty targets will have the same alignment position
    target.alignmentIndex = source.alignmentIndex;
    const result = canDropPrimaryToken(target, source);
    expect(result).toEqual(true);
  });

  test('merged (left word) to empty left', () => {
    const source = makeMergedSource('move left', 'left word');
    const target = makeEmptyTarget();
    // TRICKY: valid empty targets will have the same alignment index
    target.alignmentIndex = source.alignmentIndex;
    const result = canDropPrimaryToken(target, source);
    expect(result).toEqual(true);
  });

  test('single to merged right', () => {
    const source = makeSingleSource('move right');
    const target = makeMergedTarget();
    const result = canDropPrimaryToken(target, source);
    expect(result).toEqual(true);
  });

  test('single to merged left', () => {
    const source = makeSingleSource('move left');
    const target = makeMergedTarget();
    const result = canDropPrimaryToken(target, source);
    expect(result).toEqual(true);
  });
});

describe('unacceptable drops', () => {

  describe('single word alignments', () => {
    it('dropped on it\'s current alignment is not allowed', () => {
      const source = {
        alignmentIndex: 1,
        wordIndex: 1,
        alignmentLength: 1
      };
      const target = {
        sourceNgram: ['word'],
        targetNgram: [],
        alignmentIndex: 1
      };
      const result = canDropPrimaryToken(target, source);
      expect(result).toEqual(false);
    });

    it('dropped on an empty alignment is not allowed', () => {
      const source = {
        alignmentIndex: 2,
        wordIndex: 1,
        alignmentLength: 1
      };
      const target = {
        sourceNgram: [],
        targetNgram: [],
        alignmentIndex: 1
      };
      const result = canDropPrimaryToken(target, source);
      expect(result).toEqual(false);
    });

    it('dropped on a different single alignment is allowed', () => {
      const source = {
        alignmentIndex: 2,
        wordIndex: 1,
        alignmentLength: 1
      };
      const target = {
        sourceNgram: ['word'],
        targetNgram: [],
        alignmentIndex: 1
      };
      const result = canDropPrimaryToken(target, source);
      expect(result).toEqual(true);
    });
  });

  describe('multi-word (merged) alignments', () => {
    test('last word dropped on a previous adjacent alignment is allowed', () => {
      const source = makeMergedSource('move left', 'right word');
      const target = makeMergedTarget();
      const result = canDropPrimaryToken(target, source);
      expect(result).toEqual(true);
    });

    test('first word dropped on a next adjacent alignment is allowed', () => {
      const source = {
        alignmentIndex: 1,
        wordIndex: 0,
        alignmentLength: 2
      };
      const target = {
        sourceNgram: ['word'],
        targetNgram: [],
        alignmentIndex: 2
      };
      const result = canDropPrimaryToken(target, source);
      expect(result).toEqual(true);
    });

    test('last word dropped on a next adjacent alignment is allowed', () => {
      const source = {
        alignmentIndex: 1,
        wordIndex: 1,
        alignmentLength: 2
      };
      const target = {
        sourceNgram: ['word'],
        targetNgram: [],
        alignmentIndex: 2
      };
      const result = canDropPrimaryToken(target, source);
      expect(result).toEqual(true);
    });

    test('first word dropped on a previous adjacent alignment is allowed', () => {
      const source = {
        alignmentIndex: 2,
        wordIndex: 0,
        alignmentLength: 2
      };
      const target = {
        sourceNgram: ['word'],
        targetNgram: [],
        alignmentIndex: 1
      };
      const result = canDropPrimaryToken(target, source);
      expect(result).toEqual(true);
    });
  });
});

function makeMergedSource(movement, wordPosition) {
  return {
    alignmentIndex: parseMovement(movement),
    wordIndex: parseWordPosition(wordPosition),
    alignmentLength: 2
  };
}

function makeSingleSource(movement) {
  return {
    alignmentIndex: parseMovement(movement),
    wordIndex: 0,
    alignmentLength: 1
  };
}

function makeMergedTarget() {
  return {
    sourceNgram: ['word1', 'word2'],
    targetNgram: [],
    alignmentIndex: 2
  };
}

function makeEmptyTarget() {
  return {
    sourceNgram: [],
    targetNgram: [],
    alignmentIndex: 2
  };
}

function makeSingleTarget() {
  return {
    sourceNgram: ['word1'],
    targetNgram: [],
    alignmentIndex: 2
  };
}

/**
 * Parses the position of the word within a merged alignment.
 * This returns the word index.
 * @param {string} wordPosition
 * @throws an error for invalid input
 * @return {number}
 */
function parseWordPosition(wordPosition) {
  switch(wordPosition) {
    case 'left word':
      return 0;
    case 'right word':
      return 1;
    default:
      throw Error(`Invalid value for parameter "wordPosition". Expected "first" or "last" but received "${wordPosition}"`);
  }
}

/**
 * Parses the movement when generating source objects.
 * This returns the alignment index.
 * For the purposes of our tests sources are at index 1 or 3 because the target is always at 2.
 *
 * @param {string} movement
 * @throws an error for invalid input
 * @return {number}
 */
function parseMovement(movement) {
  switch(movement) {
    case 'move left':
      return 3;
    case 'move right':
      return 1;
    default:
      throw Error(`Invalid value for parameter "movement". Expected "left" or "right" but received "${movement}"`);
  }
}
