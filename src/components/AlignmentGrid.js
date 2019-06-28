import React, {Component} from 'react';
import PropTypes from 'prop-types';
// constants
import * as types from './WordCard/Types';
// components
import AlignmentCard from './AlignmentCard';

const makeStyles = props => {
  return {
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      backgroundColor: '#ffffff',
      padding: '0px 10px 10px',
      overflowY: 'auto',
      flexGrow: 2,
      direction: props.sourceDirection,
      alignContent: 'flex-start'
    },
    warning: {
      padding: '20px',
      backgroundColor: '#ccc',
      display: 'inline-block'
    }
  };
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
      onCancelSuggestion,
      sourceDirection,
      targetDirection,
      onAcceptTokenSuggestion,
      sourceStyle,
      alignments,
      contextId,
      isHebrew
    } = this.props;

    if (!contextId) {
      return <div/>;
    }

    const styles = makeStyles(this.props);

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
                  sourceStyle={sourceStyle}
                  sourceDirection={sourceDirection}
                  targetDirection={targetDirection}
                  onCancelTokenSuggestion={onCancelSuggestion}
                  onAcceptTokenSuggestion={onAcceptTokenSuggestion}
                  alignmentIndex={alignment.index}
                  isSuggestion={alignment.isSuggestion}
                  targetNgram={alignment.targetNgram}
                  sourceNgram={alignment.sourceNgram}
                  onDrop={item => this.handleDrop(alignment.index, item)}
                  actions={actions}
                  lexicons={lexicons}
                  isHebrew={isHebrew}
                />
                {/* placeholder for un-merging primary words */}
                <AlignmentCard
                  translate={translate}
                  sourceDirection={sourceDirection}
                  targetDirection={targetDirection}
                  alignmentIndex={alignment.index}
                  isSuggestion={alignment.isSuggestion}
                  placeholderPosition="right"
                  targetNgram={[]}
                  sourceNgram={[]}
                  onDrop={item => this.handleDrop(alignment.index, item)}
                  actions={actions}
                  lexicons={lexicons}
                  isHebrew={isHebrew}
                />
              </React.Fragment>
            );
          })
        }
      </div>
    );
  }

  handleDrop(alignmentIndex, item) {
    const {onDropTargetToken, onDropSourceToken} = this.props;
    if (item.type === types.SECONDARY_WORD) {
      if (item.tokens) {
        // drop selected tokens
        for (let i = 0; i < item.tokens.length; i++) {
          onDropTargetToken(item.tokens[i], alignmentIndex, item.alignmentIndex);
        }
      } else {
        // drop single token
        onDropTargetToken(item.token, alignmentIndex, item.alignmentIndex);
      }
    }
    if (item.type === types.PRIMARY_WORD) {
      onDropSourceToken(item.token, alignmentIndex, item.alignmentIndex);
    }
  }
}

AlignmentGrid.propTypes = {
  onDropTargetToken: PropTypes.func.isRequired,
  onDropSourceToken: PropTypes.func.isRequired,
  onCancelSuggestion: PropTypes.func.isRequired,
  onAcceptTokenSuggestion: PropTypes.func.isRequired,
  sourceStyle: PropTypes.object.isRequired,
  alignments: PropTypes.array.isRequired,
  contextId: PropTypes.object,
  translate: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  lexicons: PropTypes.object.isRequired,
  sourceDirection: PropTypes.oneOf(['ltr', 'rtl']),
  targetDirection: PropTypes.oneOf(['ltr', 'rtl']),
  isHebrew: PropTypes.bool.isRequired
};

AlignmentGrid.defaultProps = {
  sourceDirection: 'ltr',
  targetDirection: 'ltr',
  sourceStyle: {fontSize: "100%"},
};

export default AlignmentGrid;
