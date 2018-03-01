import React from 'react';
import PropTypes from 'prop-types';
import SecondaryWord from '../SecondaryWord';
import Unigram from '../../specs/Unigram';

/**
 * Renders a list of words that need to be aligned
 * @param {Unigram[]} words,
 * @param {int} chapter
 * @param {int} verse
 * @param {object} alignmentData
 * @param {bool} isOver
 * @return {*}
 * @constructor
 */
const WordList = ({
  words,
  chapter,
  verse,
  alignmentData,
  isOver
}) => {
  if (chapter && verse) {
    const wordBank = alignmentData && alignmentData[chapter] &&
      alignmentData[chapter][verse]
        ? alignmentData[chapter][verse].wordBank
        : [];

    const alignments = alignmentData && alignmentData[chapter] &&
    alignmentData[chapter][verse] ?
      alignmentData[chapter][verse].alignments :
      [];

    const alignedWords = [];
    alignments.map(alignment => {
      for(const word of alignment.bottomWords) {
        word.disabled = true;
        alignedWords.push(word);
      }
    });

    const augmentedWordBank = wordBank.concat(alignedWords);

    // TODO: we need to sort these but all the logic is in the core!
    // we can't sort manually here because we don't have the raw verse
    // and if we did we may as well just use the verse.
    // We need to

    if (isOver) {
      return (
        <div style={{
          border: '3px dashed #44C6FF',
          height: '100%',
          width: '100%'
        }}/>
      );
    } else {
      return (
        <React.Fragment>
          {words.map((unigram, index) => {
            const {disabled} = unigram;
            delete unigram.disabled;
            return (
              <div key={index}
                   style={{margin: '10px'}}>
                <SecondaryWord
                  disabled={disabled}
                  word={unigram.token}
                  occurrence={unigram.occurrence}
                  occurrences={unigram.occurrences}
                />
              </div>
            );
          })}
        </React.Fragment>
      );
    }
  }
  return null;
};

WordList.propTypes = {
  words: PropTypes.arrayOf(PropTypes.instanceOf(Unigram)),
  chapter: PropTypes.number,
  verse: PropTypes.number,
  alignmentData: PropTypes.object.isRequired,
  isOver: PropTypes.bool.isRequired
};

export default WordList;
