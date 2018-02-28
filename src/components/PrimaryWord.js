import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';
import * as types from './Word/Types';
// helpers
import * as lexiconHelpers from '../helpers/lexiconHelpers';
import WordDetails from './WordDetails';
import Word from './Word';

const internalStyle = {
  color: '#ffffff',
  backgroundColor: '#333333',
};

class PrimaryWord extends Component {
  constructor(props) {
    super(props);
    this._handleClick = this._handleClick.bind(this);
  }

  componentWillMount() {
    const { strong } = this.props.wordObject;
    if (strong) {
      const entryId = lexiconHelpers.lexiconEntryIdFromStrongs(strong);
      const lexiconId = lexiconHelpers.lexiconIdFromStrongs(strong);
      this.props.actions.loadLexiconEntry(lexiconId, entryId);
    }
  }

  render() {
    const { wordObject, style, isDragging, connectDragSource } = this.props;
    const opacity = isDragging ? 0.4 : 1;

    return connectDragSource(
      <div style={{flex:1}}>
        <Word word={wordObject.word}
              onClick={this._handleClick}
              style={{ ...internalStyle, ...style, opacity }} />
      </div>
    );
  }

  /**
   * Handles clicks on the word
   * @param e - the click event
   * @private
   */
  _handleClick(e) {
    const {wordObject} = this.props;
    let positionCoord = e.target;
    const PopoverTitle = <strong style={{ fontSize: '1.2em' }}>{wordObject.word}</strong>;
    let { showPopover } = this.props.actions;
    const wordDetails = <WordDetails resourcesReducer={this.props.resourcesReducer} wordObject={wordObject} />;
    showPopover(PopoverTitle, wordDetails, positionCoord);
  }
}

PrimaryWord.propTypes = {
  wordObject: PropTypes.shape({
    word: PropTypes.string.isRequired,
    lemma: PropTypes.string.isRequired,
    morph: PropTypes.string.isRequired,
    strong: PropTypes.string.isRequired,
    occurrence: PropTypes.number.isRequired,
    occurrences: PropTypes.number.isRequired
  }),
  alignmentIndex: PropTypes.number.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
  style: PropTypes.object,
  actions: PropTypes.shape({
    showPopover: PropTypes.func.isRequired,
    loadLexiconEntry: PropTypes.func.isRequired
  }),
  resourcesReducer: PropTypes.shape({
    lexicons: PropTypes.object.isRequired
  })
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
      type: types.PRIMARY_WORD
    };
  }
};

const collect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
});

export default DragSource(
  types.PRIMARY_WORD,
  dragHandler,
  collect
)(PrimaryWord);
