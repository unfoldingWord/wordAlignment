import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {createProvider} from 'react-redux';
import {configureStore, createConnect} from './state/store';
import {loadLocalization} from './state/actions/locale';
import {setActiveLanguage} from 'react-localize-redux';

/**
 * This container sets up the tool environment.
 *
 * @property {string} contextKey - the redux store key for storing in the react context. This should be unique to the tool.
 * @property {*} children - the component children
 * @property {string} appLanguage - the app interface language code
 * @property {string} [localeDir] - directory containing the interface locale files
 */
class Tool extends Component {

  constructor(props) {
    super(props);
    this.state = {
      store: null
    };
  }

  componentWillMount() {
    const {appLanguage, localeDir} = this.props;
    const store = configureStore();
    this.setState({
      store
    });

    // load the locale if available
    if(localeDir) {
      store.dispatch(loadLocalization(localeDir, appLanguage));
    }
  }

  componentWillReceiveProps(nextProps) {
    // stay in sync with the application language
    if(nextProps.appLanguage !== this.props.appLanguage) {
      const {store} = this.state;
      store.dispatch(setActiveLanguage(nextProps.appLanguage));
    }
  }

  render() {
    const {children, storeKey} = this.props;
    const {store} = this.state;
    const Provider = createProvider(storeKey);

    return (
      <Provider store={store}>
        {children}
      </Provider>
    );
  }
}

Tool.propTypes = {
  storeKey: PropTypes.string.isRequired,
  children: PropTypes.any.isRequired,
  appLanguage: PropTypes.string.isRequired,
  localeDir: PropTypes.string
};

export default Tool;

/**
 * Create a custom react-redux connection HOC that binds to a particular store key
 * @param {string} key - the store key
 * @return {function}
 */
exports.createConnect = createConnect;
