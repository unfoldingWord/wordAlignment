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
 * Gets the aligned GL text from the given bible
 * @param {object} contextId
 * @param {object} bible
 * @returns {string}
 */
export function getAlignedTextFromBible(contextId, bible) {
  if (bible && contextId && contextId.reference &&
    bible[contextId.reference.chapter] && bible[contextId.reference.chapter][contextId.reference.verse] &&
    bible[contextId.reference.chapter][contextId.reference.verse].verseObjects) {
    const verseObjects = bible[contextId.reference.chapter][contextId.reference.verse].verseObjects;
    return getAlignedText(verseObjects, contextId.quote, contextId.occurrence);
  }
}
