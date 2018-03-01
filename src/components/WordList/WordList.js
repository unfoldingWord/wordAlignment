import React from 'react';
import PropTypes from 'prop-types';
import SecondaryWord from '../SecondaryWord';
import Word from '../../specs/Word';

/**
 * Renders a list of words that need to be aligned
 * @param {Word[]} words,
 * @param {int} chapter
 * @param {int} verse
 * @param {bool} isOver
 * @return {*}
 * @constructor
 */
const WordList = ({
  words,
  chapter,
  verse,
  isOver
}) => {
  if (chapter && verse) {
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
          {words.map((word, index) => {
            return (
              <div key={index}
                   style={{margin: '10px'}}>
                <SecondaryWord
                  disabled={!word.enabled}
                  word={word.token}
                  occurrence={word.occurrence}
                  occurrences={word.occurrences}
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
  words: PropTypes.arrayOf(PropTypes.instanceOf(Word)),
  chapter: PropTypes.number,
  verse: PropTypes.number,
  isOver: PropTypes.bool.isRequired
};

export default WordList;
