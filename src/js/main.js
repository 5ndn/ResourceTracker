import config from './config';
import Tracker from './containers/tracker';

const APP = {
  init() {
    //Added timeout for better loading, sometimes on first load color was not reflected so delaying might help
    setTimeout(() => {
      this.loadGoogleAPIs(); 
    }, 2000);
    
  },

  bootstrap() {
    this.cache();
    this.listeners();
    this.checkAuth(true);
  },

  cache() {
    this.body = document.body;
    this.authBtn = document.querySelector('#authorize-button');
    this.authModal = document.querySelector('#authorize-div');
  },
  listeners() {
    this.authBtn.addEventListener('click', ::this.handleAuthClick );
  },

  // Auth Methods
  checkAuth(immediate = false) {
    const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

    gapi.auth.authorize({
      'client_id': config.CLIENT_ID,
      'scope': SCOPES.join(' '),
      'immediate': immediate,
    }, ::this.handleAuthResult );
  },
  handleAuthClick(e) {
    this.checkAuth();
    e.preventDefault();
  },
  handleAuthResult(result) {
    if (result && !result.error) {
      this.body.classList.add('is-loggedin');
      new Tracker();
    } else {
      this.authModal.style.display = 'inline';
    }
  },

  // Script Loading
  loadGoogleAPIs() {
    const script = document.createElement('script');

    script.type = 'text/javascript';
    script.src = 'https://apis.google.com/js/client.js?onload=checkAuth';
    script.onerror = function() {
      console.error('Unable to load Google APIs required for tracker...');
    }

    document.getElementsByTagName("body")[0].appendChild(script);
  }
}

APP.init();
window.checkAuth = ::APP.bootstrap; // work on better loading method