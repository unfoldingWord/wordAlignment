/**
 * Represents a single token within a given context e.g. a sentence.
 */
class Unigram {

  /**
   * @constructor
   * @param {string} token
   * @param {int} occurrence - the 1 indexed order in which this token occurs in the context.
   * @param {int} occurrences - the number of times this token occurs in the context
   */
  constructor(token, occurrence=1, occurrences=1) {
    this.token = token;
    this.occurrence = occurrence;
    this.occurrences = occurrences;
  }
}

export default Unigram;
