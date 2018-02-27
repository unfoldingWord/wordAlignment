import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';
import ItemTypes from '../ItemTypes';
import WordOccurrence from './WordOccurrence';

const internalStyle = {
  borderLeft: '5px solid #44C6FF',
  padding: '5px',
  margin: '10px',
  backgroundColor: '#FFFFFF',
  boxShadow: "0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset",
  cursor: 'move',
  display: 'flex',
  flexDirection: 'row'
};

const DragWordBankItemAction = {
  beginDrag(props) {
    // Return the data describing the dragged item
    return {
      word: props.word,
      occurrence: props.occurrence,
      occurrences: props.occurrences,
      type: ItemTypes.BOTTOM_WORD
    };
  },
  endDrag() { // receives: props, monitor, component
    // When dropped on a compatible target, do something
    // const item = monitor.getItem();
    // console.log(item)
  }
};


/**
 * Renders a single word item
 * @property {string} word - the represented word
 * @property {int} occurrence
 * @property {int} occurrences
 */
class WordBankItem extends Component {
  render() {
    const { word, isDragging, connectDragSource, occurrence, occurrences } = this.props;
    const opacity = isDragging ? 0.4 : 1;

    return connectDragSource(
      <div style={{ ...internalStyle, opacity }}>
        <span style={{flex: 1}}>
          {word}
        </span>
        <WordOccurrence occurrence={occurrence}
                        occurrences={occurrences}/>
      </div>
    );
  }
}

WordBankItem.propTypes = {
  word: PropTypes.string.isRequired,
  occurrence: PropTypes.number.isRequired,
  occurrences: PropTypes.number.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired
};

export default DragSource(
  ItemTypes.BOTTOM_WORD,
  DragWordBankItemAction,
  (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  })
)(WordBankItem);
