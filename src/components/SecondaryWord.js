import React from 'react';
import PropTypes from 'prop-types';
import Word from './WordCard';
import {DragSource} from 'react-dnd';
import * as types from './WordCard/Types';

/**
 * Renders a draggable secondary word.
 *
 * @see WordCard
 *
 * @property {string} word - the represented word
 * @property {int} occurrence
 * @property {int} occurrences
 */
class SecondaryWord extends React.Component {
  render() {
    const {connectDragSource, word, occurrence, occurrences, disabled, isDragging} = this.props;
    const opacity = isDragging ? 0.4 : 1;

    const wordComponent = (
      <div style={{flex: 1}}>
        <Word word={word}
              disabled={disabled}
              style={{opacity}}
              occurrence={occurrence}
              occurrences={occurrences}/>
      </div>
    );

    if(disabled) {
      return wordComponent;
    } else {
      return connectDragSource(wordComponent);
    }
  }
}

SecondaryWord.propTypes = {
  word: PropTypes.string.isRequired,
  occurrence: PropTypes.number.isRequired,
  occurrences: PropTypes.number.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
  alignmentIndex: PropTypes.number,
  disabled: PropTypes.bool
};

SecondaryWord.defaultProps = {
  alignmentIndex: undefined, // just to be explicit
  disabled: false
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
      type: types.SECONDARY_WORD
    };
  }
};

export default DragSource(
  types.SECONDARY_WORD,
  dragHandler,
  (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  })
)(SecondaryWord);
