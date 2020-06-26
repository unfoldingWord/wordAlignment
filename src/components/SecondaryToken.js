import React from 'react';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';
import { Token } from 'wordmap-lexer';
// load drag preview images
import multi_drag_preview_2 from '../assets/multi_drag_preview_2.png';
import multi_drag_preview_3 from '../assets/multi_drag_preview_3.png';
import multi_drag_preview_4 from '../assets/multi_drag_preview_4.png';
import multi_drag_preview_5 from '../assets/multi_drag_preview_5.png';
import multi_drag_preview_6 from '../assets/multi_drag_preview_6.png';
import multi_drag_preview_7 from '../assets/multi_drag_preview_7.png';
import multi_drag_preview_8 from '../assets/multi_drag_preview_8.png';
import multi_drag_preview_9 from '../assets/multi_drag_preview_9.png';
import multi_drag_preview_10 from '../assets/multi_drag_preview_10.png';
import multi_drag_preview_11 from '../assets/multi_drag_preview_11.png';
import multi_drag_preview_12 from '../assets/multi_drag_preview_12.png';
import multi_drag_preview_13 from '../assets/multi_drag_preview_13.png';
import multi_drag_preview_14 from '../assets/multi_drag_preview_14.png';
import multi_drag_preview_15 from '../assets/multi_drag_preview_15.png';
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
    const { onCancel, token } = this.props;

    if (typeof onCancel === 'function') {
      onCancel(token);
    }
  }

  handleClick(e) {
    e.stopPropagation();
    const {
      token, onAccept, onClick,
    } = this.props;

    if (token.meta.suggestion) {
      onAccept(token);
    } else if (!token.disabled && onClick) {
      const buttonDiv = e.currentTarget.getElementsByTagName('DIV')[0].getElementsByTagName('DIV')[0];
      buttonDiv.style.cursor = 'wait';
      setTimeout(() => {
        if (buttonDiv) {
          buttonDiv.style.cursor = 'pointer';
        }
      }, 1000);
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

    if (hasSelections) {
      tokens = [...selectedTokens];
    }

    if (!containsToken(tokens, token)) {
      tokens.push(token);
    }

    const numSelections = tokens.length;

    if (numSelections > 1 && connectDragPreview) {
      const img = new Image();
      img.onload = () => connectDragPreview(img);
      img.src = this.getDragPreviewImage(numSelections);
    } else if (connectDragPreview) {
      // use default preview
      connectDragPreview(null);
    }
  }

  /**
   * get the image to use for drag preview for number of selection items.  Sanity checking will return minimum of 2 and maximum of 15
   * @param {number} selectionCount
   * @return {Image}
   */
  getDragPreviewImage(selectionCount) {
    const images = [ multi_drag_preview_2, multi_drag_preview_3, multi_drag_preview_4, multi_drag_preview_5,
      multi_drag_preview_6, multi_drag_preview_7, multi_drag_preview_8, multi_drag_preview_9, multi_drag_preview_10,
      multi_drag_preview_11, multi_drag_preview_12, multi_drag_preview_13, multi_drag_preview_14, multi_drag_preview_15,
    ];

    // calculate offset of image with sanity checking
    let offset = selectionCount - 2;

    if (offset < 0) {
      offset = 0;
    } else if (offset >= images.length) {
      offset = images.length - 1;
    }

    return images[offset];
  }

  render() {
    const {
      token,
      disabled,
      selected,
      direction,
      isDragging,
      connectDragSource,
      targetLanguageFontClassName,
      fontScale
    } = this.props;
    const opacity = isDragging ? 0.4 : 1;

    this.initDragPreview();

    const wordComponent = (
      <div
        style={{ flex: 1 }}
        onClick={this.handleClick}
      >
        <Word
          word={token.text}
          style={{ opacity }}
          fontScale={fontScale}
          selected={selected}
          disabled={disabled}
          direction={direction}
          disableTooltip={isDragging || disabled}
          onCancel={this.handleCancel}
          occurrence={token.occurrence}
          occurrences={token.occurrences}
          isSuggestion={token.meta.suggestion}
          targetLanguageFontClassName={targetLanguageFontClassName}
        />
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
  disabled: PropTypes.bool,
  targetLanguageFontClassName: PropTypes.string,
  fontScale: PropTypes.number
};

SecondaryToken.defaultProps = {
  isSelected: false,
  onClick: () => {
  },
  onAccept: () => {
  },
  alignmentIndex: undefined,
  disabled: false,
  fontScale: 100,
  selectedTokens: [],
  direction: 'ltr',
};

/**
 * Handles drag events on the word
 */
const dragHandler = {
  beginDrag(props) {
    // Return the data describing the dragged item
    const {
      token, onClick, selectedTokens,
    } = props;
    token.type = types.SECONDARY_WORD;
    let tokens = [];

    if (selectedTokens) {
      tokens = [...selectedTokens];

      // TRICKY: include the dragged token in the selection
      if (!containsToken(tokens, token)) {
        tokens.push(token);

        // select the token so it's renders with the selections
        if (onClick && selectedTokens.length > 0) {
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
      type: types.SECONDARY_WORD,
    };
  },
  endDrag(props, monitor) {
    const dropResult = monitor.getDropResult();

    if (monitor.didDrop() && dropResult && typeof props.onEndDrag === 'function') {
      props.onEndDrag();
    }
  },
  isDragging(props, monitor) {
    const item = monitor.getItem();
    return item.token.tokenPos === props.token.tokenPos;
  },
};

/**
 * Specifies which props to inject into the component
 * @param connect
 * @param monitor
 */
const collect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
  connectDragPreview: connect.dragPreview(),
});

export default DragSource(
  types.SECONDARY_WORD,
  dragHandler,
  collect,
)(SecondaryToken);
