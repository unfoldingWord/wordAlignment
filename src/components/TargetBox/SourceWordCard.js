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
  backgroundColor: '#FFFFFF',
  boxShadow: "0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset",
  cursor: 'move'
};

const DragSourceWordCardAction = {
  beginDrag(props) {
    // Return the data describing the dragged item
    const item = { id: props.id, word: props.word };
    return item;
  },
  endDrag(props, monitor, component) {
    // When dropped on a compatible target, do something
    const item = monitor.getItem();
    // console.log(item)
  }
};

const SourceWordCard = ({
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

SourceWordCard.propTypes = {
  word: PropTypes.string.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
  style: PropTypes.object
}

export default DragSource(
  ItemTypes.CARD,
  DragSourceWordCardAction,
  (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  })
)(SourceWordCard);