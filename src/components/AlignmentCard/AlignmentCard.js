import React, {Component} from 'react';
import PropTypes from 'prop-types';

/**
 * Generates the styles for the component
 * @param props
 * @return {*}
 */
const makeStyles = (props) => {
  const {
    isSuggestion,
    sourceTokenCards,
    hoverTop,
    hoverBottom,
    targetDirection,
    targetTokenCards,
    acceptsSourceTokens,
    acceptsTargetTokens
  } = props;
  const emptyTop = !sourceTokenCards || sourceTokenCards.length === 0;
  const emptyBottom = !targetTokenCards || targetTokenCards.length === 0;
  const emptyAlignment = emptyTop && emptyBottom;
  const largeAlignment = (!emptyTop && sourceTokenCards.length > 1) ||
    (!emptyBottom && targetTokenCards.length > 1);

  const defaultAlignmentWidth = '115px';
  const blueBorder = '3px dashed #44C6FF';
  const clearBorder = '3px dashed transparent';
  const whiteBorder = '3px dashed #ffffff';
  const transitionSpeed = '0.1s';

  const rowStyle = {
    display: 'flex',
    transition: transitionSpeed,
    position: 'relative'
  };
  const styles = {
    root: {
      padding: '7px',
      backgroundColor: isSuggestion ? '#bedac2' : '#DCDCDC',
      margin: '0px 10px 10px 0px',
      minWidth: emptyAlignment ?
        `calc(${defaultAlignmentWidth}/2)` :
        defaultAlignmentWidth,
      flexGrow: largeAlignment ? 1 : 0
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    },
    top: {
      transition: transitionSpeed,
      flexGrow: 1,
      width: '100%',
      minHeight: '45px',
      border: emptyTop || acceptsSourceTokens ? whiteBorder : clearBorder,
      boxSizing: 'border-box',
      marginBottom: '7px'
    },
    bottom: {
      transition: transitionSpeed,
      flexGrow: 1,
      width: '100%',
      direction: targetDirection,
      minHeight: '45px',
      border: emptyBottom || acceptsTargetTokens ? whiteBorder : clearBorder,
      boxSizing: 'border-box'
    },
    topRow: {
      ...rowStyle,
      top: acceptsSourceTokens ? '7px' : 0,
      left: acceptsSourceTokens ? '7px' : 0,
      opacity: hoverTop ? '0.8' : 1
    },
    bottomRow: {
      ...rowStyle,
      top: acceptsTargetTokens ? '7px' : 0,
      left: acceptsTargetTokens ? '7px' : 0,
      opacity: hoverBottom ? '0.8' : 1
    }
  };

  if (hoverTop && acceptsSourceTokens) {
    styles.top.border = blueBorder;
  }
  if (hoverBottom && acceptsTargetTokens) {
    styles.bottom.border = blueBorder;
  }
  return styles;
};

/**
 * Renders the alignment of source and target n-grams
 *
 * @property {array} sourceTokenCards
 * @property {array} targetTokenCards
 * @property {bool} hoverBottom - a bottom word is hover over this component
 * @property {bool} hoverTop - a top word is hovering over this component
 * @property {bool} acceptsSourceTokens - this component accepts dropped source tokens
 * @property {bool} acceptsTargetTokens - this component accepts dropped target tokens
 */
class AlignmentCard extends Component {
  render() {
    const {targetTokenCards, sourceTokenCards} = this.props;
    const styles = makeStyles(this.props);
    return (
      <div style={styles.root}>
        <div style={styles.content}>
          <div style={styles.top}>
            <div style={styles.topRow}>
              {sourceTokenCards}
            </div>
          </div>
          <div style={styles.bottom}>
            <div style={styles.bottomRow}>
              {targetTokenCards}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

AlignmentCard.propTypes = {
  isSuggestion: PropTypes.bool,
  sourceTokenCards: PropTypes.array.isRequired,
  targetTokenCards: PropTypes.array.isRequired,
  hoverBottom: PropTypes.bool,
  hoverTop: PropTypes.bool,
  acceptsSourceTokens: PropTypes.bool,
  acceptsTargetTokens: PropTypes.bool,
  targetDirection: PropTypes.oneOf(['rtl', 'ltr'])
};
AlignmentCard.defaultProps = {
  isSuggestion: false,
  targetDirection: 'ltr'
};

export default AlignmentCard;
