import React from 'react';
import PropTypes from 'prop-types';
import {DropTarget} from 'react-dnd';
import * as types from '../WordCard/Types';
import WordList from './WordList';
import Token from 'word-map/structures/Token';

/**
 * Renders a word bank with drag-drop support
 */
class DroppableWordList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wordListScrollTop: null
    };
  }

  setScrollState(wordList, nextProps) {
    if (this.props.chapter !== nextProps.chapter || this.props.verse !== nextProps.verse) {
      wordList.scrollTop = 0;
      this.setState({wordListScrollTop: null});
    } else if (! this.props.isOver) {
      this.setState({wordListScrollTop: wordList.scrollTop});
    }
  }

  setWordListScroll(wordList) {
    if (! this.props.isOver && this.state.wordListScrollTop) {
      wordList.scrollTop = this.state.wordListScrollTop;
      this.setState({wordListScrollTop: null});
    }
  }

  componentWillReceiveProps(nextProps) {
    let wordList = document.getElementById('wordList');
    if(! wordList)
      wordList = this.props.wordList;
    this.setScrollState(wordList, nextProps);
  }

  componentDidUpdate() {
    let wordList = document.getElementById('wordList');
    if(! wordList)
      wordList = this.props.wordList;
    this.setWordListScroll(wordList);
  }

  render() {
    const {words, chapter, verse, connectDropTarget, isOver} = this.props;
    return connectDropTarget(
      <div
        id='wordList'
        style={{
          flex: 0.2,
          width: '100%',
          backgroundColor: '#DCDCDC',
          overflowY: 'auto',
          padding: '5px 8px 5px 5px'
        }}
      >
        <WordList
          chapter={chapter}
          verse={verse}
          words={words}
          isOver={isOver} />
      </div>
    );
  }
}

DroppableWordList.propTypes = {
  chapter: PropTypes.number,
  verse: PropTypes.number,
  words: PropTypes.arrayOf(PropTypes.instanceOf(Token)),
  connectDropTarget: PropTypes.func.isRequired,
  isOver: PropTypes.bool.isRequired,
  moveBackToWordBank: PropTypes.func.isRequired,
  wordList: PropTypes.object
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
