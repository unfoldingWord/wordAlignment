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
    padding: '0px 10px 10px',
    overflowY: 'auto',
    flexGrow: 2,
    alignContent: 'flex-start'
  }
};

/**
 * Renders a grid of word/phrase alignments
 */
class AlignmentGrid extends Component {
  render() {
    const {
      translate,
      actions,
      lexicons,
      alignments,
      contextId
    } = this.props;

    if (!contextId) {
      return <div/>;
    }
    // TODO: add support for dragging to left of card. See utils/dragDrop.js
    return (
      <div id='AlignmentGrid' style={styles.root}>
        {
          alignments.map((alignment, key) => {
            return (
              <React.Fragment key={key}>
                {/* placeholder for un-merging primary words */}
                {/* TODO: cannot place this here due to this bug https://github.com/react-dnd/react-dnd/issues/735*/}
                {/*<AlignmentCard*/}
                  {/*translate={translate}*/}
                  {/*alignmentIndex={index}*/}
                  {/*placeholderPosition="left"*/}
                  {/*bottomWords={[]}*/}
                  {/*topWords={[]}*/}
                  {/*onDrop={item => this.handleDrop(index, item)}*/}
                  {/*actions={actions}*/}
                  {/*lexicons={lexicons}*/}
                {/*/>*/}

                <AlignmentCard
                  translate={translate}
                  alignment={alignment}
                  alignmentPosition={alignment.position}
                  alignmentIndex={alignment.index}
                  targetNgram={alignment.targetNgram}
                  sourceNgram={alignment.sourceNgram}
                  onDrop={item => this.handleDrop(alignment, item)}
                  actions={actions}
                  lexicons={lexicons}
                />
                {/* placeholder for un-merging primary words */}
                <AlignmentCard
                  translate={translate}
                  alignment={alignment}
                  alignmentPosition={alignment.position}
                  alignmentIndex={alignment.index}
                  placeholderPosition="right"
                  targetNgram={[]}
                  sourceNgram={[]}
                  onDrop={item => this.handleDrop(alignment, item)}
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

  handleDrop(alignment, item) {
    const {onDropTargetToken, onDropSourceToken} = this.props;
    if (item.type === types.SECONDARY_WORD) {
      onDropTargetToken(item.token, alignment, item.alignment);
    }
    if (item.type === types.PRIMARY_WORD) {
      onDropSourceToken(item.token, alignment, item.alignment);
    }
  }
}

AlignmentGrid.propTypes = {
  onDropTargetToken: PropTypes.func.isRequired,
  onDropSourceToken: PropTypes.func.isRequired,
  alignments: PropTypes.array.isRequired,
  contextId: PropTypes.object,
  translate: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  lexicons: PropTypes.object.isRequired
};

export default AlignmentGrid;
