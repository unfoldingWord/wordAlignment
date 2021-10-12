import { getVerseSpanRange, verseComparator } from '../index';

describe('verseComparator', () => {
  it('sorting verse order', () => {
    //given
    const chapter = '1';
    const verses = ['before', '4', '3', '1-2' ];
    const currentBible = createChapterWithVerses(chapter, verses);
    const expectedVerseOrder = ['1-2', '3', '4', 'before'];

    //when
    const sortedVerses = Object.keys(currentBible[chapter]).sort(verseComparator);

    //then
    expect(sortedVerses).toEqual(expectedVerseOrder);
  });
});

describe('getVerseSpanRange', () => {
  it('should succeed', () => {
    //given
    const verses = '1-2';
    const expectedResult = {
      low: 1,
      high: 2,
    };

    //when
    const verseSpan = getVerseSpanRange(verses);

    //then
    expect(verseSpan).toEqual(expectedResult);
  });
});

//
// Helper functions
//

/**
 * create dummy content for verse
 * @param {string} verse
 * @return {string}
 */
function createVerseContent(verse) {
  return `${verse}-Content`;
}

/**
 * create dummy Bible with given chapter and verses
 * @param {string} chapter
 * @param {array} verses
 * @return {object}
 */
function createChapterWithVerses(chapter, verses) {
  const chapterData = {};

  for (let verse of verses) {
    chapterData[verse] = createVerseContent(verse);
  }

  return { [chapter]: chapterData };
}
