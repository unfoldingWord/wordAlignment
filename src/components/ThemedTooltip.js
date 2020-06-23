import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';

function arrowGenerator(color) {
  return {
    '&[x-placement*="bottom"] $arrow': {
      top: 0,
      left: 0,
      marginTop: '-0.95em',
      width: '3em',
      height: '1em',
      '&::before': {
        borderWidth: '0 1em 1em 1em',
        borderColor: `transparent transparent ${color} transparent`,
      },
    },
    '&[x-placement*="top"] $arrow': {
      bottom: 0,
      left: 0,
      marginBottom: '-0.95em',
      width: '3em',
      height: '1em',
      '&::before': {
        borderWidth: '1em 1em 0 1em',
        borderColor: `${color} transparent transparent transparent`,
      },
    },
    '&[x-placement*="right"] $arrow': {
      left: 0,
      marginLeft: '-0.95em',
      height: '3em',
      width: '1em',
      '&::before': {
        borderWidth: '1em 1em 1em 0',
        borderColor: `transparent ${color} transparent transparent`,
      },
    },
    '&[x-placement*="left"] $arrow': {
      right: 0,
      marginRight: '-0.95em',
      height: '3em',
      width: '1em',
      '&::before': {
        borderWidth: '1em 0 1em 1em',
        borderColor: `transparent transparent transparent ${color}`,
      },
    },
  };
}

const styles = theme => ({
  arrow: {
    position: 'absolute',
    fontSize: 6,
    width: '3em',
    height: '3em',
    '&::before': {
      content: '""',
      margin: 'auto',
      display: 'block',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    },
  },
  bootstrapPopper: arrowGenerator(theme.palette.common.black),
  bootstrapTooltip: {
    backgroundColor: theme.palette.common.black,
    fontSize: 14,
    maxWidth: 375,
    wordBreak: "break-all"
  },
  bootstrapPlacementLeft: {
    margin: '0 8px',
  },
  bootstrapPlacementRight: {
    margin: '0 8px',
  },
  bootstrapPlacementTop: {
    margin: '8px 0',
  },
  bootstrapPlacementBottom: {
    margin: '8px 0',
  }
});

/**
 * Renders a tooltip.
 *
 * @param {string} message - the tooltip message
 * @param children the content receiving the tooltip
 * @param classes
 * @param disabled
 * @return {*}
 * @constructor
 */
class ThemedTooltip extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      arrowRef: null
    };
  }

  handleArrowRef = (node) => {
    this.setState({
      arrowRef: node
    });
  };

  render() {
    const { message , children, classes, disabled} = this.props;
    const { arrowRef } = this.state;

    return (
      <Tooltip
        disableFocusListener={disabled}
        disableHoverListener={disabled}
        disableTouchListener={disabled}
        enterDelay={400}
        leaveDelay={200}
        title={
          <React.Fragment>
            {message}
            <span className={classes.arrow} ref={this.handleArrowRef} />
          </React.Fragment>
        }
        classes={{
          tooltip: classes.bootstrapTooltip,
          popper: classes.bootstrapPopper,
          tooltipPlacementLeft: classes.bootstrapPlacementLeft,
          tooltipPlacementRight: classes.bootstrapPlacementRight,
          tooltipPlacementTop: classes.bootstrapPlacementTop,
          tooltipPlacementBottom: classes.bootstrapPlacementBottom,
        }}
        PopperProps={{
          popperOptions: {
            modifiers: {
              arrow: {
                enabled: Boolean(arrowRef),
                element: arrowRef,
              },
            },
          },
        }}
      >
        {children}
      </Tooltip>
    );
  }

}

ThemedTooltip.propTypes = {
  message: PropTypes.string.isRequired,
  children: PropTypes.any.isRequired,
  classes: PropTypes.any.isRequired,
  disabled: PropTypes.bool
};
ThemedTooltip.defaultProps = {
  disabled: false
};

export default withStyles(styles)(ThemedTooltip);