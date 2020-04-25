import React from 'react';
import WeeksRow from './weeksRow';
import ProjectsRow from './projectsRow';
import PeopleTable from './peopleTable';
import Screensaver from './screensaver';

var SettingsStore = require('../modules/stores').SettingsStore;
var TrackerActions = require('../modules/actions').TrackerActions;

var show_open_backup = false

class TrackerPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = SettingsStore.getState();
  }

  componentWillUnmount() {
    SettingsStore.off('change', :: this._settingsChanged);
    clearInterval(this.timerID);
  }
  componentDidMount() {
    SettingsStore.on('change', :: this._settingsChanged);
    this.timerID = setInterval(
      () => this.tick(),
      300000  // 60000 micro-sec = 1 min
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
      show_open_first: show_open_backup
    });
  }

  toggleOpenList = () => {
    const { show_open_first } = this.state;
    if (show_open_first === true) {
      this.setState({
        show_open_first: false
      })
      show_open_backup = false
    } else {
      this.setState({
        show_open_first: true
      })
      show_open_backup = true
    }
  }

  render() {
    let { date, showDayOfWeekLabels, highlightDayOfWeek, logo, name, show_open_first } = this.state;

    return (
      <div key="root" data-showDayOfWeekLabels={showDayOfWeekLabels} data-highlightDayOfWeek={highlightDayOfWeek}>
        <header className="fd-header" style={{ paddingLeft: "15px" }}>
          <div style={{ marginTop: "-5px", marginBottom: "-10px" }}>
            <div><img key="logo" src={logo} /></div>
            <h1>Resource Tracker</h1>
          </div>
          <ProjectsRow></ProjectsRow>
          <div className="fd-header--updated">
            <div>Last Updated:</div>
            <div>{this.state.date.toLocaleTimeString()}</div>
            <div style={{ marginTop: "10px" }}>
              Open First
              <span onClick={this.toggleOpenList}>
                {show_open_first ? <input type="checkbox" checked className="regular-checkbox" /> : <input type="checkbox" className="regular-checkbox" />}
              </span>
            </div>
          </div>
        </header>
        <PeopleTable show_open={show_open_first} />
        <Screensaver />
      </div>
    );
  }
}

export default TrackerPanel;
