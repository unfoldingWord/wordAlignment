import React from 'react';
import PropTypes from 'prop-types';
// components
import SourceBox from '../SourceBox';

const SourceWordsArea = ({
  contextIdReducer,
  resourcesReducer
}) => {
  if (contextIdReducer.contextId) {
    let { chapter, verse } = contextIdReducer.contextId.reference;
    let sourceWords = resourcesReducer.bibles.ulb[chapter][verse].split(" ");

    return (
      <div style={{ flex: 0.2, width: '100%', backgroundColor: '#DCDCDC', overflowY: 'auto', padding: '5px 8px 5px 5px' }}>
        {
          sourceWords.map((word, index) => (
            <SourceBox key={index} id={index} word={word} />
          ))
        }
      </div>
    );
  }
  return <div />
}

SourceWordsArea.propTypes = {
  contextIdReducer: PropTypes.object.isRequired,
  resourcesReducer: PropTypes.object.isRequired
}

export default SourceWordsArea;
