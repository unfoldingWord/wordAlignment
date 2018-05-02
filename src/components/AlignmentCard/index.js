import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {DropTarget} from 'react-dnd';
import * as types from '../WordCard/Types';
import SecondaryToken from '../SecondaryToken';
import PrimaryToken from '../PrimaryToken';
import AlignmentCard from './AlignmentCard';
import Token from 'word-map/structures/Token';

const styles = {
  root: {
    open: {
      width: 'auto',
      display: 'inherit',
      transition: '0.5s'
    },
    closed: {
      width: '0',
      display: 'none',
      transition: '0.5s'
    }
  }
};

/**
 * Determines if a word can be dropped
 * @param dropTargetProps
 * @param dragSourceProps
 * @return {boolean}
 */
export const canDropPrimaryToken = (dropTargetProps, dragSourceProps) => {
  const emptyTarget = dropTargetProps.sourceNgram.length === 0;
  const singleTarget = dropTargetProps.sourceNgram.length === 1;
  const mergedTarget = dropTargetProps.sourceNgram.length > 1;
  const singleSource  = dragSourceProps.alignmentLength === 1;
  const mergedSource = dragSourceProps.alignmentLength > 1;
  const alignmentDelta = dropTargetProps.alignmentIndex - dragSourceProps.alignmentIndex;
  // const leftPlaceholder = dropTargetProps.placeholderPosition === 'left';  //alignmentDelta < 0;
  // const rightPlaceholder = dropTargetProps.placeholderPosition === 'right'; //alignmentDelta > 0;
  const moved = alignmentDelta !== 0;
  // const leftWord = mergedSource && dragSourceProps.wordIndex === 0;
  // const rightWord = mergedSource && dragSourceProps.wordIndex === dragSourceProps.alignmentLength - 1;

  // limit all drags to adjacent alignments
  if(Math.abs(alignmentDelta) > 1) return false;

  // single to single
  // TRICKY: make sure we've moved
  if(singleSource && singleTarget && moved) return true;

  // single to merged
  if(singleSource && mergedTarget) {
    return true;
  }

  // merged to empty
  if(mergedSource && emptyTarget) {
    if(!moved) return true;
    // TODO: need a workaround for this bug before supporting left vs right un-merging https://github.com/react-dnd/react-dnd/issues/735
    // see components/AlignmentGrid.js
    // we could potentially use the touch backend https://github.com/yahoo/react-dnd-touch-backend
    // however that would require us to render a custom drag preview and the drag performance may
    // not be as good.
    // if(!moved && leftPlaceholder && leftWord) return true;
    // if(!moved && rightPlaceholder && rightWord) return true;
  }

  return false;
};


/**
 * Renders the alignment of primary and secondary words/phrases
 */
class DroppableAlignmentCard extends Component {
  render() {
    const {
      translate,
      lexicons,
      alignmentIndex,
      canDrop,
      dragItemType,
      isOver,
      actions,
      targetNgram,
      connectDropTarget,
      sourceNgram
    } = this.props;

    const acceptsTop = canDrop && dragItemType === types.PRIMARY_WORD;
    const acceptsBottom = canDrop && dragItemType === types.SECONDARY_WORD;

    const hoverTop = isOver && acceptsTop;
    const hoverBottom = isOver && acceptsBottom;

    const emptyAlignment = sourceNgram.length === 0 && targetNgram.length === 0;

    const alignmentLength = sourceNgram.length;
    const topWordCards = sourceNgram.map((token, index) => (
      <PrimaryToken
        key={index}
        translate={translate}
        wordIndex={index}
        alignmentLength={alignmentLength}
        token={token}
        alignmentIndex={alignmentIndex}
        lexicons={lexicons}
        actions={actions}
      />
    ));
    const bottomWordCards = targetNgram.map((token, index) => (
      <SecondaryToken
        key={index}
        token={token}
        alignmentIndex={alignmentIndex}
      />
    ));

    if (emptyAlignment && !canDrop) {
      return <div style={styles.root.closed}/>;
    } else {
      return connectDropTarget(
        <div>
          <AlignmentCard targetTokenCards={bottomWordCards}
                         hoverBottom={hoverBottom}
                         hoverTop={hoverTop}
                         acceptsTargetTokens={acceptsBottom}
                         acceptsSourceTokens={acceptsTop}
                         sourceTokenCards={topWordCards}/>
        </div>
      );
    }
  }
}

DroppableAlignmentCard.propTypes = {
  translate: PropTypes.func.isRequired,
  placeholderPosition: PropTypes.string,
  dragItemType: PropTypes.string,
  isOver: PropTypes.bool.isRequired,
  canDrop: PropTypes.bool.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  sourceNgram: PropTypes.arrayOf(PropTypes.instanceOf(Token)).isRequired,
  targetNgram: PropTypes.arrayOf(PropTypes.instanceOf(Token)).isRequired,
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
    const alignmentEmpty = (props.sourceNgram.length === 0 &&
      props.targetNgram.length === 0);
    let canDrop = false;
    if (item.type === types.SECONDARY_WORD) {
      const alignmentIndexDelta = props.alignmentIndex - item.alignmentIndex;
      canDrop = alignmentIndexDelta !== 0 && !alignmentEmpty;
      return canDrop;
    }
    if (item.type === types.PRIMARY_WORD) {
      return canDropPrimaryToken(props, item);
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
