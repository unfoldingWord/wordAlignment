import * as types from '../actions/types';

const defaultState = {
  loaded: false
};

const localeSettings = (state = defaultState, action) => {
  switch(action.type) {
    case types.LOCALE_LOADED:
      return {
        ...state,
        loaded: true
      };
    default:
      return state;
  }
};

export default localeSettings;

/**
 * Checks if the locale is loaded
 * @param {*} state
 * @return {bool}
 */
export const getLocaleLoaded = (state) =>
  state.loaded === true;
