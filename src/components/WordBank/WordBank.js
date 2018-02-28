import React from 'react';
import PropTypes from 'prop-types';
import SecondaryWord from '../SecondaryWord';

/**
 * Renders a list of words that need to be aligned
 * @param {int} chapter
 * @param {int} verse
 * @param {object} alignmentData
 * @param {bool} isOver
 * @return {*}
 * @constructor
 */
const WordBank = ({
  chapter,
  verse,
  alignmentData,
  isOver,
}) => {
  if (chapter && verse) {
    let wordBank = [];
    if (alignmentData[chapter] && alignmentData[chapter][verse]) {
      wordBank = alignmentData && alignmentData[chapter] &&
      alignmentData[chapter][verse]
        ? alignmentData[chapter][verse].wordBank
        : [];
    }

    if(isOver) {
      return (
        <div style={{
          border: '3px dashed #44C6FF',
          height: '100%',
          width: '100%',
        }}/>
      );
    } else {
      return (
        <React.Fragment>
          {wordBank.map((metadata, index) => (
            <div key={index}
                 style={{margin: '10px'}}>
              <SecondaryWord
                word={metadata.word}
                occurrence={metadata.occurrence}
                occurrences={metadata.occurrences}
              />
            </div>
          ))}
        </React.Fragment>
      );
    }
  }
  return null;
};

WordBank.propTypes = {
  chapter: PropTypes.number,
  verse: PropTypes.number,
  alignmentData: PropTypes.object.isRequired,
  isOver: PropTypes.bool.isRequired
};

export default WordBank;
