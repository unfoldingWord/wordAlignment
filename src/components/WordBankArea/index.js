import React from 'react';
import PropTypes from 'prop-types';
// components
import WordBankItem from '../WordBankItem';

const WordBankArea = ({
  contextIdReducer,
  wordAlignmentReducer
}) => {
  if (contextIdReducer.contextId) {
    const { chapter, verse } = contextIdReducer.contextId.reference;
    const {alignmentData} = wordAlignmentReducer;
    let wordBank = [];
    if (alignmentData[chapter] && alignmentData[chapter][verse]) {
      wordBank = wordAlignmentReducer.alignmentData[chapter][verse].wordBank;
    }

    return (
      <div style={{ flex: 0.2, width: '100%', backgroundColor: '#DCDCDC', overflowY: 'auto', padding: '5px 8px 5px 5px' }}>
        {
          wordBank.map((metadata, index) => (
            <WordBankItem
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
  return <div />;
}

WordBankArea.propTypes = {
  contextIdReducer: PropTypes.object.isRequired,
  wordAlignmentReducer: PropTypes.object.isRequired
}

export default WordBankArea;
