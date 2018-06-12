import React from 'react';
import PropTypes from 'prop-types';
import WordOccurrence from './WordOccurrence';
import CancelIcon from 'material-ui/svg-icons/navigation/cancel';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

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
    word: {
      flexGrow: 2
    }
  };

  if (isSuggestion) {
    styles.root.borderLeft = '5px solid #1b7729';
  }

  if (disabled) {
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
 * Renders controls for suggestions
 * @param {bool} isSuggestion
 * @param {func} onClick
 * @return {*}
 * @constructor
 */
const SuggestionControls = ({isSuggestion, onClick}) => {
  if (isSuggestion) {
    return (
      <MuiThemeProvider>
        <CancelIcon onClick={onClick} style={{
          width: 20,
          height: 20,
          verticalAlign: 'middle',
          marginLeft: 5,
          color: '#808080'
        }}/>
      </MuiThemeProvider>
    );
  } else {
    return null;
  }
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
    this._handleCancelClick = this._handleCancelClick.bind(this);
  }

  /**
   * Handles click events on the word title.
   * If the word is disabled the click event will be blocked.
   * @param e
   * @private
   */
  _handleClick(e) {
    const {disabled, onClick} = this.props;
    if (!disabled && typeof onClick === 'function') {
      onClick(e);
    }
  }

  /**
   * Handles clicking the cancel button on suggestions
   * @param e
   * @private
   */
  _handleCancelClick(e) {
    const {onCancel} = this.props;
    if(typeof onCancel === 'function') {
      onCancel(e);
    }
  }

  render() {
    const {word, occurrence, occurrences, isSuggestion} = this.props;
    const styles = makeStyles(this.props);
    return (
      <div style={{flex: 1}}>
        <div style={styles.root}>
        <span style={{flex: 1, display: 'flex'}}>
          <span onClick={this._handleClick} style={styles.word}>
            {word}
          </span>
          <SuggestionControls isSuggestion={isSuggestion}
                              onClick={this._handleCancelClick}/>
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
  onCancel: PropTypes.func,
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
