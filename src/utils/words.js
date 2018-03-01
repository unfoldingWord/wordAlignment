import Unigram from '../specs/Unigram';
import * as stringUtils from './strings';
import {getWordList} from './verses';

/**
 * Returns a list of words from a verse
 * @param {string} verseText - the verse text from the secondary language
 * @return {Unigram[]} - an array of uni-grams
 */
export const getWords = (verseText) => {
  const verseWords = getWordList(verseText);
  // TODO: remove once occurrencesInString uses tokenizer, can't do that until bug is addressed with Greek
  const _verseText = verseWords.map(object => object.text || '').join(' ');
  return verseWords.map((object, index) => {
    const word = object.text;
    let occurrences = stringUtils.occurrencesInString(_verseText, word);
    let occurrence = stringUtils.occurrenceInString(_verseText, index, word);
    return new Unigram(word, occurrence, occurrences);
  });
};
