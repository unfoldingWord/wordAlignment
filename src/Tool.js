import React from 'react';
import PropTypes from 'prop-types';
import {createProvider} from 'react-redux';
import {configureStore, createConnect} from './state/store';
import {loadLocalization} from './state/actions/locale';
import {setActiveLanguage} from 'react-localize-redux';
import BrokenScreen from './BrokenScreen';

/**
 * This container sets up the tool environment.
 *
 * @property {string} contextKey - the redux store key for storing in the react context. This should be unique to the tool.
 * @property {*} children - the component children
 * @property {string} appLanguage - the app interface language code
 * @property {string} [localeDir] - directory containing the interface locale files
 */
class Tool extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      store: null,
      broken: false,
      error: null,
      info: null
    };
  }

  componentWillMount() {
    const {appLanguage, localeDir, storeKey} = this.props;
    const store = configureStore();
    this.setState({
      store
    });

    // load the locale if available
    if(localeDir) {
      store.dispatch(loadLocalization(localeDir, appLanguage));
    }

    this.Provider = createProvider(storeKey);
  }

  componentDidCatch(error, info) {
    this.setState({
      broken: true,
      error,
      info
    });
  }

  componentWillReceiveProps(nextProps) {
    // stay in sync with the application language
    if(nextProps.appLanguage !== this.props.appLanguage) {
      const {store} = this.state;
      store.dispatch(setActiveLanguage(nextProps.appLanguage));
    }
  }

  render() {
    const {children} = this.props;
    const {store, broken, error, info} = this.state;

    const Provider = this.Provider;

    if(broken) {
      return <BrokenScreen translate={k=>k} error={error} info={info}/>;
    } else {
      return (
        <Provider store={store}>
          {children}
        </Provider>
      );
    }

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
