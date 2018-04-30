import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {DropTarget} from 'react-dnd';
import * as types from '../WordCard/Types';
import SecondaryToken from '../SecondaryToken';
import PrimaryToken from '../PrimaryToken';
import AlignmentCard from './AlignmentCard';
import {canDropPrimaryWord} from '../../utils/dragDrop';

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
          <AlignmentCard bottomWordCards={bottomWordCards}
                         hoverBottom={hoverBottom}
                         hoverTop={hoverTop}
                         acceptsBottomWords={acceptsBottom}
                         acceptsTopWords={acceptsTop}
                         topWordCards={topWordCards}
                         topWords={sourceNgram}/>
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
  sourceNgram: PropTypes.array.isRequired,
  targetNgram: PropTypes.array.isRequired,
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
      return canDropPrimaryWord(props, item);
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
