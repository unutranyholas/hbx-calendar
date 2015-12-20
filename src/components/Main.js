require('normalize.css');
require('styles/App.css');
require('taucharts/build/production/tauCharts.min.css');

import React from 'react';
import d3 from 'd3';

import * as tauCharts from 'tauCharts';
import tooltip from 'tauCharts-tooltip';
import legend from 'tauCharts-legend';
import quickFilter from 'tauCharts-quick-filter';
import trendline from 'tauCharts-trendline';
import annotations from 'tauCharts-annotations';

import _ from 'lodash';
import queue from 'queue-async';

let calendar = require('file!../data/calendar.csv');
let courses = require('file!../data/course_data.csv');
let students = require('file!../data/student_data.csv');


class AppComponent extends React.Component {
  constructor(props) {
    super()

    this.drawChart = this.drawChart.bind(this);
  }


  render() {

    let self = this;

    queue()
      .defer(callback => d3.csv(calendar, function (res) {
        callback(null, res)
      }))
      .defer(callback => d3.csv(courses, function (res) {
        callback(null, res)
      }))
      .defer(callback => d3.csv(students, function (res) {
        callback(null, res)
      }))
      .await(function (error, calendar, courses, students) {

        students = _.chain(students).sortBy(d => d['completiondate']).sortBy(d => d['student_id']).sortBy(d => d['course_number']).value();

        students = d3.nest().key(d => d['course_number']).entries(students);
        courses = d3.nest().key(d => d['course_number']).entries(courses);
        calendar = d3.nest().key(d => d['course_number']).entries(calendar);

        courses = courses.map(c => {
          c.tasks = c.values.map((t, i) => {
            t.progress = (i + 1) / c.values.length;
            return t
          });
          delete c.values;
          return c
        });

        students = students.map(c => {
          c.actions = c.values.map(a => {
            a.completiondate = new Date(a.completiondate);
            a.progress = _.find(courses[c.key - 1].tasks, t => {
              return t.module_number === a.module_number &&
                t.lesson_number === a.lesson_number &&
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
            } else if (_.last(prev).progress <= cur.progress) {
              prev.push(cur);
            }
            return prev

          },[]);

          return c
        });

        calendar = calendar.map(c => {
          c.modules = c.values;
          delete c.values;
          return c
        });

        let result = _.merge(students, courses, calendar);

        self.drawChart(result[2]);

      });

    return (
      <div>
        <div ref="chart" className="chart"></div>
      </div>
    );
  }

  drawChart(data) {
    let test = [(new Date(data.modules[0].release_date)).getTime(), (new Date(data.modules[0].due_date)).getTime()];
    console.log(test);

    let dateItems = data.modules.map((m, i) => {
      return {
        dim: 'completiondate',
        val: [new Date(data.modules[i].release_date), new Date(data.modules[i].due_date)],
        text: 'Module #' + m.module_number
      }
    });

    let progressItems = (d3.nest().key(d => d['module_number']).entries(data.tasks)).map((m, i) => {
      return {
        dim: 'progress',
        val: _.last(m.values).progress,
        text: 'Module #' + m.key
      }
    });

    console.log(dateItems, progressItems);

    var chart = new tauCharts.Chart({
      data: data.actions,
      type: 'line',
      x: 'completiondate',
      y: 'progress',
      size: null,
      color: 'student_id',
      plugins: [
        tauCharts.api.plugins.get('tooltip')(),
        tauCharts.api.plugins.get('legend')(),
        //tauCharts.api.plugins.get('quick-filter')(),
        //tauCharts.api.plugins.get('trendline')(),
        tauCharts.api.plugins.get('annotations')({
          items: dateItems.concat(progressItems)
        }),
      ],
      guide: {
        showGridLines: 'none',
        showAnchors: false
      }
    });
    chart.renderTo(this.refs.chart);
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;


//TODO: draw modules
//TODO: draw other layers with dots
//TODO: course selector
//TODO: user selector
//TODO: date filter
//TODO: show now
