import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Generates the styles for the component
 * @param props
 * @return {*}
 */
const makeStyles = (props) => {
  const { topWords, hoverTop, hoverBottom, bottomWords, acceptsTopWords, acceptsBottomWords } = props;
  const emptyTop = !topWords || topWords.length === 0;
  const emptyBottom = !bottomWords || bottomWords.length === 0;
  const emptyAlignment = emptyTop && emptyBottom;
  const largeAlignment = (!emptyTop && topWords.length > 1) || (!emptyBottom && bottomWords.length > 1);

  const defaultAlignmentWidth = '115px';
  const blueBorder = '3px dashed #44C6FF';
  const clearBorder = '3px dashed transparent';
  const whiteBorder = '3px dashed #ffffff';
  const transitionSpeed = '0.25s';

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
 * @property {array} topWords
 * @property {array} bottomWords
 * @property {bool} hoverBottom - a bottom word is hover over this component
 * @property {bool} hoverTop - a top word is hovering over this component
 * @property {bool} acceptsTopWords - this component accepts dropped top words
 * @property {bool} acceptsBottomWords - this component accepts dropped bottom words
 */
class AlignmentCard extends Component {
  render() {
    const { bottomWords, topWords } = this.props;
    const styles = makeStyles(this.props);

    return (
      <div style={styles.root}>
        <div style={styles.content}>
          <div style={styles.top}>
            <div style={styles.topRow}>
              {topWords}
            </div>
          </div>
          <div style={styles.bottom}>
            <div style={styles.bottomRow}>
              {bottomWords}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

AlignmentCard.propTypes = {
  topWords: PropTypes.array,
  bottomWords: PropTypes.array,
  hoverBottom: PropTypes.bool,
  hoverTop: PropTypes.bool,
  acceptsTopWords: PropTypes.bool,
  acceptsBottomWords: PropTypes.bool,
};

export default AlignmentCard;
