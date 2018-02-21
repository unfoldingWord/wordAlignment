import { combineReducers } from 'redux';
import * as fromReactLocalizeRedux from 'react-localize-redux';
import localeSettings, * as fromLocaleSettings from './localeSettings';

const reducers = combineReducers({
  locale: fromReactLocalizeRedux.localeReducer,
  localeSettings
});

export default reducers;

/**
 * Returns the localization function
 * @param {*} state - the root redux state object
 * @return {Translate}
 */
export const getTranslate = (state) =>
  fromReactLocalizeRedux.getTranslate(state.locale);

/**
 * Checks if the locale has been loaded
 * @param state
 * @return {bool}
 */
export const getLocaleLoaded = (state) =>
  fromLocaleSettings.getLocaleLoaded(state.localeSettings);
