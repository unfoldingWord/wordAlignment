import {canDropPrimaryWord} from '../dragDrop';

describe('determines if a primary word can be dropped', () => {

  describe('single word alignments', () => {
    it('is dropped on it\'s current alignment', () => {
      const source = {
        alignmentIndex: 1,
        wordIndex: 1,
        alignmentLength: 1
      };
      const target = {
        topWords: ['word'],
        bottomWords: [],
        alignmentIndex: 1,
        siblingTopWords: []
      };
      const result = canDropPrimaryWord(target, source);
      expect(result).toEqual(false);
    });

    it('is dropped on the previous adjacent alignment', () => {
      const source = {
        alignmentIndex: 2,
        wordIndex: 0,
        alignmentLength: 1
      };
      const target = {
        topWords: ['word'],
        bottomWords: [],
        alignmentIndex: 1,
        siblingTopWords: []
      };
      const result = canDropPrimaryWord(target, source);
      expect(result).toEqual(true);
    });

    it('is dropped on the next adjacent alignment', () => {
      const source = {
        alignmentIndex: 1,
        wordIndex: 0,
        alignmentLength: 1
      };
      const target = {
        topWords: ['word'],
        bottomWords: [],
        alignmentIndex: 2,
        siblingTopWords: []
      };
      const result = canDropPrimaryWord(target, source);
      expect(result).toEqual(true);
    });

    it('is dropped on a non-adjacent alignment', () => {
      const source = {
        alignmentIndex: 3,
        wordIndex: 1,
        alignmentLength: 1
      };
      const target = {
        topWords: ['word'],
        bottomWords: [],
        alignmentIndex: 1,
        siblingTopWords: []
      };
      const result = canDropPrimaryWord(target, source);
      expect(result).toEqual(false);
    });

    it('is dropped on an empty alignment', () => {
      const source = {
        alignmentIndex: 2,
        wordIndex: 1,
        alignmentLength: 1
      };
      const target = {
        topWords: [],
        bottomWords: [],
        alignmentIndex: 1,
        siblingTopWords: []
      };
      const result = canDropPrimaryWord(target, source);
      expect(result).toEqual(false);
    });
  });

  describe('multi-word (merged) alignments', () => {
    test('last word is dropped on a previous adjacent alignment', () => {
      const source = {
        alignmentIndex: 2,
        wordIndex: 1,
        alignmentLength: 2
      };
      const target = {
        topWords: ['word'],
        bottomWords: [],
        alignmentIndex: 1,
        siblingTopWords: []
      };
      const result = canDropPrimaryWord(target, source);
      expect(result).toEqual(false);
    });

    test('first word is dropped on a next adjacent alignment', () => {
      const source = {
        alignmentIndex: 1,
        wordIndex: 0,
        alignmentLength: 2
      };
      const target = {
        topWords: ['word'],
        bottomWords: [],
        alignmentIndex: 2,
        siblingTopWords: []
      };
      const result = canDropPrimaryWord(target, source);
      expect(result).toEqual(false);
    });

    test('last word is dropped on a next adjacent alignment', () => {
      const source = {
        alignmentIndex: 1,
        wordIndex: 1,
        alignmentLength: 2
      };
      const target = {
        topWords: ['word'],
        bottomWords: [],
        alignmentIndex: 2,
        siblingTopWords: []
      };
      const result = canDropPrimaryWord(target, source);
      expect(result).toEqual(false);
    });

    test('first word is dropped on a previous adjacent alignment', () => {
      const source = {
        alignmentIndex: 2,
        wordIndex: 0,
        alignmentLength: 2
      };
      const target = {
        topWords: ['word'],
        bottomWords: [],
        alignmentIndex: 1,
        siblingTopWords: []
      };
      const result = canDropPrimaryWord(target, source);
      expect(result).toEqual(false);
    });

    test('last word is dropped on a next adjacent empty alignment', () => {
      const source = {
        alignmentIndex: 1,
        wordIndex: 1,
        alignmentLength: 2
      };
      const target = {
        topWords: [],
        bottomWords: [],
        alignmentIndex: 2,
        siblingTopWords: []
      };
      const result = canDropPrimaryWord(target, source);
      expect(result).toEqual(true);
    });

    test('first word is dropped on a previous adjacent empty alignment', () => {
      const source = {
        alignmentIndex: 2,
        wordIndex: 0,
        alignmentLength: 2
      };
      const target = {
        topWords: [],
        bottomWords: [],
        alignmentIndex: 1,
        siblingTopWords: []
      };
      const result = canDropPrimaryWord(target, source);
      expect(result).toEqual(true);
    });
  });
});
