import React from 'react';
import PropTypes from 'prop-types';
import {createProvider} from 'react-redux';
import {configureStore} from './state/store';
import {loadLocalization} from './state/actions/locale';
import {setActiveLanguage} from 'react-localize-redux';
import BrokenScreen from './BrokenScreen';
import {getTranslate, getLocaleLoaded} from './state/reducers/index';

export const connectTool = (toolId, localeDir) => {
  return (WrappedComponent) => {
    class ConnectedTool extends React.Component {
      render () {
        const {appLanguage} = this.props;
        return (
          <Tool localeDir={localeDir} toolId={toolId} appLanguage={appLanguage}>
            <WrappedComponent
              {...this.props}
            />
          </Tool>
        );
      }
    }
    ConnectedTool.propTypes = {
      appLanguage: PropTypes.string.isRequired
    };
    return ConnectedTool;
  };
};

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
    this._isLocaleLoaded = this._isLocaleLoaded.bind(this);
    this.state = {
      broken: false,
      error: null,
      info: null
    };
  }

  componentWillMount() {
    const {appLanguage, localeDir, toolId} = this.props;
    this.store = configureStore();
    this.store.dispatch(loadLocalization(localeDir, appLanguage));
    this.Provider = createProvider(toolId);
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

  /**
   * Checks if the locale has finished loading
   * @return {bool}
   * @private
   */
  _isLocaleLoaded() {
    return getLocaleLoaded(this.store.getState());
  }

  /**
   * Returns the broken screen if one should be displayed
   * @return {*}
   * @private
   */
  _getBrokenScreen() {
    const {broken, error, info} = this.state;
    const translate = getTranslate(this.store.getState());
    if(broken) {
      // TODO: log the error to the core app state so it will be included in feedback logs.
      // it would be best to pass a callback into this component for this purpose.
      return <BrokenScreen title={translate('tool_broken')}
                           error={error}
                           info={info}/>;
    } else {
      return null;
    }
  }

  /**
   * Wraps the component with the provider
   * @param {*} component - the child of this component
   * @return {*}
   * @private
   */
  _connectProvider(component) {
    const Provider = this.Provider;
    return (
      <Provider store={this.store}>
        {component}
      </Provider>
    );
  }

  render() {
    const {children} = this.props;

    if(!this._isLocaleLoaded()) {
      // TODO: we could display a loading screen while the locale loads
      return null;
    }

    const brokenScreen = this._getBrokenScreen();
    if(brokenScreen) {
      return brokenScreen;
    } else {
      return this._connectProvider(children);
    }
  }
}

Tool.propTypes = {
  toolId: PropTypes.string.isRequired,
  children: PropTypes.any.isRequired,
  appLanguage: PropTypes.string.isRequired,
  localeDir: PropTypes.string.isRequired
};

export default Tool;
