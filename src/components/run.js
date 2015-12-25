import 'core-js/fn/object/assign';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './';

import _ from 'lodash';
import d3 from 'd3';
import queue from 'queue-async';

let calendar = require('file!../data/calendar.csv');
let courses = require('file!../data/course_data.csv');
let students = require('file!../data/student_data.csv');


queue()
  .defer(callback => d3.csv(calendar, res => {
    callback(null, res)
  }))
  .defer(callback => d3.csv(courses, res => {
    callback(null, res)
  }))
  .defer(callback => d3.csv(students, res => {
    callback(null, res)
  }))
  .await((error, calendar, courses, students) => {

    students = _.chain(students).sortBy(d => d['completiondate']).sortBy(d => d['student_id']).sortBy(d => d['course_number']).value();

    students = d3.nest().key(d => d['course_number']).entries(students);
    courses = d3.nest().key(d => d['course_number']).entries(courses);
    calendar = d3.nest().key(d => d['course_number']).entries(calendar);

    courses = courses.map(c => {
      c.tasks = c.values.map((t, i) => {
        t.progress = {};
        t.progress.te = (i + 1) / c.values.length;
        t.progress.mod = 0;
        t.progress.dur = 0;
        return t
      });

      c.tasks = d3.nest().key(d => d['module_number']).entries(c.tasks);

      delete c.values;
      return c
    });

    students = students.map(c => {
      c.actions = c.values.map(a => {
        a.completiondate = new Date(a.completiondate);
        a.progress = _.find(courses[c.key - 1].tasks[a.module_number - 1].values, t => {
          return t.lesson_number === a.lesson_number &&
            t.concept_number === a.concept_number &&
            t.te_number === a.te_number
        }).progress;

        return a
      });
      delete c.values;

      c.actions = c.actions.reduce((prev, cur, i, array) => {

        if (prev.length === 0) {
          prev.push(cur);
        } else if (_.last(prev).student_id !== cur.student_id ) {
          prev.push(cur);
        } else if (_.last(prev).progress.te <= cur.progress.te) {
          prev.push(cur);
        }
        return prev

      },[]);

      c.actions = d3.nest().key(d => d['student_id']).entries(c.actions);

      return c
    });

    calendar = calendar.map((c, n) => {
      c.modules = c.values.map((m, i) => {
        m.release_date = (new Date(m.release_date)).setHours(0, 0, 0);
        m.due_date = (new Date(m.due_date)).setHours(23, 59, 59);
        m.progress_start = (i === 0) ? {te: 0, mod: 0, dur: 0} : _.last(courses[n].tasks[i - 1].values).progress;
        m.progress_finish = _.last(courses[n].tasks[i].values).progress;
        return m
      });
      delete c.values;
      return c
    });

    ReactDOM.render(<App data={_.merge(students, calendar)} />, document.getElementById('app'));

  });
