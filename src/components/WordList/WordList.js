import React from 'react';
import PropTypes from 'prop-types';
import SecondaryWord from '../SecondaryWord';
import Token from 'word-map/structures/Token';
/**
 * Renders a list of words that need to be aligned.
 * Previously known as the "WordBank".
 * @param {Token[]} words,
 * @param {bool} isOver
 * @return {*}
 * @constructor
 */
const WordList = ({
  words,
  isOver
}) => {
  if (isOver) {
    return (
      <div
        style={{
          border: '3px dashed #44C6FF',
          height: '100%',
          width: '100%'
        }} />
    );
  } else {
    return (
      <React.Fragment>
        {words.map((word, index) => {
          return (
            <div
              key={index}
              style={{margin: '10px'}}>
              <SecondaryWord
                disabled={word.disabled === true}
                word={word.toString()}
                occurrence={word.occurrence}
                occurrences={word.occurrences}
              />
            </div>
          );
        })}
      </React.Fragment>
    );
  }
};

WordList.propTypes = {
  words: PropTypes.arrayOf(PropTypes.instanceOf(Token)),
  isOver: PropTypes.bool.isRequired
};

export default WordList;
