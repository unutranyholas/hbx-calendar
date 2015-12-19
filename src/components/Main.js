require('normalize.css');
require('styles/App.css');

import React from 'react';
import d3 from 'd3';
import _ from 'lodash';
import queue from 'queue-async';

let calendar = require('file!../data/calendar.csv');
let courses = require('file!../data/course_data.csv');
let students = require('file!../data/student_data.csv');


class AppComponent extends React.Component {
  render() {

    queue()
      .defer(callback => d3.csv(calendar, function(res) { callback(null, res) }) )
      .defer(callback => d3.csv(courses, function(res) { callback(null, res) }) )
      .defer(callback => d3.csv(students, function(res) { callback(null, res) }) )
      .await(function(error, calendar, courses, students) { console.log(calendar, courses, students); });


    //var combineData = new Promise((resolve, reject) => {
    //  d3.csv(courses, coursesData => {
    //    resolve(d3.nest().key(d => d['course_number']).entries(coursesData));
    //  });
    //})
    //
    //combineData.then(result => {
    //  console.log(result);
    //  d3.csv(calendar, calendarData => {
    //    console.log(calendarData);
    //    return 123;
    //    //return d3.nest().key(d => d['course_number']).entries(calendarData);
    //  });
    //
    //  //return result;
    //}).then(result => {
    //  console.log(result);
    //});

    //d3.csv(courses, coursesData => {
    //  console.log(data);
    //
    //  let courses = d3.nest().key(d => d['course_number']).entries(coursesData);
    //
    //  console.log(courses);
    //
    //});

    return (
      <div></div>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
