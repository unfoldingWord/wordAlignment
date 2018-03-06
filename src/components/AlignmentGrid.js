import React, {Component} from 'react';
import PropTypes from 'prop-types';
// constants
import * as types from './WordCard/Types';
// components
import AlignmentCard from './AlignmentCard';

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    backgroundColor: '#ffffff',
    padding: '0px 10px 50px',
    overflowY: 'auto'
  }
};

/**
 * Renders a grid of word/phrase alignments
 */
class AlignmentGrid extends Component {
  render() {
    const {
      actions,
      lexicons,
      alignmentData,
      contextId
    } = this.props;

    if (!contextId) {
      return <div/>;
    }
    const {chapter, verse} = contextId.reference;
    const alignments = alignmentData && alignmentData[chapter] &&
    alignmentData[chapter][verse] ?
      alignmentData[chapter][verse].alignments :
      [];
    return (
      <div id='AlignmentGrid' style={styles.root}>
        {
          alignments.map((alignment, index) => {
            return (
              <React.Fragment key={index}>
                <AlignmentCard
                  alignmentIndex={index}
                  bottomWords={alignment.bottomWords}
                  topWords={alignment.topWords}
                  onDrop={item => this.handleDrop(index, item)}
                  actions={actions}
                  lexicons={lexicons}
                />
                {/* placeholder for un-merging primary words */}
                <AlignmentCard
                  alignmentIndex={index}
                  bottomWords={[]}
                  topWords={[]}
                  siblingTopWords={alignment.topWords}
                  onDrop={item => this.handleDrop(index, item)}
                  actions={actions}
                  lexicons={lexicons}
                />
              </React.Fragment>
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
      this.props.actions.moveTopWordItemToAlignment(item, item.alignmentIndex,
        index);
    }
  }
}

AlignmentGrid.propTypes = {
  alignmentData: PropTypes.object,
  contextId: PropTypes.object,

  actions: PropTypes.object.isRequired,
  lexicons: PropTypes.object.isRequired
};

export default AlignmentGrid;
