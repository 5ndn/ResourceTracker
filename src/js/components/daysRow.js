import React from 'react';

class DaysRow extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { time } = this.props;
    const classes = `fd-resourceTable-week fd-resourceTable-week--${this.props.count + 1}`;
    let items = [];

    time.forEach(project => {
      const iStyle = {
        background: project.color
      };

      items.push(<div key={project.id} style={iStyle} data-delivery={project.delivery} className={`span-${project.duration}`}><span>{project.name}</span></div>);
    });

    return (<div className={classes}>{items}</div>)
  }
}

export default DaysRow;
