/**
 * @description - Get the lexiconId from the strong's number
 * @param {String} strong - the strong's number to get the entryId from
 * @return {String} - the id of the lexicon
 */
export const lexiconIdFromStrongs = (strong) => {
  return (strong.replace(/\d+/, '') === 'G') ? 'ugl' : 'uhl';
};
/**
 * @description - Get the lexicon entryId from the strong's number
 * @param {String} strong - the strong's number to get the entryId from
 * @return {number} - the number of the entry
 */
export const lexiconEntryIdFromStrongs = (strong) => {
  return parseInt(strong.replace(/\w/, '').slice(0, -1));
};
