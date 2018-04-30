import React, { Component } from 'react';
import PropTypes from 'prop-types';
// constants
const noBibleTextWarning = `[WARNING: This Bible version does not include text for this reference.]`;
/**
 * Generates the styles for the component
 * @param props
 * @return {*}
 */
const makeStyles = (props) => {
  const { topWordCards, hoverTop, hoverBottom, bottomWordCards, acceptsTopWords, acceptsBottomWords } = props;
  const emptyTop = !topWordCards || topWordCards.length === 0;
  const emptyBottom = !bottomWordCards || bottomWordCards.length === 0;
  const emptyAlignment = emptyTop && emptyBottom;
  const largeAlignment = (!emptyTop && topWordCards.length > 1) || (!emptyBottom && bottomWordCards.length > 1);

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
      transition: transitionSpeed,
      padding: '7px',
      backgroundColor: '#DCDCDC',
      margin: '0px 10px 10px 0px',
      minWidth: emptyAlignment ? `calc(${defaultAlignmentWidth}/2)` : defaultAlignmentWidth,
      flexGrow: largeAlignment ? 1 : 0
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#DCDCDC'
    },
    top: {
      transition: transitionSpeed,
      flexGrow: 1,
      width: '100%',
      minHeight: '45px',
      border: emptyTop || acceptsTopWords ? whiteBorder : clearBorder,
      boxSizing: 'border-box',
      marginBottom: '7px'
    },
    bottom: {
      transition: transitionSpeed,
      flexGrow: 1,
      width: '100%',
      minHeight: '45px',
      border: emptyBottom || acceptsBottomWords ? whiteBorder : clearBorder,
      boxSizing: 'border-box'
    },
    topRow: {
      ...rowStyle,
      top: acceptsTopWords ? '7px' : 0,
      left: acceptsTopWords ? '7px' : 0,
      opacity: hoverTop ? '0.8' : 1
    },
    bottomRow: {
      ...rowStyle,
      top: acceptsBottomWords ? '7px' : 0,
      left: acceptsBottomWords ? '7px' : 0,
      opacity: hoverBottom ? '0.8' : 1
    }
  };

  if (hoverTop && acceptsTopWords) {
    styles.top.border = blueBorder;
  }
  if (hoverBottom && acceptsBottomWords) {
    styles.bottom.border = blueBorder;
  }
  return styles;
};

/**
 * Renders the alignment of primary and secondary words/phrases
 *
 * @property {array} topWordCards
 * @property {array} bottomWordsCards
 * @property {array} topWords
 * @property {bool} hoverBottom - a bottom word is hover over this component
 * @property {bool} hoverTop - a top word is hovering over this component
 * @property {bool} acceptsTopWords - this component accepts dropped top words
 * @property {bool} acceptsBottomWords - this component accepts dropped bottom words
 */
class AlignmentCard extends Component {
  render() {
    const { bottomWordCards, topWordCards, topWords } = this.props;
    const styles = makeStyles(this.props);
    let alignmentCardContent = <div/>;

     // if there is no top words show warning alert
     if (topWords.length === 1 && !topWords[0].text) {
      alignmentCardContent = (
        <div style={{ ...styles.content, width: '280px', height: '100px', fontSize: '20px', padding: '5px' }}>
          {noBibleTextWarning}
        </div>
      );
    } else {
      alignmentCardContent = (
        <div style={styles.content}>
          <div style={styles.top}>
            <div style={styles.topRow}>
              {topWordCards}
            </div>
          </div>
          <div style={styles.bottom}>
            <div style={styles.bottomRow}>
              {bottomWordCards}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={styles.root}>
        {alignmentCardContent}
      </div>
    );
  }
}

AlignmentCard.propTypes = {
  topWords: PropTypes.array,
  topWordCards: PropTypes.array,
  bottomWordCards: PropTypes.array,
  hoverBottom: PropTypes.bool,
  hoverTop: PropTypes.bool,
  acceptsTopWords: PropTypes.bool,
  acceptsBottomWords: PropTypes.bool,
};

export default AlignmentCard;
