// methods for accessing environment variables
// this is needed because many process.env values are no longer defined on the client side (looks to be
// security related).  To get the environment variable on client side can now use remote.process.env.
let { remote } = require('electron');

if (!remote) { // fallback for testing
  remote = {
    app: {
      getPath: (path) => {
        switch (path) {
          case 'home':
            return '/Users/test';
          case 'appData':
            return '/Users/test/appData';
          default:
            return 'unknown';
        }
      }
    }
  };
}

const appObject = remote.app;

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
