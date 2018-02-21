import React from 'react';
import PropTypes from 'prop-types';

const styles = {
  root: {
    width: '100%',
    margin: '40px'
  },
  title: {
    textAlign: 'center',
    width: '100%'
  },
  code: {
    color: '#cc3939',
    backgroundColor: '#ffe6e6',
    lineHeight: '150%',
    whiteSpace: 'pre-wrap'
  }
};

/**
 * Renders an error screen
 * @param {string} title - the title of the broken screen
 * @param {*} error - the error object
 * @param {*} info - the info object
 * @return {*}
 * @constructor
 */
const BrokenScreen = ({title, error, info}) => {
  return (
    <div style={styles.root}>
      <h1 style={styles.title}>{title}</h1>
      <details style={styles.code}>
        {error && error.toString()}
        <br/>
        {info.componentStack}
      </details>
    </div>
  );
};

BrokenScreen.propTypes = {
  title: PropTypes.string.isRequired,
  error: PropTypes.any.isRequired,
  info: PropTypes.any.isRequired
};

export default BrokenScreen;
