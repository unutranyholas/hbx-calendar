import React from 'react';
import _ from 'lodash';

export default class Selector extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      student_id: this.props.student_id,
      course_number: this.props.course_number,
      date: this.props.date,
      assumption: this.props.assumption
    };
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(e) {
    this.setState({[e.target.dataset.field]: e.target.value});
    this.props.changeState({[e.target.dataset.field]: +e.target.value});
  }

  render() {
    const {changeState, students, dates, courses, assumptions} = this.props;

    const assumptionsList = assumptions.map((a, i) => {
      return (<option value={a} key={i}>{a}</option>)
    });

    const studentsList = students.map((s, i) => {
      console.log(s);
      return (<option value={s} key={i}>{s}</option>)
    });

    const coursesList = courses.map((c, i) => {
      console.log(c);
      return (<option value={c.n} key={i}>{c.name}</option>)
    });

    return (
      <div>
        <select name="courses" id="courses" data-field="course_number" value={this.state.course_number} onChange={this.handleChange}>
          {coursesList}
        </select>
        <select name="students" id="students" data-field="student_id" value={this.state.student_id} onChange={this.handleChange}>
          {studentsList}
        </select>
        <input type="range" min={dates[0]} max={dates[1]} value={this.state.date} data-field="date" onChange={this.handleChange} />
        <select name="assumptions" id="assumptions" data-field="assumption" value={this.state.assumption} onChange={this.handleChange}>
          {assumptionsList}
        </select>
      </div>
    );
  }
}
