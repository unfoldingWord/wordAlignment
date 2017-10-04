import React from 'react';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';
import ItemTypes from '../ItemTypes';

const internalStyle = {
  display: 'flex',
  width: '100%',
  borderLeft: '5px solid #44C6FF',
  padding: '10px',
  textAlign: 'center',
  backgroundColor: '#333333',
  boxShadow: "0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset",
  cursor: 'move',
  color: '#ffffff',
  marginBottom: '5px',
  height: '40px'
};

const TopWordCard = ({
  word,
  style,
  isDragging,
  connectDragSource
}) => {
  const opacity = isDragging ? 0.4 : 1;

  return connectDragSource(
    <span style={{ ...internalStyle, ...style, opacity }}>
      {word}
    </span>
  );
};

TopWordCard.propTypes = {
  word: PropTypes.string.isRequired,
  occurrence: PropTypes.number.isRequired,
  occurrences: PropTypes.number.isRequired,
  alignmentIndex: PropTypes.number,
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
  style: PropTypes.object
};

const DragTopWordCardAction = {
  beginDrag(props) {
    // Return the data describing the dragged item
    const item = {
      word: props.word,
      occurrence: props.occurrence,
      occurrences: props.occurrences,
      alignmentIndex: props.alignmentIndex,
      type: ItemTypes.TOP_WORD
    };
    return item;
  }
};

const collect = (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  };
};

export default DragSource(
  ItemTypes.TOP_WORD,
  DragTopWordCardAction,
  collect
)(TopWordCard);
