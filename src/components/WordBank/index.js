import React from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import ItemTypes from '../ItemTypes';
import WordBank from './WordBank';

/**
 * Renders a word bank with drag-drop support
 */
class DroppableWordBank extends React.Component {
  render() {
    const {chapter, verse, alignmentData, connectDropTarget, isOver} = this.props;

    return connectDropTarget(
      <div>
        <WordBank chapter={chapter}
                  verse={verse}
                  alignmentData={alignmentData}
                  isOver={isOver}/>
      </div>
    );
  }
}

DroppableWordBank.propTypes = {
  chapter: PropTypes.number,
  verse: PropTypes.number,
  alignmentData: PropTypes.object.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  isOver: PropTypes.bool.isRequired,
  moveBackToWordBank: PropTypes.func.isRequired
};

/**
 * Handles drag events on the word bank
 */
const dragHandler = {
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
  ItemTypes.BOTTOM_WORD,
  dragHandler,
  collect
)(DroppableWordBank);
