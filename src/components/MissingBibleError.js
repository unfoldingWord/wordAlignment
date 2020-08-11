import React from 'react';
import PropTypes from 'prop-types';

/**
 * Renders an error box indicating a bible is missing
 * @param {func} translate
 * @return {*}
 * @constructor
 */
const MissingBibleError = ({ translate }) => (
  <div id='AlignmentGrid' style={{
    display: 'flex',
    flexWrap: 'wrap',
    backgroundColor: '#ffffff',
    padding: '0px 10px 10px',
    overflowY: 'auto',
    flexGrow: 2,
    alignContent: 'flex-start',
  }}>
    <div style={{ flexGrow: 1 }}>
      <div style={{
        padding: '20px',
        backgroundColor: '#ccc',
        display: 'inline-block',
      }}>
        {translate('pane.missing_verse_warning')}
      </div>
    </div>
  </div>
);

MissingBibleError.propTypes = { translate: PropTypes.func.isRequired };

export default MissingBibleError;
