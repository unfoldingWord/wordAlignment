import React, {Component} from 'react';
import PropTypes from 'prop-types';
// components
import DropBoxItem from '../DropBoxItem';

class DropBoxArea extends Component {

  render() {
    const {contextIdReducer, wordAlignmentReducer, } = this.props;
    let { bibles } = this.props.resourcesReducer;
    if (contextIdReducer.contextId) {
      let { chapter, verse } = contextIdReducer.contextId.reference;
      let alignments = wordAlignmentReducer.alignmentData[chapter][verse].alignments;
      let verseText = bibles['ugnt'][chapter] ? bibles['ugnt'][chapter][verse] : null;
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
                verseText={verseText}
                actions={this.props.actions}
                resourcesReducer={this.props.resourcesReducer}
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
    this.props.actions.moveWordBankItemToAlignment(index, wordBankItem);
  }
}

DropBoxArea.propTypes = {
  wordAlignmentReducer: PropTypes.object.isRequired,
  contextIdReducer: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
};

export default DropBoxArea;
