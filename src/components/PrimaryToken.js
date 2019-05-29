import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {DragSource} from 'react-dnd';
import { WordLexiconDetails, lexiconHelpers } from 'tc-ui-toolkit';
import * as types from './WordCard/Types';
// components
import Word from './WordCard';
import Tooltip from './Tooltip';
import {Token} from 'wordmap-lexer';

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
      translate,
      token,
      style,
      isDragging,
      direction,
      canDrag,
      connectDragSource,
      dragPreview
    } = this.props;
    const {hover} = this.state;

    const word = dragPreview(
      <div>
        <Word word={token.text}
              direction={direction}
              disabled={isDragging || (hover && !canDrag)}
              style={{...internalStyle.word, ...style}}/>
      </div>
    );
    return connectDragSource(
      <div style={{flex: 1, position: 'relative'}}
           onClick={this._handleClick}
           onMouseOver={this._handleOver}
           onMouseOut={this._handleOut}>
        {word}
        {!isDragging && hover && !canDrag ? (
          <Tooltip message={translate('cannot_drag_middle')}/>
        ) : null}
      </div>
    );
  }

  /**
   * Handles clicks on the word
   * @param e - the click event
   * @private
   */
  _handleClick(e) {
    const {translate, token} = this.props;
    const lexiconData = lexiconHelpers.lookupStrongsNumbers(token.strong, this.props.actions.getLexiconData);
    const positionCoord = e.target;
    const PopoverTitle = (
      <strong style={{fontSize: '1.2em'}}>{token.text}</strong>
    );
    const {showPopover} = this.props.actions;
    const wordDetails = (
      <WordLexiconDetails lexiconData={lexiconData} wordObject={token} translate={translate}/>
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
  isDragging: PropTypes.bool.isRequired
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
    // TODO remove
    // canDrag(props) {
    // const {wordIndex, alignmentLength} = props;
    // const firstWord = wordIndex === 0;
    // const lastWord = wordIndex === alignmentLength - 1;
    // if (alignmentLength > 1) {
    //   return firstWord || lastWord;
    // } else {
    //   return true;
    // }
    return true;
  }
};

const collect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  dragPreview: connect.dragPreview({captureDraggingState: false}),
  canDrag: monitor.canDrag(),
  isDragging: monitor.isDragging()
});

export default DragSource(
  types.PRIMARY_WORD,
  dragHandler,
  collect
)(PrimaryToken);
