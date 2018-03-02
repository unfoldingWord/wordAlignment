import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {DropTarget} from 'react-dnd';
import * as types from './WordCard/Types';
import SecondaryWord from './SecondaryWord';
import PrimaryWord from './PrimaryWord';

const makeStyles = (props) => {
  const {topWords, canDrop, isOver, bottomWords} = props;
  const emptyAlignment = topWords.length === 0 && bottomWords.length === 0;
  const largeAlignment = topWords.length > 1 || bottomWords.length > 1;

  const defaultAlignmentWidth = '115px';

  return {
    root: {
      padding: '10px',
      backgroundColor: '#DCDCDC',
      margin: '0px 10px 10px 0px',
      minWidth: emptyAlignment ? 0 : defaultAlignmentWidth,
      flexGrow: largeAlignment ? 1 : 0
    },
    wrapper: {
      display: 'flex',
      flexDirection: 'column',
      width: emptyAlignment ? '50%' : '100%',
      backgroundColor: '#DCDCDC'
    },
    top: {
      padding: topWords.length === 0 ? '15px 0px' : '1px 0'
    },
    bottom: {
      padding: bottomWords.length === 0 ?
        '15px 0px' :
        canDrop ?
          '15px 0px' :
          '0px',
      border: isOver && canDrop ?
        '3px dashed #44C6FF' :
        bottomWords.length === 0 ?
          '3px dashed #ffffff' :
          canDrop ?
            '3px dashed #ffffff' :
            ''
    }
  };
};

/**
 * Renders the alignment of primary and secondary words/phrases
 */
class Alignment extends Component {
  render() {
    const {lexicons, alignmentIndex, canDrop, bottomWords, connectDropTarget, topWords} = this.props;
    const styles = makeStyles(this.props);

    let dropBoxDiv = (
      <div style={styles.root}>
        <div style={styles.wrapper}>
          <div style={styles.top}>
            <div style={{display: 'flex', marginBottom: '5px'}}>
              {
                topWords.map((wordObject, index) => (
                  <PrimaryWord
                    key={index}
                    wordObject={wordObject}
                    alignmentIndex={alignmentIndex}
                    lexicons={lexicons}
                    actions={this.props.actions}
                  />
                ))
              }
            </div>
          </div>
          <div style={styles.bottom}>
            {bottomWords.length > 0 &&
            <div style={{display: 'flex'}}>
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
    const emptyAlignment = topWords.length === 0 && bottomWords.length === 0;
    if (emptyAlignment) {
      dropBoxDiv = canDrop ? dropBoxDiv : <div/>;
    }
    return connectDropTarget(
      dropBoxDiv
    );
  }
}

Alignment.propTypes = {
  draggingColor: PropTypes.string,
  siblingTopWords: PropTypes.array,
  lastDroppedItem: PropTypes.object,

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
    let canDrop;
    if (item.type === types.SECONDARY_WORD) {
      const alignmentIndexDelta = props.alignmentIndex - item.alignmentIndex;
      canDrop = alignmentIndexDelta !== 0 && !alignmentEmpty;
      return canDrop;
    }
    if (item.type === types.PRIMARY_WORD) {
      const alignmentIndexDelta = props.alignmentIndex - item.alignmentIndex;
      const enoughSiblingTopWords = props.siblingTopWords &&
        props.siblingTopWords.length > 1;
      if (alignmentIndexDelta === 0 && alignmentEmpty &&
        enoughSiblingTopWords) {
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
  [types.SECONDARY_WORD, types.PRIMARY_WORD],
  dragHandler,
  collect
)(Alignment);
