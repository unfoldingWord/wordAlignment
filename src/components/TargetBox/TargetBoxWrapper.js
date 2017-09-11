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
    props.onDrop(monitor.getItem());
  }
};

class TargetBoxWrapper extends Component {
  render() {
    const { canDrop, isOver, droppedWordCards, connectDropTarget, targetWord } = this.props;
    const style = {
      height: '35px',
      padding: droppedWordCards.length === 0 ? '15px 0px' : canDrop ? '15px 0px' :'0px',
      border: isOver ? '3px dashed #44C6FF' : droppedWordCards.length === 0 ? '3px dashed #ffffff' : canDrop ? '3px dashed #ffffff' : ''
    };

    return connectDropTarget(
      <div style={{ display: 'flex', flexDirection: 'column', width: '230px', height: '70px', backgroundColor: '#DCDCDC' }}>
        <TargetWordCard word={targetWord} />
        <div style={style}>
          {!canDrop && droppedWordCards.length > 0 &&
            <div style={{ display: 'flex' }}>
              {
                droppedWordCards.map((card) => (
                  <SourceWordCard key={card.id} id={card.id} word={card.word} />
                ))
              }
            </div>
          }
        </div>
      </div>
    );
  }
}

TargetBoxWrapper.propTypes = {
  isOver: PropTypes.bool.isRequired,
  canDrop: PropTypes.bool.isRequired,
  draggingColor: PropTypes.string,
  connectDropTarget: PropTypes.func.isRequired,
  droppedWordCards: PropTypes.array.isRequired,
  onDrop: PropTypes.func.isRequired,
  targetWord: PropTypes.string.isRequired
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
)(TargetBoxWrapper);