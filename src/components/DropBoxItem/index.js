import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
// constants
import ItemTypes from '../ItemTypes';
// components
import SecondaryWord from '../Word';
import PrimaryWord from './TopWordCard';

class DropBoxItem extends Component {
  render() {
    const { alignmentIndex, canDrop, isOver, bottomWords, connectDropTarget, topWords } = this.props;
    const topStyle = {
      padding: topWords.length === 0 ? '15px 0px' : '1px 0'
    };
    const bottomStyle = {
      height: '35px',
      padding: bottomWords.length === 0 ? '15px 0px' : canDrop ? '15px 0px' :'0px',
      border: isOver && canDrop ? '3px dashed #44C6FF' : bottomWords.length === 0 ? '3px dashed #ffffff' : canDrop ? '3px dashed #ffffff' : ''
    };
    const dropBoxItemOuterStyle = {
      padding: '5px 10px',
      backgroundColor: '#DCDCDC',
      margin: '0px 10px 10px 0px',
      height: '100px'
    };
    const dropBoxItemInnerStyle = {
      display: 'flex',
      flexDirection: 'column',
      width: '230px',
      height: '70px',
      backgroundColor: '#DCDCDC'
    };
    let dropBoxDiv = (
      <div style={dropBoxItemOuterStyle}>
        <div style={dropBoxItemInnerStyle}>
          <div style={topStyle}>
            <div style={{ display: 'flex' }}>
              {
                topWords.map((wordObject, index) => (
                  <PrimaryWord
                    key={index}
                    wordObject={wordObject}
                    alignmentIndex={this.props.alignmentIndex}
                    resourcesReducer={this.props.resourcesReducer}
                    actions={this.props.actions}
                  />
                ))
              }
            </div>
          </div>
          <div style={bottomStyle}>
            {bottomWords.length > 0 &&
              <div style={{ display: 'flex' }}>
                {
                  bottomWords.map((metadata, index) => (
                    <SecondaryWord
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
    const emptyDropBoxItem = topWords.length === 0 && bottomWords.length === 0;
    if (emptyDropBoxItem) {
      dropBoxItemInnerStyle.width = 10;
      dropBoxDiv = canDrop ? dropBoxDiv : <div />;
    }
    return connectDropTarget(
      dropBoxDiv
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
  siblingTopWords: PropTypes.array,
  alignmentIndex: PropTypes.number.isRequired,
  lastDroppedItem: PropTypes.object,
  onDrop: PropTypes.func.isRequired,
  resourcesReducer: PropTypes.shape({
    lexicons: PropTypes.object.isRequired
  }),
  actions: PropTypes.shape({
    showPopover: PropTypes.func.isRequired,
    loadLexiconEntry: PropTypes.func.isRequired
  })
};

const DropDropBoxItemAction = {
  canDrop(props, monitor) {
    const item = monitor.getItem();
    const alignmentEmpty = (props.topWords.length === 0 && props.bottomWords.length === 0);
    let canDrop;
    if (item.type === ItemTypes.SECONDARY_WORD) {
      const alignmentIndexDelta = props.alignmentIndex - item.alignmentIndex;
      canDrop = alignmentIndexDelta !== 0 && !alignmentEmpty;
      return canDrop;
    }
    if (item.type === ItemTypes.PRIMARY_WORD) {
      const alignmentIndexDelta = props.alignmentIndex - item.alignmentIndex;
      const enoughSiblingTopWords = props.siblingTopWords && props.siblingTopWords.length > 1;
      if (alignmentIndexDelta === 0 && alignmentEmpty && enoughSiblingTopWords) {
        canDrop = true;
      } else {
        canDrop = (!alignmentEmpty && Math.abs(alignmentIndexDelta) === 1);
      }
      return canDrop;
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
  [ItemTypes.SECONDARY_WORD, ItemTypes.PRIMARY_WORD], // itemType
  DropDropBoxItemAction,
  collect
)(DropBoxItem);
