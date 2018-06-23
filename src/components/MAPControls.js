import React from 'react';
import PropTypes from 'prop-types';
import InfoIcon from 'material-ui/svg-icons/action/info';
import CheckIcon from 'material-ui/svg-icons/action/check-circle';
import CancelIcon from 'material-ui/svg-icons/navigation/cancel';
import RefreshIcon from 'material-ui/svg-icons/navigation/refresh';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

/**
 * Renders a secondary styled button
 * @param {*} [children] - the button content
 * @param {bool} [disabled=false] - controls whether the button is disabled
 * @param {func} [onClick] - optional click handler
 * @return {*}
 * @constructor
 */
const SecondaryButton = ({children, disabled, onClick}) => (
  <button className="btn-second"
          disabled={disabled}
          onClick={onClick}>
    {children}
  </button>
);
SecondaryButton.propTypes = {
  children: PropTypes.any,
  disabled: PropTypes.bool,
  onClick: PropTypes.func
};
SecondaryButton.defaultProps = {
  disabled: false
};

const styles = {
  root: {
    width: '100%',
    padding: '0 10px',
    boxShadow: 'rgba(0, 0, 0, 0.21) 0px -5px 5px 0px',
    textAlign: 'center'
  },
  button: {
    marginLeft: 10
  },
  icon: {
    color: 'var(--accent-color-dark)',
    verticalAlign: 'middle',
    marginRight: '5px',
    width: 30,
    height: 30
  },
  buttonIcon: {
    color: 'var(--accent-color-dark)',
    verticalAlign: 'middle',
    marginRight: '5px',

    width: 20,
    height: 20
  }
};

/**
 * Renders controls for managing Word MAP predictions
 * @param {func} onRefresh
 * @param {func} onAccept
 * @param {func} nReject
 */
class MAPControls extends React.Component {
  render() {
    const {onRefresh, onAccept, onReject, translate} = this.props;
    return (
      <MuiThemeProvider>
        <div style={styles.root}>
          <InfoIcon style={styles.icon}/>
          <SecondaryButton style={styles.button} onClick={onRefresh}>
            <RefreshIcon style={styles.buttonIcon}/>
            {translate('suggestions.refresh')}
          </SecondaryButton>
          <SecondaryButton style={styles.button} onClick={onAccept}>
            <CheckIcon style={styles.buttonIcon}/>
            {translate('suggestions.accept')}
          </SecondaryButton>
          <SecondaryButton style={styles.button} onClick={onReject}>
            <CancelIcon style={styles.buttonIcon}/>
            {translate('suggestions.reject')}
          </SecondaryButton>
        </div>
      </MuiThemeProvider>
    );
  }
}

MAPControls.propTypes = {
  onRefresh: PropTypes.func.isRequired,
  onAccept: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired
};
export default MAPControls;
