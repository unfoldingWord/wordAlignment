import React, {Component} from 'react';
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

class BottomWordCard extends Component {
  render() {
    const { word, style, isDragging, connectDragSource } = this.props;
    const opacity = isDragging ? 0.4 : 1;

    return connectDragSource(
      <span style={{ ...internalStyle, ...style, opacity }}>
        {word}
      </span>
    );
  }
}

BottomWordCard.propTypes = {
  word: PropTypes.string.isRequired,
  occurrence: PropTypes.number.isRequired,
  occurrences: PropTypes.number.isRequired,
  alignmentIndex: PropTypes.number,
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
  style: PropTypes.object
};

const DragBottomWordCardAction = {
  beginDrag(props) {
    // Return the data describing the dragged item
    const item = {
      word: props.word,
      occurrence: props.occurrence,
      occurrences: props.occurrences,
      alignmentIndex: props.alignmentIndex
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
  ItemTypes.BOTTOM_WORD,
  DragBottomWordCardAction,
  collect
)(BottomWordCard);
