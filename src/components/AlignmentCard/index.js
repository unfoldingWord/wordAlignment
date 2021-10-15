import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import { Token } from 'wordmap-lexer';
import * as types from '../WordCard/Types';
import SecondaryToken from '../SecondaryToken';
import PrimaryToken from '../PrimaryToken';
import AlignmentCard from './AlignmentCard';

const styles = {
  root: {
    open: {
      width: 'auto',
      display: 'inherit',
      transition: '0.5s',
    },
    closed: {
      width: '0',
      display: 'none',
      transition: '0.5s',
    },
  },
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
  const singleSource = dragSourceProps.alignmentLength === 1;
  const mergedSource = dragSourceProps.alignmentLength > 1;
  const alignmentDelta = dropTargetProps.alignmentIndex - dragSourceProps.alignmentIndex;
  // const leftPlaceholder = dropTargetProps.placeholderPosition === 'left';  //alignmentDelta < 0;
  // const rightPlaceholder = dropTargetProps.placeholderPosition === 'right'; //alignmentDelta > 0;
  const different = alignmentDelta !== 0;
  // const leftWord = mergedSource && dragSourceProps.wordIndex === 0;
  // const rightWord = mergedSource && dragSourceProps.wordIndex === dragSourceProps.alignmentLength - 1;

  // moving single word to another single (new merge)
  // TRICKY: make sure this is to a different word
  if (singleSource && singleTarget && different) {
    return true;
  }

  // moving single word to merged group
  if (singleSource && mergedTarget) {
    return true;
  }

  if (mergedSource) { // removing a word from a merged group
    if (emptyTarget) { // moving word from merged group to empty (unmerge)
      if (!different) { // if unmerge target for this group
        return true;
      }
    } else if (singleTarget) { // moving word from merged group to a single word (new merge)
      return true;
    } else if (mergedTarget && different) { //  moving word from merged group to a different merged group
      return true;
    }

    // TODO: need a workaround for this bug before supporting left vs right un-merging https://github.com/react-dnd/react-dnd/issues/735
    // see components/AlignmentGrid.js
    // we could potentially use the touch backend https://github.com/yahoo/react-dnd-touch-backend
    // however that would require us to render a custom drag preview and the drag performance may
    // not be as good.
    // if(!moved && leftPlaceholder && leftWord) return true;
    // if(!moved && rightPlaceholder && rightWord) return true;
  }

  return false; // any other destinations are not allowed
};


/**
 * Renders the alignment of primary and secondary words/phrases
 */
class DroppableAlignmentCard extends Component {
  constructor(props) {
    super(props);
    this._handleCancelSuggestion = this._handleCancelSuggestion.bind(this);
    this._handleAcceptSuggestion = this._handleAcceptSuggestion.bind(this);
  }

  _handleCancelSuggestion(token) {
    const { onCancelTokenSuggestion, alignmentIndex } = this.props;

    if (typeof onCancelTokenSuggestion === 'function') {
      onCancelTokenSuggestion(alignmentIndex, token);
    }
  }

  _handleAcceptSuggestion(token) {
    const { onAcceptTokenSuggestion, alignmentIndex } = this.props;

    if (typeof onAcceptTokenSuggestion === 'function') {
      onAcceptTokenSuggestion(alignmentIndex, token);
    }
  }

  render() {
    const {
      translate,
      lexicons,
      canDrop,
      dragItemType,
      isOver,
      targetNgram,
      sourceNgram,
      alignmentIndex,
      sourceStyle,
      sourceDirection,
      targetDirection,
      isSuggestion,
      connectDropTarget,
      isHebrew,
      showPopover,
      getLexiconData,
      loadLexiconEntry,
      fontSize,
      targetLanguageFontClassName,
    } = this.props;
    const acceptsTop = canDrop && dragItemType === types.PRIMARY_WORD;
    const acceptsBottom = canDrop && dragItemType === types.SECONDARY_WORD;

    const hoverTop = isOver && acceptsTop;
    const hoverBottom = isOver && acceptsBottom;

    const emptyAlignment = sourceNgram.length === 0 && targetNgram.length === 0;

    const topWordCards = sourceNgram.map((token, index) => (
      <PrimaryToken
        key={index}
        token={token}
        wordIndex={index}
        style={sourceStyle}
        lexicons={lexicons}
        isHebrew={isHebrew}
        fontSize={fontSize}
        translate={translate}
        direction={sourceDirection}
        alignmentLength={sourceNgram.length}
        alignmentIndex={alignmentIndex}
        showPopover={showPopover}
        getLexiconData={getLexiconData}
        loadLexiconEntry={loadLexiconEntry}
      />
    ));
    const bottomWordCards = targetNgram.map((token, index) => (
      <SecondaryToken
        key={index}
        token={token}
        direction={targetDirection}
        alignmentIndex={alignmentIndex}
        onCancel={this._handleCancelSuggestion}
        onAccept={this._handleAcceptSuggestion}
        targetLanguageFontClassName={targetLanguageFontClassName}
      />
    ));

    if (emptyAlignment && !canDrop) {
      return <div style={styles.root.closed}/>;
    } else {
      return connectDropTarget(
        <div>
          <AlignmentCard targetTokenCards={bottomWordCards}
            targetDirection={targetDirection}
            hoverBottom={hoverBottom}
            hoverTop={hoverTop}
            isSuggestion={isSuggestion}
            acceptsTargetTokens={acceptsBottom}
            acceptsSourceTokens={acceptsTop}
            sourceTokenCards={topWordCards}/>
        </div>,
      );
    }
  }
}

DroppableAlignmentCard.propTypes = {
  fontSize: PropTypes.number,
  onCancelTokenSuggestion: PropTypes.func,
  onAcceptTokenSuggestion: PropTypes.func,
  translate: PropTypes.func.isRequired,
  placeholderPosition: PropTypes.string,
  sourceStyle: PropTypes.object.isRequired,
  dragItemType: PropTypes.string,
  isOver: PropTypes.bool.isRequired,
  canDrop: PropTypes.bool.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  sourceNgram: PropTypes.arrayOf(PropTypes.instanceOf(Token)).isRequired,
  targetNgram: PropTypes.arrayOf(PropTypes.instanceOf(Token)).isRequired,
  alignmentIndex: PropTypes.number.isRequired,
  isSuggestion: PropTypes.bool.isRequired,
  onDrop: PropTypes.func.isRequired,
  lexicons: PropTypes.object.isRequired,
  sourceDirection: PropTypes.oneOf(['ltr', 'rtl']),
  targetDirection: PropTypes.oneOf(['ltr', 'rtl']),
  isHebrew: PropTypes.bool.isRequired,
  targetLanguageFontClassName: PropTypes.string,
  showPopover: PropTypes.func.isRequired,
  getLexiconData: PropTypes.func.isRequired,
  loadLexiconEntry: PropTypes.func.isRequired,
};

DroppableAlignmentCard.defaultProps = {
  sourceDirection: 'ltr',
  targetDirection: 'ltr',
  sourceStyle: { fontSize: '100%' },
};

const dragHandler = {
  canDrop(props, monitor) {
    const item = monitor.getItem();
    const alignmentEmpty = (props.sourceNgram.length === 0 &&
      props.targetNgram.length === 0);
    let canDrop = false;

    if (item.type === types.SECONDARY_WORD) {
      if (item.alignmentIndex === undefined) {
        // TRICKY: tokens from the word list will not have an alignment
        canDrop = !alignmentEmpty;
      } else {
        const alignmentPositionDelta = props.alignmentIndex - item.alignmentIndex;
        canDrop = alignmentPositionDelta !== 0 && !alignmentEmpty;
      }
      return canDrop;
    }

    if (item.type === types.PRIMARY_WORD) {
      return canDropPrimaryToken(props, item);
    }
  },
  drop(props, monitor) {
    props.onDrop(monitor.getItem());
  },
};

const collect = (connect, monitor) => {
  const item = monitor.getItem();
  return {
    connectDropTarget: connect.dropTarget(),
    dragItemType: item ? item.type : null,
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
  };
};

export default DropTarget(
  [types.SECONDARY_WORD, types.PRIMARY_WORD],
  dragHandler,
  collect,
)(DroppableAlignmentCard);
