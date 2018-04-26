import Word from '../specs/Word';
import * as stringUtils from './strings';
import {getWordList} from './verses';
import _ from 'lodash';

/**
 * Returns a list of words from a verse
 * @param {string} verseText - the verse text from the secondary language
 * @return {Word[]} - an array of Words
 */
export const getWords = (verseText) => {
  const verseWords = getWordList(verseText);
  // TODO: remove once occurrencesInString uses tokenizer, can't do that until bug is addressed with Greek
  const _verseText = verseWords.map(object => object.text || '').join(' ');
  return verseWords.map((object, index) => {
    const word = object.text;
    let occurrences = stringUtils.occurrencesInString(_verseText, word);
    let occurrence = stringUtils.occurrenceInString(_verseText, index, word);
    return new Word(word, occurrence, occurrences);
  });
};

/**
 * Returns a list of words that have been aligned
 * @deprecated use the reducer instead
 * @param {object} alignmentData - the alignments object
 * @param {int} chapter
 * @param {int} verse
 * @return {Word[]} - an array of Words
 */
export const getAlignedWords = (alignmentData, chapter, verse) => {
  if(alignmentData
    && alignmentData[chapter]
    && alignmentData[chapter][verse]
    && alignmentData[chapter][verse].alignments) {
    const alignments = alignmentData[chapter][verse].alignments;
    const words = [];
    alignments.map(alignment => {
      for(const word of alignment.bottomWords) {
        words.push(new Word(word.word, word.occurrence, word.occurrences));
      }
    });
    return words;
  } else {
    return [];
  }
};

/**
 * Returns a new array with aligned words disabled.
 *
 * @param {Word[]} words
 * @param {Word[]} alignedWords
 * @return {Word[]}
 */
export const disableAlignedWords = (words, alignedWords) => {
  return words.map(word => {
    if(_.find(alignedWords, word)) {
      word.disabled = true;
    }
    return word;
  });
};
