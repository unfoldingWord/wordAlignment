import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {DragSource} from 'react-dnd';
import * as types from './WordCard/Types';
// helpers
import * as lexiconHelpers from '../utils/lexicon';
// components
import WordDetails from './WordDetails';
import Word from './WordCard';
import Tooltip from './Tooltip';

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
class PrimaryWord extends Component {
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
    const {translate, wordObject, style, isDragging, canDrag, connectDragSource, dragPreview} = this.props;
    const {hover} = this.state;

    // TODO: fix the drag rendering to not display the tooltip
    const word = dragPreview(
      <div>
        <Word word={wordObject.word}
              disabled={isDragging  || (hover && !canDrag)}
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
    const {translate, wordObject} = this.props;
    const entryId = lexiconHelpers.lexiconEntryIdFromStrongs(wordObject.strong);
    const lexiconId = lexiconHelpers.lexiconIdFromStrongs(wordObject.strong);
    const lexiconData = this.props.actions.getLexiconData(lexiconId, entryId);
    const positionCoord = e.target;
    const PopoverTitle = (
      <strong style={{fontSize: '1.2em'}}>{wordObject.word}</strong>
    );
    const {showPopover} = this.props.actions;
    const wordDetails = (
      <WordDetails lexiconData={lexiconData} wordObject={wordObject} translate={translate}/>
    );
    showPopover(PopoverTitle, wordDetails, positionCoord);
  }
}

PrimaryWord.propTypes = {
  translate: PropTypes.func.isRequired,
  wordIndex: PropTypes.number,
  alignmentLength: PropTypes.number,
  canDrag: PropTypes.bool,
  wordObject: PropTypes.shape({
    word: PropTypes.string.isRequired,
    lemma: PropTypes.string.isRequired,
    morph: PropTypes.string.isRequired,
    strong: PropTypes.string.isRequired,
    occurrence: PropTypes.number.isRequired,
    occurrences: PropTypes.number.isRequired
  }),
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
  isDragging: PropTypes.bool.isRequired
};

PrimaryWord.defaultProps = {
  alignmentLength: 1,
  wordIndex: 0,
  canDrag: true
};

const dragHandler = {
  beginDrag(props) {
    // Return the data describing the dragged item
    return {
      word: props.wordObject.word,
      lemma: props.wordObject.lemma,
      morph: props.wordObject.morph,
      strong: props.wordObject.strong,
      occurrence: props.wordObject.occurrence,
      occurrences: props.wordObject.occurrences,
      alignmentIndex: props.alignmentIndex,
      wordIndex: props.wordIndex,
      alignmentLength: props.alignmentLength,
      type: types.PRIMARY_WORD
    };
  },
  canDrag(props) {
    const {wordIndex, alignmentLength} = props;
    const firstWord = wordIndex === 0;
    const lastWord = wordIndex === alignmentLength - 1;
    if(alignmentLength > 1) {
      return firstWord || lastWord;
    } else {
      return true;
    }
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
)(PrimaryWord);
