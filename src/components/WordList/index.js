import React from 'react';
import PropTypes from 'prop-types';
import {DropTarget} from 'react-dnd';
import {Token} from 'wordmap-lexer';
import * as types from '../WordCard/Types';
import WordList from './WordList';

/**
 * Renders a word bank with drag-drop support
 */
class DroppableWordList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wordListScrollTop: null,
      selectedWordPositions: [],
      selectedWords: []
    };
    this.handleWordSelection = this.handleWordSelection.bind(this);
    this.clearWordSelections = this.clearWordSelections.bind(this);
    this.onEscapeKeyPressed = this.onEscapeKeyPressed.bind(this);
  }

  setScrollState(wordList, nextProps) {
    if (this.props.chapter !== nextProps.chapter || this.props.verse !== nextProps.verse) {
      wordList.scrollTop = 0;
      this.setState({wordListScrollTop: null});
    } else if (!this.props.isOver) {
      this.setState({wordListScrollTop: wordList.scrollTop});
    }
  }

  setWordListScroll(wordList) {
    if (!this.props.isOver && this.state.wordListScrollTop) {
      wordList.scrollTop = this.state.wordListScrollTop;
      this.setState({wordListScrollTop: null});
    }
  }

  resetSelectedWordsState(nextProps) {
    if (this.props.chapter !== nextProps.chapter || this.props.verse !== nextProps.verse || nextProps.reset) {
      this.clearWordSelections();
    }
  }

  componentWillReceiveProps(nextProps) {
    let wordList = document.getElementById('wordList');
    if (!wordList)
      wordList = this.props.wordList;
    this.setScrollState(wordList, nextProps);
    this.resetSelectedWordsState(nextProps);
  }

  componentDidMount() {
    window.addEventListener('keydown', this.onEscapeKeyPressed);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onEscapeKeyPressed);
  }

  onEscapeKeyPressed(event) {
    if (event.key === 'Escape' || event.keyCode === 27) {
      this.clearWordSelections();
    }
  }

  componentDidUpdate() {
    let wordList = document.getElementById('wordList');
    if (!wordList)
      wordList = this.props.wordList;
    this.setWordListScroll(wordList);
  }

  /**
   * maintains the list of selected words
   * @param token
   */
  handleWordSelection(token) {
    const {selectedWordPositions, selectedWords} = this.state;
    let positions = [...selectedWordPositions];
    let words = [...selectedWords];

    const index = positions.indexOf(token.tokenPos);
    if (index === -1) {
      positions.push(token.tokenPos);
      words.push(token);
    } else {
      positions.splice(index, 1);
      words.splice(index, 1);
    }

    this.setState({
      selectedWords: words,
      selectedWordPositions: positions
    });
  }

  /**
   * Un-selects all words in the list
   */
  clearWordSelections() {
    this.setState({
      selectedWords: [],
      selectedWordPositions: []
    });
  }

  render() {
    const {words, chapter, verse, connectDropTarget, isOver, direction} = this.props;
    const {selectedWords, selectedWordPositions} = this.state;
    return connectDropTarget(
      <div
        id='wordList'
        style={{
          height: '100%',
          width: '150px',
          backgroundColor: '#DCDCDC',
          overflowY: 'auto',
          padding: '5px 8px 5px 5px',
          direction: direction
        }}
      >
        <WordList
          direction={direction}
          onWordDragged={this.clearWordSelections}
          onWordClick={this.handleWordSelection}
          selectedWordPositions={selectedWordPositions}
          selectedWords={selectedWords}
          chapter={chapter}
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
  words: PropTypes.arrayOf(PropTypes.instanceOf(Token)),
  connectDropTarget: PropTypes.func.isRequired,
  isOver: PropTypes.bool.isRequired,
  onDropTargetToken: PropTypes.func.isRequired,
  wordList: PropTypes.object,
  direction: PropTypes.oneOf(['ltr', 'rtl']),
  reset: PropTypes.bool
};

DroppableWordList.defaultProps = {
  direction: 'ltr',
  reset: false
};

/**
 * Handles drag events on the word bank
 */
const dragHandler = {
  drop(props, monitor) {
    const item = monitor.getItem();
    if (item.alignmentIndex !== undefined) {
      props.onDropTargetToken(item.token, item.alignmentIndex);
    }
  }
};

const collect = (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
  };
};

export default DropTarget(
  types.SECONDARY_WORD,
  dragHandler,
  collect
)(DroppableWordList);
