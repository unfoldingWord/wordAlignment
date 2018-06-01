import React from 'react';
import PropTypes from 'prop-types';
import WordOccurrence from './WordOccurrence';

/**
 * Generates the component styles
 * @param props
 * @return {object}
 */
const makeStyles = (props) => {
  const {onClick, disabled, style, isSuggestion} = props;

  const styles = {
    root: {
      borderLeft: '5px solid #44C6FF',
      padding: '10px',
      backgroundColor: '#FFFFFF',
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'row',
      ...style
    },
    word: {}
  };

  if(isSuggestion) {
    styles.root.borderLeft = '5px solid #1b7729';
  }

  if(disabled) {
    styles.root = {
      ...styles.root,
      borderLeft: '5px solid #868686',
      opacity: 0.3,
      cursor: 'not-allowed',
      userSelect: 'none'
    };
  }

  if (!disabled && typeof onClick === 'function') {
    styles.word = {
      ...styles.word,
      cursor: 'pointer'
    };
  }

  return styles;
};

/**
 * Renders a standard word.
 *
 * @param {string} word - the represented word
 * @param {int} occurrence
 * @param {int} occurrences
 * @param {object} [style] - styles passed  through to the component
 * @param {func} [onClick] - callback when the word is clicked
 * @param {bool} [disabled] - indicates the word is disabled
 * @constructor
 */
class WordCard extends React.Component {

  constructor(props) {
    super(props);
    this._handleClick = this._handleClick.bind(this);
  }

  /**
   * Handles click events on the word title.
   * This may block the event if the word is disabled
   * @param e
   * @private
   */
  _handleClick(e) {
    const {disabled, onClick} = this.props;
    if(!disabled && typeof onClick === 'function') {
      onClick(e);
    }
  }

  render() {
    const {word, occurrence, occurrences} = this.props;
    const styles = makeStyles(this.props);
    return (
      <div style={{flex: 1}}>
        <div style={styles.root}>
        <span style={{flex: 1}}>
          <span onClick={this._handleClick} style={styles.word}>
            {word}
          </span>
        </span>
          <WordOccurrence occurrence={occurrence}
                          occurrences={occurrences}/>
        </div>
      </div>
    );
  }
}

WordCard.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  style: PropTypes.object,
  occurrence: PropTypes.number,
  occurrences: PropTypes.number,
  word: PropTypes.string.isRequired,
  isSuggestion: PropTypes.bool
};

WordCard.defaultProps = {
  style: {},
  occurrence: 1,
  occurrences: 1,
  disabled: false,
  isSuggestion: false
};

export default WordCard;
