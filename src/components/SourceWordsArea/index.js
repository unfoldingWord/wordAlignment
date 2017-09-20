import React from 'react';
import PropTypes from 'prop-types';
// components
import SourceBox from '../SourceBox';

const SourceWordsArea = ({
  contextIdReducer,
  wordAlignmentReducer
}) => {
  if (contextIdReducer.contextId) {
    let { chapter, verse } = contextIdReducer.contextId.reference;
    let sourceWords = wordAlignmentReducer.wordBank[chapter][verse];

    return (
      <div style={{ flex: 0.2, width: '100%', backgroundColor: '#DCDCDC', overflowY: 'auto', padding: '5px 8px 5px 5px' }}>
        {
          sourceWords.map((metadata, index) => (
            <SourceBox
              key={index}
              word={metadata.word}
              occurrence={metadata.occurrence}
              occurrences={metadata.occurrences}
            />
          ))
        }
      </div>
    );
  }
  return <div />
}

SourceWordsArea.propTypes = {
  contextIdReducer: PropTypes.object.isRequired,
  wordAlignmentReducer: PropTypes.object.isRequired
}

export default SourceWordsArea;
