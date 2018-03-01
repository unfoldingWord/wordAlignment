/**
 * @description - Get the lexiconId from the strong's number
 * @param {String} strong - the strong's number to get the entryId from
 * @return {String} - the id of the lexicon
 */
export const lexiconIdFromStrongs = (strong) => {
  const lexiconId = (strong.replace(/\d+/, '') === 'G') ? 'ugl' : 'uhl';
  return lexiconId;
};
/**
 * @description - Get the lexicon entryId from the strong's number
 * @param {String} strong - the strong's number to get the entryId from
 * @return {Int} - the number of the entry
 */
export const lexiconEntryIdFromStrongs = (strong) => {
  const entryId = parseInt(strong.replace(/\w/, '').slice(0, -1));
  return entryId;
};
