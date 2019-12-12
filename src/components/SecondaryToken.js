import React from 'react';
import PropTypes from 'prop-types';
import {DragSource} from 'react-dnd';
import {Token} from 'wordmap-lexer';
import path from 'path-extra';
import * as types from './WordCard/Types';
import Word from './WordCard';

/**
 * Checks if a token exists within the list
 * @param {object[]} list - an array of tokens
 * @param {object} token - a single token
 * @return {boolean} - true if the token exists within the list
 */
function containsToken(list, token) {
  for (let i = 0; i < list.length; i++) {
    if (list[i].tokenPos === token.tokenPos) {
      return true;
    }
  }
}

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

  handleClick(e) {
    e.stopPropagation();
    const {token, onAccept, onClick} = this.props;
    if (token.meta.suggestion) {
      onAccept(token);
    } else if (!token.disabled && onClick) {
      const buttonDiv = e.currentTarget.getElementsByTagName('DIV')[0].getElementsByTagName('DIV')[0];
      buttonDiv.style.cursor = 'wait';
      setTimeout(() => { if (buttonDiv) buttonDiv.style.cursor = 'pointer'; }, 1000);
      onClick(token);
    }
  }

  /**
   * Sets the correct drag preview to use.
   * TRICKY: react-dnd's custom drag layer has very poor performance so we
   * are using static images instead of custom rendering.
   */
  initDragPreview() {
    const {
      selectedTokens,
      token,
      connectDragPreview,
    } = this.props;
    const hasSelections = selectedTokens && selectedTokens.length > 0;

    // build token list
    let tokens = [];
    if(hasSelections) {
      tokens = [...selectedTokens];
    }
    if(!containsToken(tokens, token)) {
      tokens.push(token);
    }
    const numSelections = tokens.length;

    if (numSelections > 1 && connectDragPreview) {
      const img = new Image();
      img.onload = () => connectDragPreview(img);
      img.src = path.join(__dirname, `../assets/multi_drag_preview_${numSelections}.png`);
    } else if (connectDragPreview) {
      // use default preview
      connectDragPreview(null);
    }
  }

  render() {
    const {
      connectDragSource,
      token,
      direction,
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
          direction={direction}
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
  direction: PropTypes.oneOf(['ltr', 'rtl']),
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
  selectedTokens: [],
  direction: 'ltr'
};

/**
 * Handles drag events on the word
 */
const dragHandler = {
  beginDrag(props) {
    // Return the data describing the dragged item
    const {token, onClick, selectedTokens} = props;
    token.type = types.SECONDARY_WORD;
    let tokens = [];
    if (selectedTokens) {
      tokens = [...selectedTokens];
      // TRICKY: include the dragged token in the selection
      if (!containsToken(tokens, token)) {
        tokens.push(token);
        // select the token so it's renders with the selections
        if(onClick && selectedTokens.length > 0) {
          onClick(token);
        }
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
    if (monitor.didDrop() && dropResult && typeof props.onEndDrag === 'function') {
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
