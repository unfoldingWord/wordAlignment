// methods for accessing environment variables
// this is needed because many process.env values are no longer defined on the client side (looks to be
// security related).  To get the environment variable on client side can now use remote.process.env.
const { app, remote } = require('electron');

// use app if we are main, otherwise we are render side so we use remote app
const appObject = !remote ? app : remote.app;

/**
 * get path to Home folder
 * @return {string}
 */
function home() {
  return appObject.getPath('home');
}

/**
 * get path to Home folder
 * @return {string}
 */
function data() {
  return appObject.getPath('appData');
}

var env = {
  data,
  home,
};

module.exports = env;
