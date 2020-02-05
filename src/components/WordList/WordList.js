import React from 'react';
import PropTypes from 'prop-types';
import {Token} from 'wordmap-lexer';
import SecondaryToken from '../SecondaryToken';

/**
 * Checks if an element has overflowed it's parent
 * @param element
 * @returns {boolean}
 */
function isOverflown(element) {
  return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
}

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
    this.listRef = React.createRef();
    this.isSelected = this.isSelected.bind(this);
    this.state = {
      width: 0,
      height: 0
    };
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

  getSnapshotBeforeUpdate(prevProps, prevState) {
    if(!prevProps.isOver) {
      return {
        height: this.listRef.current.scrollHeight,
        width: this.listRef.current.clientWidth
      };
    } else {
      return {
        height: 0,
        width: 0
      };
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const notZero = snapshot.width !== 0 && snapshot.height !== 0;
    const changed = snapshot.width !== this.state.width || snapshot.height !== this.state.height;
    if(notZero && changed) {
      this.setState(snapshot);
    }
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
    const {width, height} = this.state;

    if (isOver) {
      return (
        <div
          style={{
            border: '3px dashed #44C6FF',
            height: `${height}px`,
            width: `${width}px`
          }}/>
      );
    } else {

      return (
        <div ref={this.listRef} style={{height: "100%"}}>
          {words.map((token, index) => {
            return (
              <div
                key={index}
                style={{padding: '10px'}}>
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
        </div>
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
