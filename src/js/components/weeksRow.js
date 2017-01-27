import React from 'react';
import DaysRow from './daysRow';

class WeeksRow extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const style = {
      background: `url(./images/${this.props.people.employee.replace(/\s/g, '')}.jpg)`
    };
    const { weeklyBreakdown } = this.props.people;
    let cols = [];
    let employees = [];

    weeklyBreakdown.forEach((people, i) => {
      cols.push(<DaysRow key={i} time={people} count={i} />);
    });

    return (
      <div className="fd-resourceTable-row">
        <div className="fd-resourceTable-employee">
          <div className="fd-resourceTable-employee--container">
            <i style={style}></i>
            <span>{this.props.people.employee}</span>
          </div>
        </div>
        {cols}
      </div>
    );
  }
}

export default WeeksRow;
