import React from 'react';
import PropTypes from 'prop-types';
// components
import TargetBox from '../TargetBox';

const TargetWordsArea = ({
  contextIdReducer,
  wordAlignmentReducer,
  actions
}) => {
  if (contextIdReducer.contextId) {
    let { chapter, verse } = contextIdReducer.contextId.reference;
    let targetWords = wordAlignmentReducer.target[chapter][verse];
    
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', height: '100%', backgroundColor: '#ffffff', padding: '0px 10px 50px', overflowY: 'auto' }}>
        {
          targetWords.map((metadata, index) => (
            <TargetBox
              key={index}
              index={index}
              droppedWords={metadata.sources}
              targetWords={metadata.targets}
              actions={actions}
            />
          ))
        }
      </div>
    );
  }
  return <div />
};

TargetWordsArea.propTypes = {
  wordAlignmentReducer: PropTypes.object.isRequired,
  contextIdReducer: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
}

export default TargetWordsArea;