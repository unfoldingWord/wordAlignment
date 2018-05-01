import React from 'react';
import PropTypes from 'prop-types';
import Word from './WordCard';
import {DragSource} from 'react-dnd';
import * as types from './WordCard/Types';
import Token from 'word-map/structures/Token';

/**
 * Renders a draggable secondary word.
 *
 * @see WordCard
 *
 * @property {string} word - the represented word
 * @property {int} occurrence
 * @property {int} occurrences
 */
class SecondaryToken extends React.Component {
  render() {
    const {
      connectDragSource,
      token,
      disabled,
      isDragging
    } = this.props;
    const opacity = isDragging ? 0.4 : 1;

    const wordComponent = (
      <div
        style={{flex: 1}}
      >
        <Word
          word={token.text}
          disabled={disabled}
          style={{opacity}}
          occurrence={token.occurrence}
          occurrences={token.occurrences}/>
      </div>
    );

    if(disabled) {
      return wordComponent;
    } else {
      return connectDragSource(wordComponent);
    }
  }
}

SecondaryToken.propTypes = {
  token: PropTypes.instanceOf(Token).isRequired,
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
  alignmentIndex: PropTypes.number,
  disabled: PropTypes.bool
};

SecondaryToken.defaultProps = {
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
      word: props.token.text,
      occurrence: props.token.occurrence,
      occurrences: props.token.occurrences,
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
)(SecondaryToken);
