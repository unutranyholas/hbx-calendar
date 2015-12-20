require('normalize.css');
require('styles/App.css');
require('taucharts/build/production/tauCharts.min.css');

import React from 'react';
import d3 from 'd3';
import _ from 'lodash';

//import * as tauCharts from 'tauCharts';
//import tooltip from 'tauCharts-tooltip';
//import legend from 'tauCharts-legend';
//import quickFilter from 'tauCharts-quick-filter';
//import trendline from 'tauCharts-trendline';
//import annotations from 'tauCharts-annotations';
//import layers from 'tauCharts-layers';



class AppComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      course_number: 1,
      student_id: 1,
      date: _.last(props.data[0].modules).due_date
    }
    
  }
  render() {

    const chartProps = {
      actions: this.props.data[this.state.course_number - 1].actions.map(s => {
        s.values = s.values.filter(a => a.completiondate < new Date(this.state.date));
        return s
      }),
      modules: this.props.data[this.state.course_number - 1].modules,
      tasks: this.props.data[this.state.course_number - 1].tasks,

      student_id: this.state.student_id,
      width: 1000,
      height: 400,
      padding: {
        l: 30,
        b: 30,
        t: 30,
        r: 30
      }
    };

    return (
      <div>
        <Selector />
        <Chart {...chartProps} />
      </div>
    );
  }
}

class Chart extends React.Component {
  render() {

    console.log(this.props);

    return (
      <div>
        <h1>{this.props.modules[0].course}</h1>
        <div ref="chart" className="chart">{JSON.stringify(this.props.data)}</div>
      </div>
    );
  }
}

class Selector extends React.Component {
  render() {

    console.log(this.props);

    return (
      <div>
        123
      </div>
    );
  }
}













  //drawTauChart(data) {
  //  //console.log(test);
  //
  //  let dateItems = data.modules.map((m, i) => {
  //    return {
  //      dim: 'completiondate',
  //      val: [new Date(data.modules[i].release_date), new Date(data.modules[i].due_date)],
  //      text: 'Module #' + m.module_number
  //    }
  //  });
  //
  //  let progressItems = (d3.nest().key(d => d['module_number']).entries(data.tasks)).map((m, i) => {
  //    return {
  //      dim: 'progress',
  //      val: _.last(m.values).progress,
  //      text: 'Module #' + m.key
  //    }
  //  });
  //
  //  //console.log(dateItems, progressItems);
  //
  //  const chart = new tauCharts.Chart({
  //    data: data.actions,
  //    type: 'line',
  //    x: 'completiondate',
  //    y: 'progress',
  //    size: null,
  //    color: 'student_id',
  //    plugins: [
  //      //tauCharts.api.plugins.get('tooltip')(),
  //      //tauCharts.api.plugins.get('legend')(),
  //
  //      //tauCharts.api.plugins.get('quick-filter')(),
  //      //tauCharts.api.plugins.get('trendline')(),
  //
  //      //tauCharts.api.plugins.get('layers')({
  //      //  mode: 'merge',
  //      //  showPanel: false,
  //      //  layers: [{
  //      //    type: 'scatterplot',
  //      //    y: 'endPoint'
  //      //  }]
  //      //}),
  //      //
  //      //tauCharts.api.plugins.get('annotations')({
  //      //  items: dateItems.concat(progressItems)
  //      //})
  //    ],
  //    guide: {
  //      showGridLines: 'none',
  //      showAnchors: false
  //    }
  //  });
  //  chart.renderTo(this.refs.chart);
  //}

AppComponent.defaultProps = {

};

export default AppComponent;


//TODO: draw modules
//TODO: draw other layers with dots
//TODO: course selector
//TODO: user selector
//TODO: date filter
//TODO: show now
