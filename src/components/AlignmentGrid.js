import React, { Component } from 'react';
import PropTypes from 'prop-types';
// constants
import { getLexiconData } from '../utils/lexiconHelpers';
import { getFontClassName } from '../common/fontUtils';
import * as types from './WordCard/Types';
// components
import AlignmentCard from './AlignmentCard';
// helpers

const makeStyles = props => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    height: '100%',
    backgroundColor: '#ffffff',
    padding: '0px 10px 10px',
    overflowY: 'auto',
    flexGrow: 2,
    direction: props.sourceDirection,
    alignContent: 'flex-start',
  },
  warning: {
    padding: '20px',
    backgroundColor: '#ccc',
    display: 'inline-block',
  },
});

/**
 * Renders a grid of word/phrase alignments
 */
class AlignmentGrid extends Component {
  render() {
    const {
      translate,
      lexicons,
      onCancelSuggestion,
      sourceDirection,
      targetDirection,
      onAcceptTokenSuggestion,
      sourceStyle,
      alignments,
      contextId,
      isHebrew,
      showPopover,
      toolsSettings,
      loadLexiconEntry,
      targetLanguageFont,
    } = this.props;

    if (!contextId) {
      return <div/>;
    }

    const styles = makeStyles(this.props);
    const targetLanguageFontClassName = getFontClassName(targetLanguageFont);
    const { fontSize } = toolsSettings['AlignmentGrid'] || {};

    if (fontSize) {
      styles.root.fontSize = `${fontSize}%`;
    }

    // TODO: add support for dragging to left of card. See utils/dragDrop.js
    return (
      <div id='AlignmentGrid' style={styles.root}>
        {
          alignments.map((alignment, key) => (
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
                lexicons={lexicons}
                isHebrew={isHebrew}
                showPopover={showPopover}
                getLexiconData={getLexiconData}
                loadLexiconEntry={loadLexiconEntry}
                fontSize={fontSize}
                targetLanguageFontClassName={targetLanguageFontClassName}
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
                showPopover={showPopover}
                getLexiconData={getLexiconData}
                loadLexiconEntry={loadLexiconEntry}
                lexicons={lexicons}
                isHebrew={isHebrew}
                fontSize={fontSize}
                targetLanguageFontClassName={targetLanguageFontClassName}
              />
            </React.Fragment>
          ))
        }
      </div>
    );
  }

  handleDrop(alignmentIndex, item) {
    const { onDropTargetToken, onDropSourceToken } = this.props;

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
  lexicons: PropTypes.object.isRequired,
  toolsSettings: PropTypes.object.isRequired,
  sourceDirection: PropTypes.oneOf(['ltr', 'rtl']),
  targetDirection: PropTypes.oneOf(['ltr', 'rtl']),
  isHebrew: PropTypes.bool.isRequired,
  showPopover: PropTypes.func.isRequired,
  loadLexiconEntry: PropTypes.func.isRequired,
  targetLanguageFont: PropTypes.string,
};

AlignmentGrid.defaultProps = {
  sourceDirection: 'ltr',
  targetDirection: 'ltr',
  sourceStyle: { fontSize: '100%' },
};

export default AlignmentGrid;
