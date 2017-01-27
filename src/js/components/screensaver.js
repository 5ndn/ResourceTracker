import React from 'react';

var SettingsStore = require('../modules/stores').SettingsStore;

class ScreenSaver extends React.Component {
  constructor(props) {
    super(props);
    this.MILLISECONDS_IN_SECOND = 60000;
    this.state = SettingsStore.getState();
  }

  componentDidMount() {
    SettingsStore.on('change', ::this._settingsChanged);
  }
  componentWillUnmount() {
    SettingsStore.off('change', ::this._settingsChanged);
    clearInterval(this.SceensaverToggleTimerID);
  }
  tick() {

    this.setState({
      active: SettingsStore.getState().settings[2][0].toLowerCase(),
      url: SettingsStore.getState().settings[3][0],
      frequency: SettingsStore.getState().settings[4][0] * this.MILLISECONDS_IN_SECOND,
      duration: SettingsStore.getState().settings[5][0] * this.MILLISECONDS_IN_SECOND,
      visible: !this.state.visible
    });
  }
  _settingsChanged() {

    this.setState({
      active: SettingsStore.getState().settings[2][0].toLowerCase(),
      url: SettingsStore.getState().settings[3][0],
      frequency: SettingsStore.getState().settings[4][0] * this.MILLISECONDS_IN_SECOND,
      duration: SettingsStore.getState().settings[5][0] * this.MILLISECONDS_IN_SECOND,
      visible: false
    }, function () {
        let frequency = this.state.frequency || 10000
        this.SceensaverToggleTimerID = setInterval(() => {
          this.tick();

          this.SceensaverDurationTimerID = setTimeout(() => {
            this.tick()
          }, this.state.duration);
        }, SettingsStore.getState().settings[4][0] * this.MILLISECONDS_IN_SECOND);

    });
  }

  render() {
    let { active, url, duration, frequency, visible } = this.state;

    return (
      <div className="fd-screensaver" data-active={active} data-visible={visible}>
        <div className="x">
          <img className="y" src={url} />
        </div>
      </div>
    );
  }
}

export default ScreenSaver;

