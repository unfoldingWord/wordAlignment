import React from 'react';
import PropTypes from 'prop-types';
import {Token} from 'wordmap-lexer';
import SecondaryToken from '../SecondaryToken';

/**
 * Renders a list of words that need to be aligned.
 * Previously known as the "WordBank".
 * @param {function} onWordDragged - executed when a word is dragged and dropped away from the word list
 * @param {number[]} selectedWordPositions - an array of words that are selected
 * @param {object[]} selectedWords - an array of words that are selected
 * @param {function} onWordClick - called when a word in the list is clicked
 * @param {Token[]} words,
 * @param {boolean} isOver
 * @return {*}
 * @constructor
 */
class WordList extends React.Component {

  constructor(props) {
    super(props);
    this.isSelected = this.isSelected.bind(this);
  }

  /**
   * Checks if the token is selected
   * @param token
   * @return {boolean}
   */
  isSelected(token) {
    const {
      selectedWordPositions
    } = this.props;

    return selectedWordPositions &&
      selectedWordPositions.indexOf(token.tokenPos) !== -1;
  }

  render() {
    const {
      onWordDragged,
      selectedWords,
      onWordClick,
      direction,
      words,
      isOver
    } = this.props;

    if (isOver) {
      return (
        <div
          style={{
            border: '3px dashed #44C6FF',
            height: '100%',
            width: '100%'
          }}/>
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
                  direction={direction}
                  onEndDrag={onWordDragged}
                  selected={this.isSelected(token)}
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
  }
}

WordList.propTypes = {
  onWordDragged: PropTypes.func,
  selectedWords: PropTypes.array,
  selectedWordPositions: PropTypes.arrayOf(PropTypes.number),
  onWordClick: PropTypes.func,
  words: PropTypes.arrayOf(PropTypes.instanceOf(Token)).isRequired,
  isOver: PropTypes.bool.isRequired,
  direction: PropTypes.oneOf(['ltr', 'rtl'])
};

WordList.defaultProps = {
  direction: 'ltr'
};

export default WordList;
