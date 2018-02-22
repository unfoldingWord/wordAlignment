import React from 'react';
import PropTypes from 'prop-types';
import {createProvider} from 'react-redux';
import {configureStore} from './state/store';
import {loadLocalization} from './state/actions/locale';
import {setActiveLanguage} from 'react-localize-redux';
import BrokenScreen from './BrokenScreen';
import {getTranslate, getLocaleLoaded} from './state/reducers';

/**
 * This HOC initializes a store and locale for the tool.
 * It also specifies some required properties common to all tools.
 *
 * @param {string} toolId - the tool's unique id. Used for storing the redux store in the react context.
 * @param {string} localeDir - directory containing the interface locale files
 * @return {function(*)}
 */
export const connectTool = (toolId, localeDir) => {
  return (WrappedComponent) => {

    /**
     * This container sets up the tool environment.
     *
     * @property {string} appLanguage - the app interface language code
     */
    class ConnectedTool extends React.Component {
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
        const {appLanguage} = this.props;
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
        if(!this._isLocaleLoaded()) {
          // TODO: we could display a loading screen while the locale loads
          return null;
        }

        const brokenScreen = this._getBrokenScreen();
        if(brokenScreen) {
          return brokenScreen;
        } else {
          return this._connectProvider(
            <WrappedComponent
              translate={getTranslate(this.store.getState())}
              {...this.props}
            />
          );
        }
      }
    }

    /**
     * This effectively defines the interface between tools and tC core.
     */
    ConnectedTool.propTypes = {
      currentToolViews: PropTypes.object.isRequired,
      resourcesReducer: PropTypes.object.isRequired,
      contextIdReducer: PropTypes.object.isRequired,
      appLanguage: PropTypes.string.isRequired
    };
    return ConnectedTool;
  };
};
