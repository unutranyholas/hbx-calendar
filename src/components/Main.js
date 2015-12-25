import normalize from 'normalize.css'
import styles from 'styles/App.css'

import React from 'react';
import _ from 'lodash';

import Chart from './Chart'
import Selector from './Selector'


class AppComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      course_number: 3,
      student_id: 1,
      date: props.data[0].modules[3].due_date,
      assumption: 'te'
    };
    this.changeState = this.changeState.bind(this);
  }

  changeState(newValue) {
    this.setState(newValue);
  }

  render() {
    const chartProps = {
      actions: _.chain(this.props.data[this.state.course_number - 1].actions).map(student => {
        student.isMe = (+student.key) === this.state.student_id;
        student.history = student.values.filter(a => a.completiondate < new Date(this.state.date));
        return student
      }).sortBy(student => student.isMe).value(),
      modules: this.props.data[this.state.course_number - 1].modules,
      assumption: this.state.assumption,
      student_id: this.state.student_id,
      date: this.state.date,
      width: 1000,
      height: 400,
      padding: {
        l: 90,
        b: 40,
        t: 30,
        r: 30
      }
    };

    const selectorProps = {
      changeState: this.changeState,
      students: chartProps.actions.map(s => s.key).sort((a, b) => a - b),
      dates: [chartProps.modules[0].release_date, _.last(chartProps.modules).due_date],
      courses: this.props.data.map(c => {return {n: c.key, name: c.modules[0].course}}),
      assumptions: _.keys(this.props.data[0].modules[0].progress_start),
      student_id: this.state.student_id,
      course_number: this.state.course_number,
      date: this.state.date,
      assumption: this.state.assumption,
    };

    return (
      <div>
        <Selector {...selectorProps} />
        <Chart {...chartProps} />
      </div>
    );
  }
}

AppComponent.defaultProps = {

};

export default AppComponent;
