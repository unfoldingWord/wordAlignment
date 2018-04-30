import {disableAlignedWords} from '../words';
import Token from 'word-map/structures/Token';

describe('disableAlignedWords', () => {
  it('disables some words', () => {
    const words = [
      new Token({text: 'w1'}),
      new Token({text: 'w2'}),
      new Token({text: 'w3'}),
    ];
    const alignedWords = [
      new Token({text: 'w2'})
    ];
    const w2 = new Token({text: 'w2'});
    w2.disabled = true;
    const expected = [
      new Token({text: 'w1'}),
      w2,
      new Token({text: 'w3'})
    ];

    const result = disableAlignedWords(words, alignedWords);
    expect(result).toEqual(expected);
  });

  it('disables no words', () => {
    const words = [
      new Token({text: 'w1'}),
      new Token({text: 'w2'}),
      new Token({text: 'w3'})
    ];
    const alignedWords = [
      new Token({text: 'w0'})
    ];
    const expected = [
      new Token({text: 'w1'}),
      new Token({text: 'w2'}),
      new Token({text: 'w3'})
    ];

    const result = disableAlignedWords(words, alignedWords);
    expect(result).toEqual(expected);
  });

  it('has no alignments', () => {
    const words = [
      new Token({text: 'w1'}),
      new Token({text: 'w2'}),
      new Token({text: 'w3'})
    ];
    const alignedWords = [
    ];
    const expected = [
      new Token({text: 'w1'}),
      new Token({text: 'w2'}),
      new Token({text: 'w3'})
    ];

    const result = disableAlignedWords(words, alignedWords);
    expect(result).toEqual(expected);
  });

  it('has no words', () => {
    const words = [];
    const alignedWords = [
      new Token({text: 'w1'}),
      new Token({text: 'w2'}),
      new Token({text: 'w3'})
    ];
    const expected = [];
    const result = disableAlignedWords(words, alignedWords);
    expect(result).toEqual(expected);
  });
});
