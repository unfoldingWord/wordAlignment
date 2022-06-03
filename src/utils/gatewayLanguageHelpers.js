/* eslint-disable no-nested-ternary */
import { getAlignedText } from 'tc-ui-toolkit';

/**
 * Return book code with highest precidence
 * @param {*} a - First book code of 2
 * @param {*} b - second book code
 */
export function bibleIdSort(a, b) {
  const biblePrecedence = ['udb', 'ust', 'ulb', 'ult', 'irv']; // these should come first in this order if more than one aligned Bible, from least to greatest

  if (biblePrecedence.indexOf(a) == biblePrecedence.indexOf(b)) {
    return (a < b ? -1 : a > b ? 1 : 0);
  } else {
    return biblePrecedence.indexOf(b) - biblePrecedence.indexOf(a);
  } // this plays off the fact other Bible IDs will be -1
}

/**
 * get verse range from span
 * @param {string} verseSpan
 * @return {{high: number, low: number}}
 */
export function getVerseSpanRange(verseSpan) {
  let [low, high] = verseSpan.split('-');
  low = parseInt(low);
  high = parseInt(high);
  return { low, high };
}

/**
 * test if verse is valid verse number or verse span string
 * @param {string|number} verse
 * @return {boolean}
 */
export function isVerseSpan(verse) {
  const isSpan = (typeof verse === 'string') && verse.includes('-');
  return isSpan;
}

/**
 * Gets the aligned GL text from the given bible
 * @param {object} contextId
 * @param {object} bible
 * @returns {string}
 */
export function getAlignedTextFromBible(contextId, bible) {
  if (bible && contextId?.reference) {
    const chapterData = bible[contextId.reference.chapter];
    const verseRef = contextId.reference.verse;
    const verseData = chapterData?.[verseRef];
    let verseObjects = null;

    if (verseData) { // if we found verse
      verseObjects = verseData.verseObjects;
    } else if (isVerseSpan(verseRef)) { // if we didn't find verse, check if verse span
      verseObjects = [];
      // iterate through all verses in span
      const { low, high } = getVerseSpanRange(verseRef);

      for (let i = low; i <= high; i++) {
        const verseObjects_ = chapterData?.[i]?.verseObjects;

        if (!verseObjects_) { // if verse missing, abort
          verseObjects = null;
          break;
        }
        verseObjects = verseObjects.concat(verseObjects_);
      }
    }
    return getAlignedText(verseObjects, contextId.quote, contextId.occurrence);
  }
}
