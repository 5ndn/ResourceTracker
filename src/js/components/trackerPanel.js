import React from 'react';
import WeeksRow from './weeksRow';
import ProjectsRow from './projectsRow';
import PeopleTable from './peopleTable';
import Screensaver from './screensaver';

var SettingsStore = require('../modules/stores').SettingsStore;
var TrackerActions = require('../modules/actions').TrackerActions;

class TrackerPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = SettingsStore.getState();
  }

  componentWillUnmount() {
    SettingsStore.off('change', ::this._settingsChanged);
    clearInterval(this.timerID);
  }
  componentDidMount() {
    SettingsStore.on('change', ::this._settingsChanged);
    this.timerID = setInterval(
      () => this.tick(),
      10000
    );
  }
  tick() {
      TrackerActions.reload();
      TrackerActions.reload_settings();
      this.setState({
        date: new Date(),
        showDayOfWeekLabels: SettingsStore.getState().settings[6][0].toLowerCase(),
        highlightDayOfWeek: SettingsStore.getState().settings[7][0].toLowerCase(),
        logo: SettingsStore.getState().settings[0][0],
        name: SettingsStore.getState().settings[1][0]
      });
  }
  _settingsChanged() {
    this.setState({
      date: new Date(),
      showDayOfWeekLabels: SettingsStore.getState().settings[6][0].toLowerCase(),
      highlightDayOfWeek: SettingsStore.getState().settings[7][0].toLowerCase(),
      logo: SettingsStore.getState().settings[0][0],
      name: SettingsStore.getState().settings[1][0],
    });
  }

  render() {
    let { date, showDayOfWeekLabels, highlightDayOfWeek, logo, name } = this.state;

      return(
          <div key="root" data-showDayOfWeekLabels={showDayOfWeekLabels} data-highlightDayOfWeek={highlightDayOfWeek}>
              <header className="fd-header">
                  <img key="logo" src={logo} />
                  <h1>Resource Tracker</h1>
                  <ProjectsRow></ProjectsRow>
                  <span className="fd-header--updated">Last Updated: <span>{this.state.date.toLocaleTimeString()}</span></span>
              </header>
              <PeopleTable />
              <Screensaver />
          </div>
      );
  }
}

export default TrackerPanel;
