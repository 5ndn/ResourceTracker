import React from 'react';
import ReactDOM from 'react-dom';
import TrackerPanel from '../components/trackerPanel';

var stores = require('../modules/stores');

export default class Tracker {
  constructor() {
    ReactDOM.render(<TrackerPanel />, document.querySelector('.fd-trackerApp'));

    stores.reloadTracker();
  }
}