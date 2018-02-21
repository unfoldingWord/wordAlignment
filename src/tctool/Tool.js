import React from 'react';
import PropTypes from 'prop-types';
import {createProvider} from 'react-redux';
import {configureStore} from './state/store';
import {loadLocalization} from './state/actions/locale';
import {setActiveLanguage} from 'react-localize-redux';
import BrokenScreen from './BrokenScreen';
import {getTranslate, getLocaleLoaded} from './state/reducers/index';

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
      broken: false,
      error: null,
      info: null
    };
  }

  componentWillMount() {
    const {appLanguage, localeDir, storeKey} = this.props;
    this.store = configureStore();
    this.store.dispatch(loadLocalization(localeDir, appLanguage));
    this.Provider = createProvider(storeKey);
    this.unsubscribe = this.store.subscribe(this.handleChange.bind(this));
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  handleChange() {
    this.forceUpdate();
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
      this.store.dispatch(setActiveLanguage(nextProps.appLanguage));
    }
  }

  render() {
    const {children} = this.props;
    const {broken, error, info} = this.state;
    const Provider = this.Provider;

    const isLocaleLoaded = getLocaleLoaded(this.store.getState());
    if(!isLocaleLoaded) {
      // TODO: we could display a loading screen while the locale loads
      return null;
    }

    if(broken) {
      // TODO: log the error to the core app state so it will be included in feedback logs.
      // it would be best to pass a callback into this component for this purpose.
      const translate = getTranslate(this.store.getState());
      return <BrokenScreen title={translate('tool_broken')} error={error} info={info}/>;
    } else {
      return (
        <Provider store={this.store}>
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
  localeDir: PropTypes.string.isRequired
};

export default Tool;
