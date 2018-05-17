import React from 'react';
import PropTypes from 'prop-types';
import SecondaryToken from '../SecondaryToken';
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
        {words.map((token, index) => {
          return (
            <div
              key={index}
              style={{margin: '10px'}}>
              <SecondaryToken
                token={token}
                disabled={token.disabled === true}
              />
            </div>
          );
        })}
      </React.Fragment>
    );
  }
};

WordList.propTypes = {
  words: PropTypes.arrayOf(PropTypes.instanceOf(Token)).isRequired,
  isOver: PropTypes.bool.isRequired
};

export default WordList;
