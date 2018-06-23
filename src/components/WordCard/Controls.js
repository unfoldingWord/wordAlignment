import React from 'react';
import PropTypes from 'prop-types';
import CancelIcon from 'material-ui/svg-icons/navigation/cancel';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

const makeStyles = state => {
  const {hover} = state;
  return {
    icon: {
      transition: '0.1s',
      opacity: hover ? 1: 0.5,
      marginLeft: 5,
      width: 20,
      height: 20,
      verticalAlign: 'middle',
      color: '#646464'
    }
  };
};

/**
 * Renders controls for a word
 * @param {bool} isSuggestion
 * @param {func} onClick
 * @return {*}
 * @constructor
 */
class Controls extends React.Component {
  constructor(props) {
    super(props);
    this._handleOver = this._handleOver.bind(this);
    this._handleOut = this._handleOut.bind(this);
    this.state = {
      hover: false
    };
  }

  _handleOver() {
    this.setState({
      hover: true
    });
  }

  _handleOut() {
    this.setState({
      hover: false
    });
  }

  render() {
    const {onCancel} = this.props;
    const styles = makeStyles(this.state);
    return (
      <MuiThemeProvider>
        <CancelIcon onClick={onCancel}
                    onMouseOver={this._handleOver}
                    onMouseOut={this._handleOut}
                    style={styles.icon}/>
      </MuiThemeProvider>
    );
  }
}

Controls.propTypes = {
  onCancel: PropTypes.func
};

export default Controls;
