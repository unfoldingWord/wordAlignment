import React from 'react';
import PropTypes from 'prop-types';
import InfoIcon from 'material-ui/svg-icons/action/info';
import CheckIcon from 'material-ui/svg-icons/action/check-circle';
import CancelIcon from 'material-ui/svg-icons/navigation/cancel';
import RefreshIcon from 'material-ui/svg-icons/navigation/refresh';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Toggle from 'material-ui/Toggle';
import ReactTooltip from 'react-tooltip';

const Tooltip = ({
  children, tooltip, location, type, effect, delayHide, delayShow,
}) => (
  <React.Fragment>
    <span data-tip={tooltip}
      data-place={location}
      data-effect={effect}
      data-type={type}
      data-class="selection-tooltip"
      data-delay-show={delayShow}
      data-delay-hide={delayHide}>
      {children}
    </span>
    <ReactTooltip/>
  </React.Fragment>
);

Tooltip.propTypes = {
  children: PropTypes.any.isRequired,
  tooltip: PropTypes.string,
  location: PropTypes.string,
  type: PropTypes.string,
  effect: PropTypes.string,
  delayHide: PropTypes.number,
  delayShow: PropTypes.number,
};
Tooltip.defaultProps = {
  location: 'bottom',
  type: 'dark',
  effect: 'solid',
  delayHide: 100,
  delayShow: 1000,
};

/**
 * Renders a secondary styled button
 * @param {*} [children] - the button content
 * @param {bool} [disabled=false] - controls whether the button is disabled
 * @param {func} [onClick] - optional click handler
 * @return {*}
 * @constructor
 */
const SecondaryButton = ({
  children, disabled, onClick,
}) => (
  <button className="btn-second"
    disabled={disabled}
    onClick={onClick}>
    {children}
  </button>
);

SecondaryButton.propTypes = {
  children: PropTypes.any,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};
SecondaryButton.defaultProps = { disabled: false };

const styles = {
  root: {
    width: '100%',
    padding: '0 10px',
    textAlign: 'center',
    borderStyle: 'solid none none none',
    borderWidth: '2px',
    borderColor: 'var(--background-color-light)',
  },
  button: { marginLeft: 10 },
  icon: {
    color: 'var(--accent-color-dark)',
    verticalAlign: 'middle',
    marginRight: '5px',
    width: 30,
    height: 30,
    cursor: 'pointer',
  },
  toggle: {
    display: 'inline-block',
    width: 'auto',
    margin: '10px',
    verticalAlign: 'middle',
    fontSize: '14px',
  },
  toggleIcon: { marginTop: '0px' },
  toggleLabel: {
    color: 'var(--accent-color-dark)',
    textAlign: 'left',
    fontWeight: 'normal',
    fontSize: '14px',
    width: '100%',
    lineHeight: 'inherit',
  },
  buttonIcon: {
    color: 'var(--accent-color-dark)',
    verticalAlign: 'middle',
    marginRight: '5px',
    width: 20,
    height: 20,
  },
  thumb: { boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 3px 0px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 2px 1px -1px' },
  thumbSwitched: {
    boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 3px 0px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 2px 1px -1px',
    backgroundColor: 'var(--accent-color-dark)',
  },
  track: {
    backgroundColor: '#000',
    opacity: '0.38',
  },
  trackSwitched: {
    backgroundColor: 'var(--accent-color-dark)',
    opacity: '0.38',
  },
};

/**
 *
 * @param {function} translate
 * @param {boolean} isMacOS
 * @returns {JSX.Element}
 */
const getShortcutTable = (translate, isMacOS) => {
  const tableElement = {
    border: '1px solid black',
    padding: '8px',
    textAlign: 'left',
  };

  const styles = {
    table: {
      borderCollapse: 'collapse',
      margin: '16px',
      marginLeft: '10%',
    },
    tableElement,
    tableData: {
      padding: '6px',
      border: '1px solid black',
    },
    tableRowEven: {
      ...tableElement,
      backgroundColor: '#ffffff', /* Shade for odd rows */
    },
    tableRowOdd: {
      ...tableElement,
      backgroundColor: '#f2f2f2', /* Shade for even rows */
    },
  };

  const functionKey = isMacOS ? 'Command' : 'Ctrl';
  const shortcuts = [
    { action: 'suggestions.refresh_suggestions', shortcut: functionKey + '+F' },
    { action: 'suggestions.accept_suggestions', shortcut: functionKey + '+A' },
    { action: 'suggestions.reject_suggestions', shortcut: functionKey + '+J' },
    { action: 'suggestions.clear_suggestions', shortcut: functionKey + '+K' },
    { action: 'toggle_alignment_complete', shortcut: functionKey + '+T' },
    { action: 'suggestions.next', shortcut: functionKey + '+N' },
  ];

  function getTranslated(item) {
    let text = (translate(item.action) || '').trim();
    const lastChar = text[text.length - 1];
    if (lastChar === '.') {
      text = text.substring(0, text.length - 1);
    }
    return text;
  }

  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={ styles.tableData }>Action</th>
          <th style={ styles.tableData }>Shortcut</th>
        </tr>
      </thead>
      <tbody>
        {shortcuts.map((item, index) => (
          <tr key={index} style={index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
            <td style={ styles.tableData }>{getTranslated(item)}</td>
            <td style={ styles.tableData }>{item.shortcut}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const InfoPopup = ({ translate, isMacOS }) => (
  <>
    <div style={{ width: '400px', padding: '0 10px' }}>
      {translate('map_instructions', {
        word_map: translate('_.word_map'),
        icon: '(x)',
      })}
    </div>
    {getShortcutTable(translate, isMacOS)}
  </>
);

InfoPopup.propTypes = { translate: PropTypes.func.isRequired, isMacOS: PropTypes.bool.isRequired };

/**
 * Renders controls for managing Word MAP predictions
 * @param {func} onRefresh
 * @param {func} onAccept
 * @param {func} nReject
 */
class MAPControls extends React.Component {
  constructor(props) {
    super(props);
    this._handleOnInfoClick = this._handleOnInfoClick.bind(this);
    this.state = { infoHovered: false };
  }

  /**
   * Handles opening the info popup
   * @private
   */
  _handleOnInfoClick(e, isMacOS) {
    const { showPopover, translate } = this.props;

    showPopover(
      <strong>{translate('instructions')}</strong>,
      <InfoPopup translate={translate} isMacOS={isMacOS}/>,
      e.target,
    );
  }

  render() {
    const {
      onRefresh,
      onAccept,
      onReject,
      onClear,
      translate,
      complete,
      onToggleComplete,
      hasSuggestions,
      isMacOS,
    } = this.props;

    return (
      <MuiThemeProvider>
        <div style={styles.root}>
          <InfoIcon style={styles.icon}
            onClick={(e) => this._handleOnInfoClick(e, isMacOS)}/>
          <Tooltip tooltip={translate('suggestions.refresh_suggestions')}>
            <SecondaryButton style={styles.button}
              onClick={onRefresh}>
              <RefreshIcon style={styles.buttonIcon}/>
              {translate('suggestions.refresh')}
            </SecondaryButton>
          </Tooltip>

          <Tooltip tooltip={translate('suggestions.accept_suggestions')}>
            <SecondaryButton style={styles.button}
              onClick={onAccept}
              disabled={!hasSuggestions}>
              <CheckIcon style={styles.buttonIcon}/>
              {translate('suggestions.accept')}
            </SecondaryButton>
          </Tooltip>

          <Tooltip tooltip={translate('suggestions.reject_suggestions')}>
            <SecondaryButton style={styles.button}
              onClick={onReject}
              disabled={!hasSuggestions}>
              <CancelIcon style={styles.buttonIcon}/>
              {translate('suggestions.reject')}
            </SecondaryButton>
          </Tooltip>

          <Tooltip tooltip={translate('suggestions.clear_suggestions')}>
            <SecondaryButton style={styles.button} onClick={onClear}>
              <CancelIcon style={styles.buttonIcon}/>
              {translate('suggestions.clear')}
            </SecondaryButton>
          </Tooltip>

          <Toggle
            labelPosition={'right'}
            label={translate('alignment_complete')}
            onToggle={onToggleComplete}
            toggled={complete}
            style={styles.toggle}
            trackStyle={styles.track}
            thumbStyle={styles.thumb}
            iconStyle={styles.toggleIcon}
            labelStyle={styles.toggleLabel}
            thumbSwitchedStyle={styles.thumbSwitched}
            trackSwitchedStyle={styles.trackSwitched}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

MAPControls.propTypes = {
  hasSuggestions: PropTypes.bool,
  showPopover: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onAccept: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
  complete: PropTypes.bool.isRequired,
  onToggleComplete: PropTypes.func.isRequired,
  isMacOS: PropTypes.bool.isRequired,
};
MAPControls.defaultProps = { hasSuggestions: true };
export default MAPControls;
