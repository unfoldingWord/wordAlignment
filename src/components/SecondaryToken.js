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

  constructor(props) {
    super(props);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleCancel() {
    const {onCancel, token} = this.props;
    if (typeof onCancel === 'function') {
      onCancel(token);
    }
  }

  handleClick() {
    const {token, onAccept, onClick} = this.props;
    if (token.meta.suggestion) {
      onAccept(token);
    } else if (!token.disabled) {
      onClick(token);
    }
  }

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
        onClick={this.handleClick}
      >
        <Word
          word={token.text}
          disabled={disabled}
          style={{opacity}}
          onCancel={this.handleCancel}
          isSuggestion={token.meta.suggestion}
          occurrence={token.occurrence}
          occurrences={token.occurrences}/>
      </div>
    );

    if (disabled) {
      return wordComponent;
    } else {
      return connectDragSource(wordComponent);
    }
  }
}

SecondaryToken.propTypes = {
  selectedTokens: PropTypes.array,
  onEndDrag: PropTypes.func,
  onClick: PropTypes.func,
  onCancel: PropTypes.func,
  onAccept: PropTypes.func,
  token: PropTypes.instanceOf(Token).isRequired,
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
  alignmentIndex: PropTypes.number,
  disabled: PropTypes.bool
};

SecondaryToken.defaultProps = {
  onClick: () => {
  },
  onAccept: () => {
  },
  alignmentIndex: undefined,
  disabled: false,
  selectedTokens: []
};

/**
 * Handles drag events on the word
 */
const dragHandler = {
  beginDrag(props) {
    // Return the data describing the dragged item
    const {token} = props;
    token.type = types.SECONDARY_WORD;
    let tokens = [];
    if(props.selectedTokens) {
      tokens = [...props.selectedTokens];
    }
    return {
      tokens,
      token: props.token,
      alignmentIndex: props.alignmentIndex,
      type: types.SECONDARY_WORD
    };
  },
  endDrag(props, monitor) {
    const dropResult = monitor.getDropResult();
    if (dropResult && typeof props.onEndDrag === 'function') {
      props.onEndDrag();
    }
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
