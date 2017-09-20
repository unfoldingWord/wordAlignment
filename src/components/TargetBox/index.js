import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
// constants
import ItemTypes from '../ItemTypes';
// components
import SourceWordCard from './SourceWordCard';
import TargetWordCard from './TargetWordCard';

const DropTargetBoxAction = {
  drop(props, monitor) {
    props.actions.moveSourceWordToTargetBox(props.index, monitor.getItem())
  }
};

class TargetBox extends Component {
  render() {
    const { canDrop, isOver, droppedWords, connectDropTarget, targetWords } = this.props;
    const style = {
      height: '35px',
      padding: droppedWords.length === 0 ? '15px 0px' : canDrop ? '15px 0px' :'0px',
      border: isOver ? '3px dashed #44C6FF' : droppedWords.length === 0 ? '3px dashed #ffffff' : canDrop ? '3px dashed #ffffff' : ''
    };

    return connectDropTarget(
      <div style={{ padding: '5px 10px', backgroundColor: '#DCDCDC', margin: '0px 10px 10px 0px', height: '100px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', width: '230px', height: '70px', backgroundColor: '#DCDCDC' }}>
          <TargetWordCard words={targetWords} />
          <div style={style}>
            {!canDrop && droppedWords.length > 0 &&
              <div style={{ display: 'flex' }}>
                {
                  droppedWords.map((droppedWord, index) => (
                    <SourceWordCard
                      key={index}
                      word={droppedWord.word}
                    />
                  ))
                }
              </div>
            }
          </div>
        </div>
      </div>
    );
  }
}

TargetBox.propTypes = {
  isOver: PropTypes.bool.isRequired,
  canDrop: PropTypes.bool.isRequired,
  draggingColor: PropTypes.string,
  connectDropTarget: PropTypes.func.isRequired,
  targetWords: PropTypes.array.isRequired,
  droppedWords: PropTypes.array.isRequired
}

export default DropTarget(
  ItemTypes.CARD, // itemType
  DropTargetBoxAction,
  (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
    draggingType: monitor.getItemType()
  })
)(TargetBox);