import { BIBLE_BOOKS } from '../common/booksOfTheBible';
import {
  OT_ORIG_LANG,
  NT_ORIG_LANG,
  OT_ORIG_LANG_BIBLE,
  NT_ORIG_LANG_BIBLE,
} from '../common/constants';

/**
 * tests if book is a Old Testament book
 * @param bookId
 * @return {boolean}
 */
export function isOldTestament(bookId) {
  return bookId in BIBLE_BOOKS.oldTestament;
}

/**
 * determine Original Language and Original Language bible for book
 * @param bookId
 * @return {{resourceLanguage: string, bibleID: string}}
 */
export function getOrigLangforBook(bookId) {
  const isOT = isOldTestament(bookId);
  const languageId = (isOT) ? OT_ORIG_LANG : NT_ORIG_LANG;
  const bibleId = (isOT) ? OT_ORIG_LANG_BIBLE : NT_ORIG_LANG_BIBLE;
  return { languageId, bibleId };
}

/**
 * returns true if this bookId and languageId match the original language bible
 * @param {String} languageId
 * @param {String} bookId
 * @return {boolean}
 */
export function isOriginalLanguageBible(languageId, bookId) {
  return ((languageId.toLowerCase() === NT_ORIG_LANG && bookId.toLowerCase() === NT_ORIG_LANG_BIBLE) ||
    (languageId.toLowerCase() === OT_ORIG_LANG && bookId.toLowerCase() === OT_ORIG_LANG_BIBLE));
}

/**
 * returns true if this bookId and languageId match the original language bible
 * @param {String} languageId
 * @return {boolean}
 */
export function isOriginalLanguage(languageId) {
  return (languageId.toLowerCase() === NT_ORIG_LANG || languageId.toLowerCase() === OT_ORIG_LANG);
}

/**
 * get bible from bibles
 * @param {object} bibles
 * @param {string} languageId
 * @param {string} owner
 * @param {string} bibleId
 * @return {*}
 */
export function getBibleElement(bibles, languageId, bibleId, owner = null) {
  const key = (owner && languageId !== 'targetLanguage') ? `${languageId}_${owner}` : languageId;
  const bibleElement = bibles[key]?.[bibleId];
  return bibleElement;
}
