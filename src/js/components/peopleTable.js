import React from 'react';
import WeeksRow from './weeksRow';

var DateStore = require('../modules/stores').DateStore;
var total = 0
var updated_projects = []
//Added to sort open projects to show up at the top
var show_open_first = false

class PeopleTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = DateStore.getState();
  }

  componentDidMount() {
    total = this.getPrecentage()
    DateStore.on('change', :: this._peopleChanged);
  }
  componentWillUnmount() {
    DateStore.off('change', :: this._peopleChanged);
  }

  setHeightRowDiv = () => {
    // this function return height for people data table div (dynamic height)
    var PeopleDataDiv = document.getElementsByClassName('fd-resourceTable-rowsWrap')
    var top_value = 0
    if (PeopleDataDiv[0])
      top_value = PeopleDataDiv[0].offsetTop + 27
    return top_value
  }

  componentDidUpdate() {
    total = this.getPrecentage();
    try {
      setTimeout(function(){
      $(".pie").each(function () {
        var percent = $(this).data("percent"),
          $left = $(this).find(".left span"),
          $right = $(this).find(".right span"),
          deg;
        if (percent <= 50) {
          // Hide left
          $left.hide();

          // Adjust right
          deg = 180 - (percent / 100 * 360)
          $right.css({
            "-webkit-transform": "rotateZ(-" + deg + "deg)"
          });
        } else {
          // Adjust left
          deg = 180 - ((percent - 50) / 100 * 360)
          $left.css({
            "-webkit-transform": "rotateZ(-" + deg + "deg)"
          });
        }
      });
    },500);
    } catch (e) {
      console.log(e);
    }
  }

  getPrecentage = () => {
    // this funtion used to get the open pecentage and also sort the data as per open duration
    const { projects } = this.state;
    let totalDay = 0
    let people_data = []
    projects.forEach(people => {
      if (people.weeklyBreakdown && people.weeklyBreakdown.length) {
        let open_count = 0
        people.weeklyBreakdown.forEach(ele => {
          ele.forEach(data => {
            if (data.name === "OPEN") {
              totalDay = totalDay + data.duration
              open_count = open_count + data.duration
            }
          })
        })
        people['open_count'] = open_count
        people_data.push(people)
      }
    })

    // calculate percentage
    let per = ((totalDay / (projects.length * 60)) * 100).toFixed(0)

    // sorting the peoples array as per open duration
    updated_projects = people_data
    updated_projects.sort(this.compare)
    return (projects.length ? per : 0)
  }

  _peopleChanged() {
    this.setState({
      projects: DateStore.getState().people,
      dates: DateStore.getState().dates,
      currentDay: DateStore.getState().currentDay,
    });
  }

  compare = (a, b) => {
    // to sort descending order 
    const bandA = a.open_count;
    const bandB = b.open_count;

    let comparison = 0;
    if (bandA < bandB) {
      comparison = 1;
    } else if (bandA > bandB) {
      comparison = -1;
    }
    return comparison;
  }

  render() {
    const { dates, projects, currentDay } = this.state;
    let rows = [];
    let rows_sorted = [];
    let cols = [];
    let BenchPrecent = this.getPrecentage();

    if (dates.length > 0) {
      dates.forEach((date, i) => {
        const isCurrentWeek = (i === 0) ? 'fd-resourceTable-date--current' : '';
        const classes = `fd-resourceTable-date fd-resourceTable-date--${i + 1} ${isCurrentWeek}`;
        const key = `${date.day}-${i}`;

        cols.push(<div key={key} className={classes}>
          <span className="date">{date.month} / {date.day}</span>
          <div className="fd-resourceTable-daysOfWeek">
            <span className="Mon">M</span>
            <span className="Tue">T</span>
            <span className="Wed">W</span>
            <span className="Thu">T</span>
            <span className="Fri">F</span>
          </div>
        </div>);
      });
    }

    // show normal data
    projects.forEach(people => {
      rows.push(<WeeksRow key={people.employee} people={people} />);
    });

    // show sorted data
    updated_projects.forEach(people => {
      rows_sorted.push(<WeeksRow key={people.employee} people={people} />);
    });

    return (
      <section className="fd-resourceTable" data-day={currentDay} style={{ overflowX: "auto", background: "#383838" }}>
        <div className="fd-resourceTable-head" style={{ width: "fit-content" }}>
          <span className="fd-resourceTable-open_percent">
            Bench Strength
            <div className="pie" data-percent={BenchPrecent}>
              <div className="left">
                <span></span>
              </div>
              <div className="right">
                <span></span>
              </div>
            </div>
          </span>
          <span style={{ display: "contents" }}>
            {cols}
          </span>
        </div>

        <div id="week-row" className="fd-resourceTable-rowsWrap" style={{
          overflowY: "auto", overflowX: "hidden", width: "fit-content"
          // height: `calc(100vh - ${this.setHeightRowDiv()}px)`
        }}>
          {this.props.show_open ? rows_sorted : rows}
          <div style={{ minHeight: "20px", minWidth: "100%", background: "#f5f5f5" }}></div>
        </div>
      </section>
    );
  }
}

export default PeopleTable;
