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
    const opacity = isDragging ? 0.4 : 1;

    return connectDragSource(
      <div>
        <Word word={word}
              style={{opacity}}
              occurrence={occurrence}
              occurrences={occurrences}/>
      </div>
    );
  }
}

DraggableWord.propTypes = {
  word: PropTypes.string.isRequired,
  occurrence: PropTypes.number.isRequired,
  occurrences: PropTypes.number.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
  alignmentIndex: PropTypes.number
};

DraggableWord.defaultProps = {
  alignmentIndex: undefined // just to be explicit
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
      alignmentIndex: props.alignmentIndex,
      type: ItemTypes.SECONDARY_WORD
    };
  }
};

export default DragSource(
  ItemTypes.SECONDARY_WORD,
  dragHandler,
  (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  })
)(DraggableWord);
