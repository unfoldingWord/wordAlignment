import {Token} from 'wordmap-lexer';
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
  let sentenceCharLength = 0;
  for (const word of words) {
    if (typeof occurrences[word.text] === 'undefined') {
      occurrences[word.text] = 0;
    }
    sentenceCharLength += word.text.length;
    occurrences[word.text]++;
    tokens.push({
      text: word.text,
      strong: (word.strong || word.strongs),
      morph: word.morph,
      lemma: word.lemma,
      position: position,
      occurrence: occurrences[word.text]
    });
    position++;
  }
  // inject occurrences
  for (const token of tokens) {
    completeTokens.push(new Token({
      text: token.text,
      strong: token.strong,
      morph: token.morph,
      lemma: token.lemma,
      position: token.position,
      occurrence: token.occurrence,
      occurrences: occurrences[token.text],
      sentenceTokenLen: tokens.length,
      sentenceCharLen: sentenceCharLength
    }));
  }
  return completeTokens;
};
