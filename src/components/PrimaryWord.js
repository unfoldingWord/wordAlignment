import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {DragSource} from 'react-dnd';
import * as types from './WordCard/Types';
// helpers
import * as lexiconHelpers from '../utils/lexicon';
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
 *
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

  componentWillMount() {
    const {strong} = this.props.wordObject;
    if (strong) {
      const entryId = lexiconHelpers.lexiconEntryIdFromStrongs(strong);
      const lexiconId = lexiconHelpers.lexiconIdFromStrongs(strong);
      this.props.actions.loadLexiconEntry(lexiconId, entryId);
    }
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
    const {wordObject, style, isDragging, canDrag, connectDragSource} = this.props;
    const {hover} = this.state;
    const opacity = isDragging ? 0.4 : 1;

    // TODO: fix the drag rendering to not display the tooltip
    return connectDragSource(
      <div style={{flex: 1, position: 'relative'}}
           onClick={this._handleClick}
           onMouseOver={this._handleOver}
           onMouseOut={this._handleOut}>
        <Word word={wordObject.word}
              disabled={!isDragging && hover && !canDrag}
              occurrence={wordObject.occurrence}
              occurrences={wordObject.occurrences}
              style={{...internalStyle.word, ...style, opacity}}/>
        {/*{!isDragging && hover && !canDrag ? (*/}
          {/*<Tooltip message="Cannot un-merge a middle word."/>*/}
        {/*) : null}*/}
      </div>
    );
  }

  /**
   * Handles clicks on the word
   * @param e - the click event
   * @private
   */
  _handleClick(e) {
    const {wordObject, lexicons} = this.props;
    let positionCoord = e.target;
    const PopoverTitle = <strong
      style={{fontSize: '1.2em'}}>{wordObject.word}</strong>;
    let {showPopover} = this.props.actions;
    const wordDetails = <WordDetails lexicons={lexicons}
                                     wordObject={wordObject}/>;
    showPopover(PopoverTitle, wordDetails, positionCoord);
  }
}

PrimaryWord.propTypes = {
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
    loadLexiconEntry: PropTypes.func.isRequired
  }),
  lexicons: PropTypes.object.isRequired,

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
  canDrag: monitor.canDrag(),
  isDragging: monitor.isDragging()
});

export default DragSource(
  types.PRIMARY_WORD,
  dragHandler,
  collect
)(PrimaryWord);
