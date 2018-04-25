import isEqual from 'deep-equal';
import {default as aligner, VerseObjectUtils, ArrayUtils} from "word-aligner";

/**
 * Checks if there have been any changes in the verse text.
 * @param verseAlignments
 * @param ugnt
 * @param targetVerse
 * @return {*}
 */
export const checkVerseForChanges = (verseAlignments, ugnt, targetVerse) => {
  const showDialog = aligner.verseHasAlignments(verseAlignments);
  const cleanedTargetVerse = cleanVerse(targetVerse);
  const staticGreekVerse = stringifyVerseObjects(ugnt.verseObjects);
  const currentGreekVerse = stringifySourceAlignments(verseAlignments);
  const currentTargetVerse = stringifyTargetAlignments(verseAlignments);
  const greekChanged = !isEqual(staticGreekVerse, currentGreekVerse);
  const targetVerseChanged = !isEqual(cleanedTargetVerse, currentTargetVerse);
  return {
    alignmentsInvalid: greekChanged || targetVerseChanged,
    alignmentChangesType: greekChanged ? 'ugnt' : targetVerseChanged ? 'target language' : null,
    showDialog
  };
};

export const cleanAlignmentData = function (chapterData) {
  for (let verse of Object.keys(chapterData)) {
    for (let alignment of chapterData[verse].alignments) {
      cleanWordList(alignment.topWords);
    }
  }
  return chapterData;
};

/**
 * Returns the alignment index for the source token if it is not been aligned
 * @param sourceToken
 * @param alignments
 * @return {number}
 */
export const getUnalignedIndex = (sourceToken, alignments) => {
  let pos = 0;
  for (const alignment of alignments) {
    if (pos > sourceToken.tokenPosition) {
      break;
    }
    const numBottomWords = alignment.bottomWords.length;
    const numTopWords = alignment.topWords.length;
    if (numBottomWords === 0 && numTopWords === sourceToken.tokenLength) {
      for (let i = 0; i < numTopWords; i++) {
        // find matching primary word
        if (pos === sourceToken.tokenPosition) {
          // validate text matches
          if (alignment.topWords[i].word !==
            sourceToken.getTokens()[i].toString()) {
            console.error('primary words appear to be out of order.');
          }
          return pos;
        }
        pos++;
      }
    } else {
      // skip primary words that have already been aligned
      pos += numTopWords;
    }
  }
  return -1;
};

const cleanWordList = function (words) {
  for (let word of words) {
    if (word.strongs) {
      word.strong = word.strongs;
      delete word.strongs;
    }
  }
};

/**
 * Strips out punctuation from the verse
 * @param {string} verse - the verse to clean
 * @return {*}
 */
const cleanVerse = (verse) => {
  if (verse) {
    const verseObjects = VerseObjectUtils.getOrderedVerseObjectsFromString(verse);
    const verseObjectsCleaned = VerseObjectUtils.getWordList(verseObjects);
    return VerseObjectUtils.combineVerseArray(verseObjectsCleaned);
  }
};

/**
 * Reduces an array of verse objects to a string without punctutation
 * @param verseObjects
 * @return {*}
 */
const stringifyVerseObjects = (verseObjects) => {
  if(verseObjects) {
    const words = VerseObjectUtils.getWordsFromVerseObjects(verseObjects);
    const filteredWords = words.filter(({type}) => {
      return type === 'word';
    }).map((word) => {
      return VerseObjectUtils.wordVerseObjectFromBottomWord(word, 'text');
    });
    return VerseObjectUtils.combineVerseArray(filteredWords);
  } else {
    return null;
  }
};

/**
 * Reduces the source words in the alignments to a single string.
 * @param alignments
 * @return {*}
 */
const stringifySourceAlignments = ({ alignments }) => {
  if (alignments) {
    const greekVerseArray = ArrayUtils.flattenArray(alignments.map(({ topWords }) => {
      return topWords.map(word => VerseObjectUtils.wordVerseObjectFromBottomWord(word));
    }));
    return VerseObjectUtils.combineVerseArray(greekVerseArray);
  }
};

/**
 * Reduces the target words in the alignments to a single string
 * @param alignments
 * @param wordBank
 * @param verseString
 * @return {*}
 */
export const stringifyTargetAlignments = ({ alignments, wordBank }, verseString) => {
  let verseObjectWithAlignments;
  try {
    verseObjectWithAlignments = aligner.merge(alignments, wordBank, verseString);
  } catch (e) {
    if (e && e.type && e.type === 'InvalidatedAlignments') {
      console.warn(e.message);
      return null;
    }
  }
  if (verseObjectWithAlignments) {
    const verseObjects = VerseObjectUtils.getWordsFromVerseObjects(verseObjectWithAlignments);
    const verseObjectsCleaned = VerseObjectUtils.getWordList(verseObjects);
    return VerseObjectUtils.combineVerseArray(verseObjectsCleaned);
  }
  return null;
};
