import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';
import ItemTypes from '../ItemTypes';
// helpers
import * as lexiconHelpers from '../../helpers/lexiconHelpers';
import WordDetails from '../WordDetails';

const internalStyle = {
  display: 'flex',
  width: '100%',
  borderLeft: '5px solid #44C6FF',
  padding: '10px',
  textAlign: 'center',
  backgroundColor: '#333333',
  boxShadow: "0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset",
  cursor: 'move',
  color: '#ffffff',
  marginBottom: '5px',
  height: '40px'
};

class TopWordCard extends Component {
  componentWillMount() {
    this.handleOnClick = this.handleOnClick.bind(this);
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
      <span style={{ ...internalStyle, ...style, opacity }}>
        <span style={{ cursor: 'pointer' }} onClick={(e) => this.handleOnClick(e, wordObject)}>
          {wordObject.word}
        </span>
      </span>
    );
  }

  handleOnClick(e, wordObject) {
    let positionCoord = e.target;
    const PopoverTitle = <strong style={{ fontSize: '1.2em' }}>{wordObject.word}</strong>;
    let { showPopover } = this.props.actions;
    const wordDetails = <WordDetails resourcesReducer={this.props.resourcesReducer} wordObject={wordObject} />;
    showPopover(PopoverTitle, wordDetails, positionCoord);
  }
}

TopWordCard.propTypes = {
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

const DragTopWordCardAction = {
  beginDrag(props) {
    // Return the data describing the dragged item
    const item = {
      word: props.wordObject.word,
      lemma: props.wordObject.lemma,
      morph: props.wordObject.morph,
      strong: props.wordObject.strong,
      occurrence: props.wordObject.occurrence,
      occurrences: props.wordObject.occurrences,
      alignmentIndex: props.alignmentIndex,
      type: ItemTypes.TOP_WORD
    };
    return item;
  }
};

const collect = (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  };
};

export default DragSource(
  ItemTypes.TOP_WORD,
  DragTopWordCardAction,
  collect
)(TopWordCard);
