import React from 'react';
import PropTypes from 'prop-types';

const styles = {
  top: 7,
  opacity: '0.8',
  marginTop: '5px',
  marginRight: '10px',
  padding: '2px 0px 0px 0px',
};

/**
 * Renders a words occurrence.
 * This is rendered as a superscript.
 * @param {int} occurrence - the order in which this word occurs (1 indexed).
 * @param {int} occurrences - how many times this word occurs in the context
 * @param {object} [style] - overrides the default styles
 * @return {*}
 * @constructor
 */
const WordOccurrence = ({occurrence, occurrences, style}) => {
  const computedStyles = {
    ...styles,
    ...style
  };
  if (occurrences > 1) {
    return <sup style={computedStyles}>{occurrence}</sup>;
  } else {
    return null;
  }
};

WordOccurrence.propTypes = {
  occurrence: PropTypes.number.isRequired,
  occurrences: PropTypes.number.isRequired,
  style: PropTypes.object
};

export default WordOccurrence;
