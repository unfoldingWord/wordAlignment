import React, { Component } from 'react';
import PropTypes from 'prop-types';
import WordOccurrence from './WordOccurrence';

const internalStyle = {
  borderLeft: '5px solid #44C6FF',
  padding: '5px',
  margin: '10px',
  backgroundColor: '#FFFFFF',
  boxShadow: "0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset",
  cursor: 'move',
  display: 'flex',
  flexDirection: 'row'
};

/**
 * Renders a single word
 * @property {string} word - the represented word
 * @property {int} occurrence
 * @property {int} occurrences
 */
class Word extends Component {
  render() {
    const { word, isDragging, occurrence, occurrences } = this.props;
    const opacity = isDragging ? 0.4 : 1;

    return (
      <div style={{ ...internalStyle, opacity }}>
        <span style={{flex: 1}}>
          {word}
        </span>
        <WordOccurrence occurrence={occurrence}
                        occurrences={occurrences}/>
      </div>
    );
  }
}

Word.propTypes = {
  word: PropTypes.string.isRequired,
  occurrence: PropTypes.number.isRequired,
  occurrences: PropTypes.number.isRequired,
  isDragging: PropTypes.bool.isRequired
};

export default Word;
