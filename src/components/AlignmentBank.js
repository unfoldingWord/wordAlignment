import React, { Component } from 'react';
import PropTypes from 'prop-types';
// constants
import * as types from './Word/Types';
// components
import Alignment from './Alignment';

class AlignmentBank extends Component {
  render() {
    const {
      actions,
      resourcesReducer,
      wordAlignmentReducer,
      contextIdReducer: {
        contextId
      }
    } = this.props;

    if (!contextId) {
      return <div />;
    }
    const { chapter, verse } = contextId.reference;
    const alignmentData = wordAlignmentReducer.alignmentData;
    const alignments = alignmentData && alignmentData[chapter] && alignmentData[chapter][verse] ? alignmentData[chapter][verse].alignments : [];
    return (
      <div id='AlignmentBank' style={{ display: 'flex', flexWrap: 'wrap', height: '100%', backgroundColor: '#ffffff', padding: '0px 10px 50px', overflowY: 'auto' }}>
        {
          alignments.map((alignment, index) => {
            return (
              <div key={index} style={{ display: 'flex' }}>
                <Alignment
                  alignmentIndex={index}
                  bottomWords={alignment.bottomWords}
                  topWords={alignment.topWords}
                  onDrop={item => this.handleDrop(index, item)}
                  actions={actions}
                  resourcesReducer={resourcesReducer}
                />
                <Alignment
                  alignmentIndex={index}
                  bottomWords={[]}
                  topWords={[]}
                  siblingTopWords={alignment.topWords}
                  onDrop={item => this.handleDrop(index, item)}
                  actions={actions}
                  resourcesReducer={resourcesReducer}
                />
              </div>
            );
          })
        }
      </div>
    );
  }

  handleDrop(index, item) {
    if (item.type === types.SECONDARY_WORD) {
      this.props.actions.moveWordBankItemToAlignment(index, item);
    }
    if (item.type === types.PRIMARY_WORD) {
      this.props.actions.moveTopWordItemToAlignment(item, item.alignmentIndex, index);
    }
  }
}



AlignmentBank.propTypes = {
  wordAlignmentReducer: PropTypes.object.isRequired,
  contextIdReducer: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  resourcesReducer: PropTypes.shape({
    lexicons: PropTypes.object.isRequired
  })
};

export default AlignmentBank;
