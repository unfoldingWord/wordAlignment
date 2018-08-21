import React from 'react';
import PropTypes from 'prop-types';
import Word from './WordCard';
import {DragSource} from 'react-dnd';
import * as types from './WordCard/Types';
import Token from 'word-map/structures/Token';
import path from 'path-extra';

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
    this.initDragPreview = this.initDragPreview.bind(this);
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
    } else if (!token.disabled && onClick) {
      onClick(token);
    }
  }

  /**
   * Sets the correct drag preview to use.
   */
  initDragPreview() {
    const {
      selectedTokens,
      connectDragPreview,
    } = this.props;
    if (selectedTokens && selectedTokens.length > 1 && connectDragPreview) {
      const img = new Image();
      img.onload = () => connectDragPreview(img);
      img.src = path.join(__dirname, '../assets/multi_drag_preview.png');
    } else if (connectDragPreview) {
      // use default preview
      connectDragPreview(null);
    }
  }

  render() {
    const {
      connectDragSource,
      token,
      disabled,
      isDragging,
      selected
    } = this.props;
    const opacity = isDragging ? 0.4 : 1;

    this.initDragPreview();

    const wordComponent = (
      <div
        style={{flex: 1}}
        onClick={this.handleClick}
      >
        <Word
          selected={selected}
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
  selected: PropTypes.bool,
  selectedTokens: PropTypes.array,
  onEndDrag: PropTypes.func,
  onClick: PropTypes.func,
  onCancel: PropTypes.func,
  onAccept: PropTypes.func,
  token: PropTypes.instanceOf(Token).isRequired,
  connectDragPreview: PropTypes.func.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
  alignmentIndex: PropTypes.number,
  disabled: PropTypes.bool
};

SecondaryToken.defaultProps = {
  isSelected: false,
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
    const tokens = [];
    if (props.selectedTokens) {
      let isSourceSelected = false;
      for (let i = 0; i < props.selectedTokens.length; i++) {
        tokens.push(props.selectedTokens[i]);
        if (props.selectedTokens[i].tokenPos === token.tokenPos) {
          isSourceSelected = true;
        }
      }
      // TRICKY: include the dragged token to the selection
      if (!isSourceSelected) {
        tokens.push(token);
      }
    } else {
      // TRICKY: always populate tokens.
      tokens.push(token);
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

/**
 * Specifies which props to inject into the component
 * @param connect
 * @param monitor
 */
const collect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
  connectDragPreview: connect.dragPreview()
});

export default DragSource(
  types.SECONDARY_WORD,
  dragHandler,
  collect
)(SecondaryToken);
