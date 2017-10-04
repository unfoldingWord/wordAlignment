import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
// constants
import ItemTypes from '../ItemTypes';
// components
import BottomWordCard from './BottomWordCard';
import TopWordCard from './TopWordCard';

class DropBoxItem extends Component {
  render() {
    const { alignmentIndex, canDrop, isOver, bottomWords, connectDropTarget, topWords } = this.props;
    const style = {
      height: '35px',
      padding: bottomWords.length === 0 ? '15px 0px' : canDrop ? '15px 0px' :'0px',
      border: isOver && canDrop ? '3px dashed #44C6FF' : bottomWords.length === 0 ? '3px dashed #ffffff' : canDrop ? '3px dashed #ffffff' : ''
    };

    return connectDropTarget(
      <div style={{ padding: '5px 10px', backgroundColor: '#DCDCDC', margin: '0px 10px 10px 0px', height: '100px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', width: '230px', height: '70px', backgroundColor: '#DCDCDC' }}>
          {
            topWords.map((metadata, index) => (
              <TopWordCard
                key={index}
                word={metadata.word}
                occurrence={metadata.occurrence}
                occurrences={metadata.occurrences}
                alignmentIndex={alignmentIndex}
              />
            ))
          }
          <div style={style}>
            {bottomWords.length > 0 &&
              <div style={{ display: 'flex' }}>
                {
                  bottomWords.map((metadata, index) => (
                    <BottomWordCard
                      key={index}
                      word={metadata.word}
                      occurrence={metadata.occurrence}
                      occurrences={metadata.occurrences}
                      alignmentIndex={alignmentIndex}
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

DropBoxItem.propTypes = {
  isOver: PropTypes.bool.isRequired,
  canDrop: PropTypes.bool.isRequired,
  draggingColor: PropTypes.string,
  connectDropTarget: PropTypes.func.isRequired,
  topWords: PropTypes.array.isRequired,
  bottomWords: PropTypes.array.isRequired,
  alignmentIndex: PropTypes.number.isRequired,
  lastDroppedItem: PropTypes.object,
  onDrop: PropTypes.func.isRequired
};

const DropDropBoxItemAction = {
  canDrop(props, monitor) {
    const item = monitor.getItem();
    if (item.type === ItemTypes.TOP_WORD) {
      const alignmentIndexDelta = props.alignmentIndex - item.alignmentIndex;
      const canDrop = (Math.abs(alignmentIndexDelta) === 1);
      return canDrop;
    }
    if (item.type === ItemTypes.BOTTOM_WORD) {
      return true;
    }
  },
  drop(props, monitor) {
    props.onDrop(monitor.getItem());
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
  [ItemTypes.BOTTOM_WORD, ItemTypes.TOP_WORD], // itemType
  DropDropBoxItemAction,
  collect
)(DropBoxItem);
