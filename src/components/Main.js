require('normalize.css');
require('styles/App.css');
require('taucharts/build/production/tauCharts.min.css');

import React from 'react';
import d3 from 'd3';
import _ from 'lodash';

import { linear, time } from 'd3-scale';
import { line } from 'd3-shape';


class AppComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      course_number: 3,
      student_id: 13,
      date: _.last(props.data[0].modules).due_date,
      assumption: 'te'
    }

  }
  render() {

    const chartProps = {
      actions: _.chain(this.props.data[this.state.course_number - 1].actions).map(student => {
        student.isMe = (+student.key) === this.state.student_id;
        student.values = student.values
          .filter(a => a.completiondate < new Date(this.state.date))
          .map(a => {
            a.progress = a.progress[this.state.assumption];
            return a;
          });
        return student
      }).sortBy(student => student.isMe).value(),

      modules: this.props.data[this.state.course_number - 1].modules.map(m => {
          m.progress_start = m.progress_start[this.state.assumption];
          m.progress_finish = m.progress_finish[this.state.assumption];
         return m;
      }),

      student_id: this.state.student_id,
      width: 1000,
      height: 400,
      padding: {
        l: 90,
        b: 40,
        t: 30,
        r: 30
      },
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
  constructor(props) {
    super(props);

    const {width, height, padding, modules} = this.props;

    this.x = time()
      .domain([modules[0].release_date, _.last(modules).due_date])
      .range([0, width - padding.l - padding.r]);

    this.y = linear()
      .domain([1, 0])
      .range([0, height - padding.t - padding.b]);

    this.getLinePath = this.getLinePath.bind(this);
  }

  getLinePath(values) {
    const {x, y} = this;
    return line()(values.map(d => [x(d.completiondate), y(d.progress)]));
  }


  render() {
    const {width, height, padding, modules, actions} = this.props;
    const {x, y} = this;
    const tickSize = 8;
    const labelPadding = 4;
    const dateFormat = x.tickFormat('%b %d');
    const numFormat = y.tickFormat(5, "%");
    const dotRadius = 3;

    const xTicks = x.ticks().map((t, i) => {
      const x1 = x(t);
      const x2 = x(t);
      const y1 = y.range()[1];
      const y2 = y.range()[1] + tickSize;
      const text = dateFormat(t);

      return (
        <g key={i}>
          <line y1={y1} y2={y2} x1={x1} x2={x2} />
          <text x={x2} y={y2} dy={tickSize + labelPadding}>{text}</text>
        </g>
      )
    });

    const yTicks = y.ticks().map((t, i) => {
      const x1 = y.range()[0];
      const x2 = y.range()[0] - tickSize;
      const y1 = y(t);
      const y2 = y(t);
      const text = numFormat(t);

      return (
        <g key={i}>
          <line y1={y1} y2={y2} x1={x1} x2={x2} />
          <text x={x2} y={y2} dx={-labelPadding} dy={labelPadding}>{text}</text>
        </g>
      )
    });

    const xAxis = (
      <g className="xAxis">
        <line y1={y.range()[1]} y2={y.range()[1]} x1={x.range()[0]} x2={x.range()[1]} />
        {xTicks}
      </g>
    );

    const yAxis = (
      <g className="yAxis">
        <line y1={y.range()[1]} y2={y.range()[0]} x1={x.range()[0]} x2={x.range()[0]} />
        {yTicks}
      </g>
    );

    const moduleRects = modules.map((m, i) => {
      return (
        <rect key={i}
              x={x(m.release_date)}
              y={y(m.progress_finish)}
              width={x(m.due_date) - x(m.release_date)}
              height={y(m.progress_start) - y(m.progress_finish)}
        />
      )
    });

    const studentLines = actions.map((s, i) => {
      const className = s.isMe ? 'active' : null;
      const cx = x(_.last(s.values).completiondate);
      const cy = y(_.last(s.values).progress);
      return (
        <g className={className}>
          <circle r={dotRadius} cx={cx} cy={cy} />
          <path key={i} d={this.getLinePath(s.values)} />
        </g>
      )
    });

    const translate = 'translate(' + padding.l + ',' + padding.t + ')';

    return (
      <div>
        <h1>{this.props.modules[0].course}</h1>
        <div ref="chart" className="chart">
          <svg width={width} height={height}>
            <g className="axes" transform={translate}>
              {xAxis}
              {yAxis}
            </g>
            <g className="modules" transform={translate}>
              {moduleRects}
            </g>
            <g className="students" transform={translate}>
              {studentLines}
            </g>
          </svg>
        </div>
      </div>
    );
  }
}

class Selector extends React.Component {
  render() {

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
