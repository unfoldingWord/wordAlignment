import React, { Component } from 'react';
import PropTypes from 'prop-types';
// helpers
import * as lexiconHelpers from '../../helpers/lexiconHelpers';
import WordDetails from '../WordDetails';

const internalStyle = {
  borderLeft: '5px solid #44C6FF',
  padding: '10px',
  marginBottom: '5px',
  color: '#ffffff',
  textAlign: 'center',
  backgroundColor: '#333333',
  boxShadow: "0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset",
  cursor: 'move'
};

class TopWordCard extends Component {
  componentWillMount() {
    const {words} = this.props;
    if (words.constructor == Array) {
      this.props.words.forEach((word) => {
        const {strongs} = word;
        if (!strongs) return;
        const entryId = lexiconHelpers.lexiconEntryIdFromStrongs(strongs);
        const lexiconId = lexiconHelpers.lexiconIdFromStrongs(strongs);
        this.props.actions.loadLexiconEntry(lexiconId, entryId);
      });
    }
  }

  onClick(e, word) {
    let positionCoord = e.target;
    const PopoverTitle = <strong style={{ fontSize: '1.2em' }}>{word.word}</strong>;
    let { showPopover } = this.props.actions;
    const wordDetails = <WordDetails {...this.props} word={word} />;
    showPopover(PopoverTitle, wordDetails, positionCoord);
  }
  render() {
    const { words, style } = this.props;
    return (
      <span style={{ ...internalStyle, ...style }}>
        {
          words.map((wordObject, index) => (
            <span onClick={(e) => this.onClick(e, wordObject)} key={index}>{wordObject.word}&nbsp;</span>
          ))
        }
      </span>
    );
  }
}

TopWordCard.propTypes = {
  words: PropTypes.array.isRequired,
  style: PropTypes.object,
  actions: {
    showPopover: PropTypes.func.isRequired
  }
};

export default TopWordCard;