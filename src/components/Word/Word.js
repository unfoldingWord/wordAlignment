import React from 'react';
import PropTypes from 'prop-types';
import WordOccurrence from './WordOccurrence';

const styles = {
  root: {
    borderLeft: '5px solid #44C6FF',
    padding: '10px',
    backgroundColor: '#FFFFFF',
    boxShadow: "0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset",
    cursor: 'move',
    display: 'flex',
    flexDirection: 'row'
  },
  word: {
    cursor: 'pointer'
  }
};

/**
 * Renders a single word
 * @param {string} word - the represented word
 * @param {int} occurrence
 * @param {int} occurrences
 * @param {object} [style] - styles passed  through to the component
 * @param {func} [onClick] - callback when the word is clicked
 * @constructor
 */
const Word = ({word, occurrence, occurrences, style, onClick}) => {
  const rootStyles = {...styles.root, ...style};
  let wordStyles = null;
  if(typeof onClick === 'function') {
    wordStyles = styles.word;
  }
  return (
    <div style={rootStyles}>
      <span style={{flex: 1}}>
        <span onClick={onClick} style={wordStyles}>
          {word}
        </span>
      </span>
      <WordOccurrence occurrence={occurrence}
                      occurrences={occurrences}/>
    </div>
  );
};

Word.propTypes = {
  onClick: PropTypes.func,
  style: PropTypes.object,
  occurrence: PropTypes.number,
  occurrences: PropTypes.number,
  word: PropTypes.string.isRequired
};

Word.defaultProps = {
  style: {},
  occurrence: 1,
  occurrences: 1
};

export default Word;
