/* Eden website configuration.
 *
 * backend — where the menu comes from and whether the menu editor can save:
 *   'static'   (default) The menu is read from js/menu-data.js (built from data/menu.json).
 *              Works anywhere, including GitHub Pages, with no setup. The menu editor is off.
 *   'local'    The menu editor works, but changes are saved only in this browser.
 *              Use it to try the editor, or to prepare a new data/menu.json
 *              ("Download menu.json" button in the editor) that you then commit.
 *   'firebase' Live editing: changes made in the editor appear on the website and the
 *              iPad menu within seconds, on every device. Needs a free Firebase project.
 *              See "Menu editor setup" in README.md.
 *
 * The Firebase values below are a public web-app identifier, not a password.
 * Access is controlled by firebase/firestore.rules. Never put secret keys in this file.
 */
window.EDEN_CONFIG = {
  backend: 'static',

  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    appId: ''
  },

  // Email addresses allowed to edit the menu (Firebase mode). Keep this list in sync
  // with firebase/firestore.rules, which is what actually enforces it.
  editors: []
};
