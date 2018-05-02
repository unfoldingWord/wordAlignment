import Token from 'word-map/structures/Token';
import {VerseObjectUtils} from 'word-aligner';

/**
 * Converts verse objects (as in from the source language verse) into {@link Token}s.
 * @param verseObjects
 */
export const tokenizeVerseObjects = (verseObjects) => {
  const tokens = [];
  const completeTokens = []; // includes occurrences
  const occurrences = {};
  let position = 0;
  const words = VerseObjectUtils.getWordList(verseObjects);
  for (const word of words) {
    if (typeof occurrences[word.text] === 'undefined') {
      occurrences[word.text] = 0;
    }
    occurrences[word.text]++;
    tokens.push(new Token({
      text: word.text,
      strong: (word.strong || word.strongs),
      morph: word.morph,
      lemma: word.lemma,
      position: position,
      occurrence: occurrences[word.text]
    }));
    position++;
  }
  // inject occurrences
  for (const token of tokens) {
    completeTokens.push(new Token({
      text: token.toString(),
      strong: token.strong,
      morph: token.morph,
      lemma: token.lemma,
      position: token.position,
      occurrence: token.occurrence,
      occurrences: occurrences[token.toString()]
    }));
  }
  return completeTokens;
};
