import React from 'react';
import PropTypes from 'prop-types';

/**
 * Generates styles for the tooltip.
 * This may take parameters later if we enhance the tooltip.
 * @return {object}
 */
const makeStyles = () => {
  return {
    root: {
      visibility: 'visible',
      position: 'absolute',
      width: '120px',
      backgroundColor: '#555',
      color: '#fff',
      textAlign: 'center',
      padding: '5px 0',
      borderRadius: '6px',
      zIndex: '1',
      opacity: '1',
      transition: 'opacity .6s',

      left: '50%',
      transform: 'translateX(-50%)',

      marginTop: '7px'
    },
    message: {

    },
    after: {
      content: '',
      position: 'absolute',
      bottom: '100%',
      left: '50%',
      marginLeft: '-5px',
      borderWidth: '5px',
      borderStyle: 'solid',
      borderColor: 'transparent transparent #555 transparent',
      boxSizing: 'inherit',

      marginTop: '-5px',
    }
  };
};

/**
 * Renders a tooltip.
 *
 * @param {string} message - the tooltip message
 * @return {*}
 * @constructor
 */
const Tooltip = ({ message }) => {
  const styles = makeStyles();
  return (
    <div style={styles.root}>
      <div style={styles.message}>{message}</div>
      <div style={styles.after} />
    </div>
  );
};

Tooltip.propTypes = {
  message: PropTypes.string.isRequired
};

export default Tooltip;
