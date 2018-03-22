import React from 'react';
import PropTypes from 'prop-types';
import {DropTarget} from 'react-dnd';
import * as types from '../WordCard/Types';
import WordList from './WordList';
import Word from '../../specs/Word';

/**
 * Renders a word bank with drag-drop support
 */
class DroppableWordList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {wordBankScrollTop: null};
  }

  componentWillReceiveProps(nextProps) {
    let wordBank = document.getElementById('wordBank');
    if (wordBank) {
      if (this.props.chapter != nextProps.chapter || this.props.verse != nextProps.verse) {
        wordBank.scrollTop = 0;
        this.setState({wordBankScrollTop: null});
      } else if (! this.props.isOver && nextProps.isOver) {
        this.setState({wordBankScrollTop: wordBank.scrollTop});
      }
    }
  }

  componentDidUpdate() {
    let wordBank = document.getElementById('wordBank');
    if (wordBank && ! this.props.isOver && this.state.wordBankScrollTop) {
      wordBank.scrollTop = this.state.wordBankScrollTop;
      this.setState({wordBankScrollTop: null});
    }
  }

  render() {
    const {words, chapter, verse, connectDropTarget, isOver} = this.props;
    return connectDropTarget(
      <div
        id='wordBank'
        style={{
          flex: 0.2,
          width: '100%',
          backgroundColor: '#DCDCDC',
          overflowY: 'auto',
          padding: '5px 8px 5px 5px'
        }}
      >
        <WordList chapter={chapter}
                  verse={verse}
                  words={words}
                  isOver={isOver}/>
      </div>
    );
  }
}

DroppableWordList.propTypes = {
  chapter: PropTypes.number,
  verse: PropTypes.number,
  words: PropTypes.arrayOf(PropTypes.instanceOf(Word)),
  connectDropTarget: PropTypes.func.isRequired,
  isOver: PropTypes.bool.isRequired,
  moveBackToWordBank: PropTypes.func.isRequired
};

/**
 * Handles drag events on the word bank
 */
const dragHandler = {
  drop(props, monitor) {
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
