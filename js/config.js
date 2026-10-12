/* Eden website configuration.
 *
 * backend — where the menu comes from:
 *   'supabase' Live: the menu and Supper Club page are read from Eden's Supabase database,
 *              and changes made on the staff site appear here and on the iPad menu within
 *              about a second. If the database can't be reached, the built-in menu
 *              (js/menu-data.js) is shown instead. This site never signs in or writes.
 *   'static'   The menu is read from js/menu-data.js (built from data/menu.json). No setup.
 *   'local'    Menu editor on this site, saving only in this browser (for trying things out).
 *   'firebase' Older live-editing option, kept for reference. See README.md.
 *
 * The Supabase "publishable" key below is meant to be public: it is built into every page
 * that talks to the database, and the database's own rules decide what it may do
 * (here: read the website content, nothing else). Never put a secret key in this file.
 */
window.EDEN_CONFIG = {
  backend: 'supabase',

  supabase: {
    url: 'https://qmblccwyxbpvziiwrlne.supabase.co',
    key: 'sb_publishable_Nbp1K_Co8tDVB-jNjBRs3w_D40qm4Mg'
  },

  // Where staff edit the menu. "#editor" on this site sends people there.
  staffSite: 'https://edencny-staff.com/',

  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    appId: ''
  },
  editors: []
};
