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
    lineHeight: '150%'
  }
};

/**
 * Renders an error screen
 * @param {func} translate - the localization function
 * @param {*} error - the error object
 * @param {*} info - the info object
 * @return {*}
 * @constructor
 */
const BrokenScreen = ({translate, error, info}) => {
  const errorMessage = JSON.stringify(error, null);
  const infoMessage = JSON.stringify(info, null);

  const errorHtml = errorMessage.replace(/ /g, '&nbsp;').replace(/\\n/g, '<br/>');
  const infoHtml = infoMessage.replace(/ /g, '&nbsp;').replace(/\\n/g, '<br/>');
  return (
    <div style={styles.root}>
      <h1 style={styles.title}>{translate('tool_broken')}</h1>
      <div className="log">
        <h2>Error</h2>
        <p>{error.message}</p>
        <div style={styles.code} dangerouslySetInnerHTML={{__html: errorHtml}}/>
        <h2>Info</h2>
        <div style={styles.code} dangerouslySetInnerHTML={{__html: infoHtml}}/>
      </div>
    </div>
  );
};

BrokenScreen.propTypes = {
  translate: PropTypes.func.isRequired,
  error: PropTypes.any,
  info: PropTypes.any
};

export default BrokenScreen;
