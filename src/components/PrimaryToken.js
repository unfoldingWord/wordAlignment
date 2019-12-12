import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {DragSource} from 'react-dnd';
import { WordLexiconDetails, lexiconHelpers } from 'tc-ui-toolkit';
import {Token} from 'wordmap-lexer';
import * as types from './WordCard/Types';
// components
import Word from './WordCard';

const internalStyle = {
  word: {
    color: '#ffffff',
    backgroundColor: '#333333'
  }
};

/**
 * Renders a draggable primary word
 * @see WordCard
 *
 * @property wordObject
 * @property alignmentIndex
 * @property style
 * @property actions
 * @property resourcesReducer
 *
 */
class PrimaryToken extends Component {
  constructor(props) {
    super(props);
    this._handleClick = this._handleClick.bind(this);
    this._handleOut = this._handleOut.bind(this);
    this._handleOver = this._handleOver.bind(this);
    this.state = {
      hover: false,
      anchorEl: null
    };
  }

  /**
   * Enables hover state
   * @private
   */
  _handleOver(e) {
    this.setState({
      hover: true,
      anchorEl: e.currentTarget
    });
  }

  /**
   * Disables hover state
   * @private
   */
  _handleOut() {
    this.setState({
      hover: false,
      anchorEl: null
    });
  }

  render() {
    const {
      token,
      style,
      isDragging,
      direction,
      canDrag,
      connectDragSource,
      dragPreview
    } = this.props;
    const {hover} = this.state;

    const disabled = (isDragging || hover) && !canDrag;
    const word = dragPreview(
      <div>
        <Word word={token.text}
              direction={direction}
              disabled={disabled}
              style={{...internalStyle.word, ...style}}
              occurrence={token.occurrence}
              occurrences={token.occurrences}
        />
      </div>
    );
    return connectDragSource(
      <div style={{flex: 1, position: 'relative'}}
           onClick={this._handleClick}
           onMouseOver={this._handleOver}
           onMouseOut={this._handleOut}>
        {word}
      </div>
    );
  }

  /**
   * Handles clicks on the word
   * @param e - the click event
   * @private
   */
  _handleClick(e) {
    const {translate, token, isHebrew} = this.props;
    const lexiconData = lexiconHelpers.lookupStrongsNumbers(token.strong, this.props.actions.getLexiconData);
    const positionCoord = e.target;
    const fontSize = isHebrew ? '1.7em' : '1.2em';
    const PopoverTitle = (
      <strong style={{fontSize}}>{token.text}</strong>
    );
    const {showPopover} = this.props.actions;
    const wordDetails = (
      <WordLexiconDetails lexiconData={lexiconData} wordObject={token} translate={translate}
                          isHebrew={isHebrew}/>
    );
    showPopover(PopoverTitle, wordDetails, positionCoord);
  }
}

PrimaryToken.propTypes = {
  translate: PropTypes.func.isRequired,
  wordIndex: PropTypes.number,
  alignmentLength: PropTypes.number,
  canDrag: PropTypes.bool,
  token: PropTypes.instanceOf(Token),
  alignmentIndex: PropTypes.number.isRequired,
  style: PropTypes.object,
  actions: PropTypes.shape({
    showPopover: PropTypes.func.isRequired,
    loadLexiconEntry: PropTypes.func.isRequired,
    getLexiconData: PropTypes.func.isRequired
  }),
  lexicons: PropTypes.object.isRequired,
  dragPreview: PropTypes.func.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  direction: PropTypes.oneOf(['ltr', 'rtl']),
  isDragging: PropTypes.bool.isRequired,
  isHebrew: PropTypes.bool.isRequired
};

PrimaryToken.defaultProps = {
  alignmentLength: 1,
  wordIndex: 0,
  canDrag: true,
  direction: 'ltr',
  style: {},
};

const dragHandler = {
  beginDrag(props) {
    // Return the data describing the dragged item
    return {
      token: props.token,
      // text: props.token.text,
      // lemma: props.token.lemma,
      // morph: props.token.morph,
      // strong: props.token.strong,
      // occurrence: props.token.occurrence,
      // occurrences: props.token.occurrences,
      alignmentIndex: props.alignmentIndex,
      alignmentLength: props.alignmentLength,

      wordIndex: props.wordIndex,
      type: types.PRIMARY_WORD
    };
  },
  canDrag() {
    const canDrag_ = true; // for now at least, this is always true that we can drag from anywhere
    return canDrag_;
  },
  isDragging(props, monitor) {
    let item = monitor.getItem();
    const isDragging_ = item.alignmentIndex === props.alignmentIndex; // if we are dragging this item
    return isDragging_;
  }
};

const collect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  dragPreview: connect.dragPreview({captureDraggingState: false}),
  isDragging: monitor.isDragging()
});

export default DragSource(
  types.PRIMARY_WORD,
  dragHandler,
  collect
)(PrimaryToken);
