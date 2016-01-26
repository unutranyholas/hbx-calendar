import React from 'react';
import _ from 'lodash';

import NumberEditor from './NumberEditor';
import { format } from 'd3-time-format';

import styles from './Selector.css'

export default class Selector extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      student_n: props.students.indexOf(props.student_id),
      course_number: props.course_number,
      date: props.date,
      assumption: props.assumption
    };

    this.onSelectChange = this.onSelectChange.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.onStudentChange = this.onStudentChange.bind(this);
  }

  onSelectChange(e) {
    this.setState({[e.target.dataset.field]: e.target.value});
    this.props.changeState({[e.target.dataset.field]: e.target.value});
  }

  onDateChange(e){
    this.setState({date: e});
    this.props.changeState({date: +e});
  }

  onStudentChange(e){
    this.setState({student_n: e});
    this.props.changeState({student_id: this.props.students[parseInt(e)]});
  }


  render() {
    const {students, dates, courses, assumptions} = this.props;
    const dateString = format('%b, %d at %H:%M');
    const assumptionTexts = {
      te: 'corresponds to the number of teaching elements',
      mod: 'is equal each other',
      dur: 'corresponds to duration of module'
    };

    const assumptionsList = assumptions.map((a, i) => {
      return (<option value={a} key={i}>{assumptionTexts[a]}</option>)
    });

    const coursesList = courses.map((c, i) => {
      return (<option value={c.n} key={i}>{c.name}</option>)
    });

    const dateInput = (
      <span className="input">
        <NumberEditor
          min={dates[0]}
          max={dates[1]}
          step={4 * 60 * 60 * 1000}
          decimals={0} data-field="date"
          value={this.state.date}
          onValueChange={this.onDateChange}
          className="numInput"
        />
        {dateString(this.state.date)}
      </span>
    );

    const studentInput = (
      <span className="input">
        <NumberEditor
          min={0}
          max={students.length - 1}
          step={0.2}
          decimals={1}
          data-field="student_id"
          value={this.state.student_n}
          onValueChange={this.onStudentChange}
          className="numInput"
        />
        #{students[parseInt(this.state.student_n)]}
      </span>
    );

    const courseSelect = (
      <span className="select">
        <select data-field="course_number" value={this.state.course_number} onChange={this.onSelectChange} style={{width: 300}}>
          {coursesList}
        </select>
        {courses[this.state.course_number - 1].name}
      </span>
    );

    const assumptionSelect = (
      <span className="select">
        <select data-field="assumption" value={this.state.assumption} onChange={this.onSelectChange} style={{width: 300}}>
          {assumptionsList}
        </select>
        {assumptionTexts[this.state.assumption]}
      </span>
    );

    return (
      <div className="selector">
        <h3>
          Student {studentInput} would see the progress in {courseSelect} on {dateInput} this way:
        </h3>
        <p>(we assume that the effort of each module {assumptionSelect})</p>
      </div>
    );
  }
}
