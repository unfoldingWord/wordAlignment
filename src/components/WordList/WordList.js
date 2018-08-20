import React from 'react';
import PropTypes from 'prop-types';
import SecondaryToken from '../SecondaryToken';
import Token from 'word-map/structures/Token';
/**
 * Renders a list of words that need to be aligned.
 * Previously known as the "WordBank".
 * @param {function} onWordDragged - executed when a word is dragged and dropped away from the word list
 * @param {object[]} selectedWords - an array of words that are selected
 * @param {function} onWordClick - called when a word in the list is clicked
 * @param {Token[]} words,
 * @param {boolean} isOver
 * @return {*}
 * @constructor
 */
const WordList = ({
  onWordDragged,
  selectedWords,
  onWordClick,
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
                onEndDrag={onWordDragged}
                selectedTokens={selectedWords}
                onClick={onWordClick}
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
  onWordDragged: PropTypes.func.isRequired,
  selectedWords: PropTypes.array,
  onWordClick: PropTypes.func.isRequired,
  words: PropTypes.arrayOf(PropTypes.instanceOf(Token)).isRequired,
  isOver: PropTypes.bool.isRequired
};

export default WordList;
