import React from 'react';
import WeeksRow from './weeksRow';

var DateStore = require('../modules/stores').DateStore;

class PeopleTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = DateStore.getState();
  }

  componentDidMount() {
    DateStore.on('change', ::this._peopleChanged);
  }
  componentWillUnmount() {
    DateStore.off('change', ::this._peopleChanged);
  }
  _peopleChanged() {
    this.setState({
      projects : DateStore.getState().people,
      dates: DateStore.getState().dates,
      currentDay: DateStore.getState().currentDay,
    });
  }

  render() {
    const { dates, projects, currentDay } = this.state;
    let rows = [];
    let cols = [];

    if (dates.length > 0) {
      dates.forEach((date, i) => {
        const isCurrentWeek = (i === 0) ? 'fd-resourceTable-date--current' : '';
        const classes = `fd-resourceTable-date fd-resourceTable-date--${i + 1} ${isCurrentWeek}`;

        cols.push(<div key={date.day} className={classes}><span className="date">{date.month} / {date.day}</span> <div className="fd-resourceTable-daysOfWeek"><span className="Mon">M</span> <span className="Tue">T</span> <span className="Wed">W</span> <span className="Thu">T</span> <span className="Fri">F</span></div></div>);
      });
    }

    projects.forEach(people => {
      rows.push(<WeeksRow key={people.employee} people={people} />);
    });

    return (
      <section className="fd-resourceTable" data-day={currentDay}>
        <div className="fd-resourceTable-head">{cols}</div>
        <div className="fd-resourceTable-rowsWrap">{rows}</div>
      </section>
    );
  }
}

export default PeopleTable;
