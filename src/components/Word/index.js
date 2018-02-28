import React from 'react';
import PropTypes from 'prop-types';
import Word from './Word';
import { DragSource } from 'react-dnd';
import ItemTypes from '../ItemTypes';

/**
 * Renders a draggable word.
 *
 * @property {string} word - the represented word
 * @property {int} occurrence
 * @property {int} occurrences
 */
class DraggableWord extends React.Component {
  render() {
    const {connectDragSource, word, occurrence, occurrences, isDragging} = this.props;
    return connectDragSource(
      <Word word={word}
            occurrence={occurrence}
            occurrences={occurrences}
            isDragging={isDragging}/>
    );
  }
}

DraggableWord.propTypes = {
  word: PropTypes.string.isRequired,
  occurrence: PropTypes.number.isRequired,
  occurrences: PropTypes.number.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired
};

/**
 * Handles drag events on the word
 */
const dragHandler = {
  beginDrag(props) {
    // Return the data describing the dragged item
    return {
      word: props.word,
      occurrence: props.occurrence,
      occurrences: props.occurrences,
      type: ItemTypes.BOTTOM_WORD
    };
  },
  endDrag() { // receives: props, monitor, component
    // When dropped on a compatible target, do something
    // const item = monitor.getItem();
    // console.log(item)
  }
};

export default DragSource(
  ItemTypes.BOTTOM_WORD,
  dragHandler,
  (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  })
)(Word);
