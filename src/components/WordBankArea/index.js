import React from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
// constants
import ItemTypes from '../ItemTypes';
// components
import WordBankItem from '../WordBankItem';

const WordBankArea = ({
  contextIdReducer,
  wordAlignmentReducer,
  connectDropTarget,
  isOver
}) => {
  if (contextIdReducer.contextId) {
    const { chapter, verse } = contextIdReducer.contextId.reference;
    const {alignmentData} = wordAlignmentReducer;
    let wordBank = [];
    if (alignmentData[chapter] && alignmentData[chapter][verse]) {
      wordBank = wordAlignmentReducer.alignmentData[chapter][verse].wordBank;
    }

    return connectDropTarget(
      <div style={{ flex: 0.2, width: '100%', backgroundColor: '#DCDCDC', overflowY: 'auto', padding: '5px 8px 5px 5px' }}>
        {
          isOver ? <div style={{ border: '3px dashed #44C6FF', height: '100%', width: '100%' }}></div>
          :
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
};

WordBankArea.propTypes = {
  contextIdReducer: PropTypes.object.isRequired,
  wordAlignmentReducer: PropTypes.object.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  isOver: PropTypes.bool.isRequired
};

const wordBankAreaItemAction = {
  drop(props, monitor) {
    props.actions.moveBackToWordBank(monitor.getItem());
  }
};

const collect = (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  };
};

export default DropTarget(
  ItemTypes.BOTTOM_WORD, // itemType
  wordBankAreaItemAction,
  collect
)(WordBankArea);
