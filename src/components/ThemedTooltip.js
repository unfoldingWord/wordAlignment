import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';

const styles = theme => ({
  arrow: {
    'fontSize': 16,
    'width': 17,
    '&::before': {
      border: '1px solid #000',
      backgroundColor: theme.palette.common.black,
      boxSizing: 'border-box',
    },
  },
  bootstrapTooltip: {
    backgroundColor: theme.palette.common.black,
    fontSize: "inherit",
    lineHeight: "inherit",
    maxWidth: 375,
    wordBreak: "break-all"
  },
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
    const { message , children, classes, disabled, targetLanguageFontClassName, fontScale} = this.props;

    return (
      <Tooltip
        arrow={true}
        disableFocusListener={disabled}
        disableHoverListener={disabled}
        disableTouchListener={disabled}
        enterDelay={400}
        leaveDelay={200}
        title={
          <span style={{fontSize: `${fontScale}%`}}>
            <span className={targetLanguageFontClassName}>
              {message}
            </span>
          </span>
        }
        classes={{
          tooltip: classes.bootstrapTooltip,
          arrow: classes.arrow,
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
  targetLanguageFontClassName: PropTypes.any,
  disabled: PropTypes.bool,
  fontScale: PropTypes.number
};
ThemedTooltip.defaultProps = {
  disabled: false,
  fontScale: 100
};

export default withStyles(styles)(ThemedTooltip);
