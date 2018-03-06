import usfm from 'usfm-js';
import * as stringUtils from './strings';

/**
 * Method to filter usfm markers from a string or verseObjects array
 * @param {String|Array|Object} verseObjects - The string to remove markers from
 * @return {Array}
 */
export const getWordList = (verseObjects) => {
  let wordList = [];
  if (typeof verseObjects === 'string') {
    verseObjects = verseObjectsFromString(verseObjects);
  }
  if (verseObjects && verseObjects.verseObjects) {
    verseObjects = verseObjects.verseObjects;
  }

  if (verseObjects) {
    wordList = getWordListFromVerseObjectArray(verseObjects);
  }
  return wordList;
};

/**
 * @description wordObjectArray via string
 * @param {String} string - The string to search in
 * @returns {Array} - array of wordObjects
 */
export const verseObjectsFromString = (string) => {
  let verseObjects = [];
  // convert string using usfm to JSON
  const _verseObjects = usfm.toJSON('\\v 1 ' + string, {chunk: true}).verses["1"].verseObjects;
  const _verseObjectsWithTextString = _verseObjects
  .map(verseObject => verseObject.text)
  .filter(text => text)
  .join(' ');
  let nonWordVerseObjectCount = 0;
  _verseObjects.forEach(_verseObject => {
    if (_verseObject.text) {
      stringUtils.tokenizeWithPunctuation(_verseObject.text).map(text => {
        let verseObject;
        if (stringUtils.word.test(text)) { // if the text has word characters, its a word object
          const wordIndex = verseObjects.length - nonWordVerseObjectCount;
          let occurrence = stringUtils.occurrenceInString(_verseObjectsWithTextString, wordIndex, text);
          const occurrences = stringUtils.occurrencesInString(_verseObjectsWithTextString, text);
          if (occurrence > occurrences) occurrence = occurrences;
          verseObject = {
            tag: "w",
            type: "word",
            text,
            occurrence,
            occurrences
          };
        } else { // the text does not have word characters
          nonWordVerseObjectCount ++;
          verseObject = {
            type: "text",
            text: text
          };
        }
        verseObjects.push(verseObject);
      });
    } else {
      verseObjects.push(_verseObject);
    }
  });
  return verseObjects;
};

/**
 * extract list of word objects from array of verseObjects (will also search children of milestones).
 * @param {Array} verseObjects
 * @return {Array} words found
 */
export const getWordListFromVerseObjectArray = function (verseObjects) {
  let wordList = [];
  for (let verseObject of verseObjects) {
    const words = extractWordsFromVerseObject(verseObject);
    wordList = wordList.concat(words);
  }
  return wordList;
};

/**
 * extracts word objects from verse object.  If verseObject is word type, return that in array, else if it is a
 *    milestone, then add words found in children to word array.  If no words found return empty array.
 * @param {object} verseObject
 * @return {Array} words found
 */
export const extractWordsFromVerseObject = (verseObject) => {
  let words = [];
  if (typeof(verseObject) === 'object') {
    if (verseObject.word || verseObject.type === 'word') {
      words.push(verseObject);
    } else if (verseObject.type === 'milestone' && verseObject.children) {
      for (let child of verseObject.children) {
        const childWords = extractWordsFromVerseObject(child);
        words = words.concat(childWords);
      }
    }
  }
  return words;
};
