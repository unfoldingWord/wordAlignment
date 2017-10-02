/**
 * @description - Get the lexiconId from the strongs number
 * @param {String} strongs - the strongs number to get the entryId from
 * @return {String} - the id of the lexicon
 */
export const lexiconIdFromStrongs = (strongs) => {
  const lexiconId = (strongs.replace(/\d+/,'') === 'G') ? 'ugl': 'uhl';
  return lexiconId;
}
/**
 * @description - Get the lexicon entryId from the strongs number
 * @param {String} strongs - the strongs number to get the entryId from
 * @return {Int} - the number of the entry
 */
export const lexiconEntryIdFromStrongs = (strongs) => {
  const entryId = parseInt(strongs.replace(/\w/,'').slice(0,-1));
  return entryId;
}
