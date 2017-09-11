import React from 'react';
import PropTypes from 'prop-types';
// components
import TargetBox from '../TargetBox';

const TargetWordsArea = ({
  contextIdReducer,
  resourcesReducer
}) => {
  if (contextIdReducer.contextId) {
    let { chapter, verse } = contextIdReducer.contextId.reference;
    let targetWords = resourcesReducer.bibles.ugnt[chapter][verse]

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', height: '100%', backgroundColor: '#ffffff', padding: '0px 10px 50px', overflowY: 'auto' }}>
        {
          targetWords.map((targetWordObject, index) => (
            <TargetBox key={index} targetWord={targetWordObject.word} />
          ))
        }
      </div>
    );
  }
  return <div />
};

TargetWordsArea.propTypes = {
  contextIdReducer: PropTypes.object.isRequired,
  resourcesReducer: PropTypes.object.isRequired
}

export default TargetWordsArea;