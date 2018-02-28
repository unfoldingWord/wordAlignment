import React from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import * as types from '../Word/Types';
import WordList from './WordList';

/**
 * Renders a word bank with drag-drop support
 */
class DroppableWordList extends React.Component {
  render() {
    const {chapter, verse, alignmentData, connectDropTarget, isOver} = this.props;

    return connectDropTarget(
      <div style={{
        flex: 0.2,
        width: '100%',
        backgroundColor: '#DCDCDC',
        overflowY: 'auto',
        padding: '5px 8px 5px 5px'
      }}>
        <WordList chapter={chapter}
                  verse={verse}
                  alignmentData={alignmentData}
                  isOver={isOver}/>
      </div>
    );
  }
}

DroppableWordList.propTypes = {
  chapter: PropTypes.number,
  verse: PropTypes.number,
  alignmentData: PropTypes.object.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  isOver: PropTypes.bool.isRequired,
  moveBackToWordBank: PropTypes.func.isRequired
};

/**
 * Handles drag events on the word bank
 */
const dragHandler = {
  drop (props, monitor) {
    props.moveBackToWordBank(monitor.getItem());
  }
};

const collect = (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  };
};

export default DropTarget(
  types.SECONDARY_WORD,
  dragHandler,
  collect
)(DroppableWordList);
