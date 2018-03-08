import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {DropTarget} from 'react-dnd';
import * as types from '../WordCard/Types';
import SecondaryWord from '../SecondaryWord';
import PrimaryWord from '../PrimaryWord';
import AlignmentCard from './AlignmentCard';
import {canDropPrimaryWord} from '../../utils/dragDrop';

/**
 * Renders the alignment of primary and secondary words/phrases
 */
class DroppableAlignmentCard extends Component {
  render() {
    const {lexicons, alignmentIndex, canDrop, dragItemType, isOver, actions, bottomWords, connectDropTarget, topWords} = this.props;

    const acceptsTop = canDrop && dragItemType === types.PRIMARY_WORD;
    const acceptsBottom = canDrop && dragItemType === types.SECONDARY_WORD;

    const hoverTop = isOver && acceptsTop;
    const hoverBottom = isOver && acceptsBottom;

    const emptyAlignment = topWords.length === 0 && bottomWords.length === 0;

    const alignmentLength = topWords.length;
    const topWordCards = topWords.map((wordObject, index) => (
      <PrimaryWord
        key={index}
        wordIndex={index}
        alignmentLength={alignmentLength}
        wordObject={wordObject}
        alignmentIndex={alignmentIndex}
        lexicons={lexicons}
        actions={actions}
      />
    ));

    const bottomWordCards = bottomWords.map((metadata, index) => (
      <SecondaryWord
        key={index}
        word={metadata.word}
        occurrence={metadata.occurrence}
        occurrences={metadata.occurrences}
        alignmentIndex={alignmentIndex}
      />
    ));

    if(emptyAlignment && !canDrop) {
      return null;
    } else {
      return connectDropTarget(
        <div>
          <AlignmentCard bottomWords={bottomWordCards}
                         hoverBottom={hoverBottom}
                         hoverTop={hoverTop}
                         acceptsBottomWords={acceptsBottom}
                         acceptsTopWords={acceptsTop}
                         topWords={topWordCards}/>
        </div>
      );
    }
  }
}

DroppableAlignmentCard.propTypes = {
  siblingTopWords: PropTypes.array,

  dragItemType: PropTypes.string,
  isOver: PropTypes.bool.isRequired,
  canDrop: PropTypes.bool.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  topWords: PropTypes.array.isRequired,
  bottomWords: PropTypes.array.isRequired,
  alignmentIndex: PropTypes.number.isRequired,
  onDrop: PropTypes.func.isRequired,
  lexicons: PropTypes.object.isRequired,
  actions: PropTypes.shape({
    showPopover: PropTypes.func.isRequired,
    loadLexiconEntry: PropTypes.func.isRequired
  })
};

const dragHandler = {
  canDrop(props, monitor) {
    const item = monitor.getItem();
    const alignmentEmpty = (props.topWords.length === 0 &&
      props.bottomWords.length === 0);
    let canDrop = false;
    if (item.type === types.SECONDARY_WORD) {
      const alignmentIndexDelta = props.alignmentIndex - item.alignmentIndex;
      canDrop = alignmentIndexDelta !== 0 && !alignmentEmpty;
      return canDrop;
    }
    if (item.type === types.PRIMARY_WORD) {
      const alignmentIndexDelta = props.alignmentIndex - item.alignmentIndex;
      if (alignmentIndexDelta === 0 && alignmentEmpty) {
        canDrop = true;
      } else {
        canDrop = (!alignmentEmpty && Math.abs(alignmentIndexDelta) === 1);
      }
      return canDrop;
      // return canDropPrimaryWord(props, item);
    }
  },
  drop(props, monitor) {
    props.onDrop(monitor.getItem());
  }
};

const collect = (connect, monitor) => {
  const item = monitor.getItem();
  return {
    connectDropTarget: connect.dropTarget(),
    dragItemType: item ? item.type : null,
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  };
};

export default DropTarget(
  [types.SECONDARY_WORD, types.PRIMARY_WORD],
  dragHandler,
  collect
)(DroppableAlignmentCard);
