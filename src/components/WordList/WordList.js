import React from 'react';
import PropTypes from 'prop-types';
import { Token } from 'wordmap-lexer';
import ReactTooltip from 'react-tooltip';
import SecondaryToken from '../SecondaryToken';
import { getFontClassName } from '../../common/fontUtils';

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
      height: 0,
    };
  }

  /**
   * Checks if the token is selected
   * @param token
   * @return {boolean}
   */
  isSelected(token) {
    const { selectedWordPositions } = this.props;

    return selectedWordPositions &&
      selectedWordPositions.indexOf(token.tokenPos) !== -1;
  }

  // eslint-disable-next-line no-unused-vars
  getSnapshotBeforeUpdate(prevProps, prevState) {
    if (!prevProps.isOver) {
      return {
        height: this.listRef.current.scrollHeight,
        width: this.listRef.current.clientWidth,
      };
    } else {
      return {
        height: 0,
        width: 0,
      };
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const notZero = snapshot.width !== 0 && snapshot.height !== 0;
    const changed = snapshot.width !== this.state.width || snapshot.height !== this.state.height;

    if (notZero && changed) {
      this.setState(snapshot);
    }
  }

  render() {
    const {
      words,
      isOver,
      direction,
      onWordClick,
      onWordDragged,
      selectedWords,
      targetLanguageFont,
    } = this.props;
    const { width, height } = this.state;

    if (isOver) {
      return (
        <div
          style={{
            border: '3px dashed #44C6FF',
            height: `${height}px`,
            width: `${width}px`,
          }}/>
      );
    } else {
      const targetLanguageFontClassName = getFontClassName(targetLanguageFont);

      return (
        <div ref={this.listRef} style={{ height: '100%' }}>
          {words.map((token, index) => (
            <div
              key={index}
              style={{ padding: '5px 10px' }}>
              <SecondaryToken
                token={token}
                onClick={onWordClick}
                direction={direction}
                onEndDrag={onWordDragged}
                selectedTokens={selectedWords}
                selected={this.isSelected(token)}
                disabled={token.disabled === true}
                targetLanguageFontClassName={targetLanguageFontClassName}
              />
            </div>
          ))}
          <ReactTooltip id="word-overflow-tooltip" className={targetLanguageFontClassName} />
        </div>
      );
    }
  }
}

WordList.propTypes = {
  onWordClick: PropTypes.func,
  onWordDragged: PropTypes.func,
  selectedWords: PropTypes.array,
  isOver: PropTypes.bool.isRequired,
  targetLanguageFont: PropTypes.string,
  direction: PropTypes.oneOf(['ltr', 'rtl']),
  selectedWordPositions: PropTypes.arrayOf(PropTypes.number),
  words: PropTypes.arrayOf(PropTypes.instanceOf(Token)).isRequired,
};

WordList.defaultProps = { direction: 'ltr' };

export default WordList;
