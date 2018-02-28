import React from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import ItemTypes from '../ItemTypes';
import WordBankItem from '../WordBankItem';

/**
 * Renders a list of words that need to be aligned
 * @param {string} chapter
 * @param {string} verse
 * @param {object} alignmentData
 * @param {func} connectDropTarget
 * @param {bool} isOver
 * @return {*}
 * @constructor
 */
const WordBankArea = ({
  chapter,
  verse,
  alignmentData,
  connectDropTarget,
  isOver
}) => {
  if (chapter && verse) {
    let wordBank = [];
    if (alignmentData[chapter] && alignmentData[chapter][verse]) {
      wordBank = alignmentData && alignmentData[chapter] &&
      alignmentData[chapter][verse]
        ? alignmentData[chapter][verse].wordBank
        : [];
    }

    return connectDropTarget(
      <div style={{
        flex: 0.2,
        width: '100%',
        backgroundColor: '#DCDCDC',
        overflowY: 'auto',
        padding: '5px 8px 5px 5px'
      }}>
        {
          isOver ? <div style={{
              border: '3px dashed #44C6FF',
              height: '100%',
              width: '100%'
            }}/>
            : wordBank.map((metadata, index) => (
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
  return null;
};

WordBankArea.propTypes = {
  chapter: PropTypes.string.isRequired,
  verse: PropTypes.string.isRequired,
  alignmentData: PropTypes.object.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  isOver: PropTypes.bool.isRequired,
  moveBackToWordBank: PropTypes.func.isRequired
};

const wordBankAreaItemAction = {
  drop (props, monitor) {
    props.moveBackToWordBank(monitor.getItem());
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
