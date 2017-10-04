import React, {Component} from 'react';
import PropTypes from 'prop-types';
// constants
import ItemTypes from '../ItemTypes';
// components
import DropBoxItem from '../DropBoxItem';

class DropBoxArea extends Component {

  render() {
    const {contextIdReducer, wordAlignmentReducer} = this.props;
    if (contextIdReducer.contextId) {
      let { chapter, verse } = contextIdReducer.contextId.reference;
      let alignments = wordAlignmentReducer.alignmentData[chapter][verse].alignments;

      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', height: '100%', backgroundColor: '#ffffff', padding: '0px 10px 50px', overflowY: 'auto' }}>
        {
          alignments.map((alignment, index) => {
            return (
              <DropBoxItem
                key={index}
                alignmentIndex={index}
                bottomWords={alignment.bottomWords}
                topWords={alignment.topWords}
                onDrop={item => this.handleDrop(index, item)}
              />
            );
          })
        }
        </div>
      );
    }
    return <div />;
  }

  handleDrop(index, wordBankItem) {
    switch (wordBankItem.type) {
      case ItemTypes.BOTTOM_WORD: {
        this.props.actions.moveWordBankItemToAlignment(index, wordBankItem);
        break;
      }
      case ItemTypes.TOP_WORD: {
        // this.props.actions.moveTopWordToAlignment(index, wordBankItem);
        break;
      }
      default: {
        // Do nothing
      }
    }
  }
}

DropBoxArea.propTypes = {
  wordAlignmentReducer: PropTypes.object.isRequired,
  contextIdReducer: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
};

export default DropBoxArea;
