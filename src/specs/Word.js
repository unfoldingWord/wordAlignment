import Unigram from './Unigram';

/**
 * Represents a single word within a sentence.
 * Words can be enabled/disabled to prevent certain actions in the context where they are used.
 * 
 * @see Unigram
 */
class Word extends Unigram {
  constructor(word, occurrence=1, occurrences=1) {
    super(word, occurrence, occurrences);
    this._enabled=true;
  }

  /**
   * Checks if the word is enabled
   * @return {boolean}
   */
  get enabled() {
    return this._enabled;
  }

  /**
   * Disables the word
   */
  enable() {
    this._enabled = true;
  }

  /**
   * Enables the word
   */
  disable() {
    this._enabled = false;
  }
}

export default Word;
