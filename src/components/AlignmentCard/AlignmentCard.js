import React, { Component } from 'react';
import PropTypes from 'prop-types';


const makeStyles = (props) => {
  const { topWords, hoverTop, hoverBottom, bottomWords } = props;
  const emptyTop = !topWords || topWords.length === 0;
  const emptyBottom = !bottomWords || bottomWords.length === 0;
  const emptyAlignment = emptyTop && emptyBottom;
  const largeAlignment = (!emptyTop && topWords.length > 1) || (!emptyBottom && bottomWords.length > 1);

  const defaultAlignmentWidth = '115px';
  const blueBorder = '3px dashed #44C6FF';

  const styles= {
    root: {
      padding: '10px',
      backgroundColor: '#DCDCDC',
      margin: '0px 10px 10px 0px',
      minWidth: emptyAlignment ? `calc(${defaultAlignmentWidth}/2)` : defaultAlignmentWidth,
      flexGrow: largeAlignment ? 1 : 0
    },
    wrapper: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#DCDCDC'
    },
    top: {
      width: '100%',
      minHeight: '40px',
      flexGrow: 1,
      boxSizing: 'border-box',
      marginBottom: '10px'
    },
    bottom: {
      flexGrow: 1,
      width: '100%',
      minHeight: '40px',
      border: emptyBottom ? '3px dashed #ffffff' : '',
      boxSizing: 'border-box'
    },
    shim: {

    }
  };
  if(hoverTop && emptyTop) {
    styles.top.border = blueBorder;
  } else if(hoverTop && !emptyTop) {
    styles.shim = {
      border: blueBorder,
      padding: '10px',
      marginLeft: '10px'
    };
  }
  if(hoverBottom) {
    styles.bottom.border = blueBorder;
  }
  return styles;
};

/**
 * Renders the alignment of primary and secondary words/phrases
 */
class AlignmentCard extends Component {
  render() {
    const { bottomWords, topWords, hoverBottom } = this.props;
    const styles = makeStyles(this.props);
    const emptyTop = !topWords || topWords.length === 0;

    return (
      <div style={styles.root}>
        <div style={styles.wrapper}>
          <div style={styles.top}>
            <div style={{ display: 'flex' }}>
              {!emptyTop && topWords}
              <span style={styles.shim}/>
            </div>
          </div>
          <div style={styles.bottom}>
            <div style={{ display: 'flex' }}>
              {!hoverBottom && bottomWords}
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
  hoverTop: PropTypes.bool
};

export default AlignmentCard;
