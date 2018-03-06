import {disableAlignedWords} from '../words';
import Word from '../../specs/Word';

describe('disableAlignedWords', () => {
  it('disables some words', () => {
    const words = [
      new Word('w1'),
      new Word('w2'),
      new Word('w3')
    ];
    const alignedWords = [
      new Word('w2')
    ];
    const w2 = new Word('w2');
    w2.disable();
    const expected = [
      new Word('w1'),
      w2,
      new Word('w3')
    ];

    const result = disableAlignedWords(words, alignedWords);
    expect(result).toEqual(expected);
  });

  it('disables no words', () => {
    const words = [
      new Word('w1'),
      new Word('w2'),
      new Word('w3')
    ];
    const alignedWords = [
      new Word('w0')
    ];
    const expected = [
      new Word('w1'),
      new Word('w2'),
      new Word('w3')
    ];

    const result = disableAlignedWords(words, alignedWords);
    expect(result).toEqual(expected);
  });

  it('has no alignments', () => {
    const words = [
      new Word('w1'),
      new Word('w2'),
      new Word('w3')
    ];
    const alignedWords = [
    ];
    const expected = [
      new Word('w1'),
      new Word('w2'),
      new Word('w3')
    ];

    const result = disableAlignedWords(words, alignedWords);
    expect(result).toEqual(expected);
  });

  it('has no words', () => {
    const words = [];
    const alignedWords = [
      new Word('w1'),
      new Word('w2'),
      new Word('w3')
    ];
    const expected = [];
    const result = disableAlignedWords(words, alignedWords);
    expect(result).toEqual(expected);
  });
});
