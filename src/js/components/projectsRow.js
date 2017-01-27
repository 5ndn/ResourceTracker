import React from 'react';

var TrackerStore = require('../modules/stores').TrackerStore;

class ProjectsRow extends React.Component {
  constructor(props) {
    super(props);
    // this.state = TrackerStore.getState();
    this.state = {};
  }

  componentDidMount() {
    TrackerStore.on('change', ::this._projectsChanged);
  }
  componentWillUnmount() {
    TrackerStore.off('change', ::this._projectsChanged);
  }
  // only update if a client is added/changed
  shouldComponentUpdate(nextProps, nextState) {
    const updatedState = (this.state.clients !== nextState.clients);

    return updatedState;
  }
  _projectsChanged() { 
    this.setState({
      clients: TrackerStore.getState().clients
    });
  }

  render() {
    let rows = [];

    if (this.state.clients) {

      this.state.clients.forEach((client, i) => {
        const iStyle = {
          background: client.color
        };

        rows.push(<li key={i}><i className="fd-projectList--color" style={iStyle}></i><span className="fd-projectList--name">{client.name}</span></li>);
      });
    }

    return (
      <div className="fd-projectList">
        <ul className="fd-projectList-container" ref="projectListContainer">{rows}</ul>
      </div>
    );
  }
}

export default ProjectsRow;
