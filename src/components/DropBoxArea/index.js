import React, { Component } from 'react';
import PropTypes from 'prop-types';
// constants
import ItemTypes from '../ItemTypes';
// components
import DropBoxItem from '../DropBoxItem';

class DropBoxArea extends Component {
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
    const alignments = wordAlignmentReducer.alignmentData[chapter][verse].alignments;
    return (
      <div id='DropBoxArea' style={{ display: 'flex', flexWrap: 'wrap', height: '100%', backgroundColor: '#ffffff', padding: '0px 10px 50px', overflowY: 'auto' }}>
        {
          alignments.map((alignment, index) => {
            return (
              <div key={index} style={{ display: 'flex' }}>
                <DropBoxItem
                  alignmentIndex={index}
                  bottomWords={alignment.bottomWords}
                  topWords={alignment.topWords}
                  onDrop={item => this.handleDrop(index, item)}
                  actions={actions}
                  resourcesReducer={resourcesReducer}
                />
                <DropBoxItem
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
    if (item.type === ItemTypes.BOTTOM_WORD) {
      this.props.actions.moveWordBankItemToAlignment(index, item);
    }
    if (item.type === ItemTypes.TOP_WORD) {
      this.props.actions.moveTopWordItemToAlignment(item, item.alignmentIndex, index);
    }
  }
}



DropBoxArea.propTypes = {
  wordAlignmentReducer: PropTypes.object.isRequired,
  contextIdReducer: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  resourcesReducer: PropTypes.shape({
    lexicons: PropTypes.object.isRequired
  })
};

export default DropBoxArea;
