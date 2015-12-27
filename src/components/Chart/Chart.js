import React from 'react';
import _ from 'lodash';

import { linear, time } from 'd3-scale';
import { line } from 'd3-shape';

import styles from './Chart.css'


export default class Chart extends React.Component {
  constructor(props) {
    super(props);

    const {width, height, padding, modules} = props;

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
    return line()(values.map(d => [x(d.completiondate), y(d.progress[this.props.assumption])]));
  }

  render() {
    const {width, height, padding, modules, actions, assumption, date} = this.props;

    const myActions = actions.filter(s => s.isMe)[0].history;
    const myActiveModule = (myActions.length === 0) ? '1' : _.last(myActions).module_number;

    const {x, y} = this;
    const xAxisHeight = 16;
    const dotRadius = 2.5;
    const now = ( <line y1={y.range()[0]} y2={y.range()[1]} x1={x(date)} x2={x(date)} /> );

    const studentLines = _.sortBy(actions, s => s.isMe).map((s, i) => {
      if (s.history.length === 0) {return null}

      const className = s.isMe ? 'active' : null;
      const cx = x(_.last(s.history).completiondate);
      const cy = y(_.last(s.history).progress[assumption]);
      return (
        <g className={className} key={i}>
          <circle r={dotRadius} cx={cx} cy={cy} />
          <path d={this.getLinePath(s.history)} />
        </g>
      )
    });

    const translate = 'translate(' + padding.l + ',' + padding.t + ')';
    const position = _.findIndex(actions, s => s.isMe);

    return (
      <div className="window">
        <header><div className="logo" /><h2>{this.props.modules[0].course}</h2><div className="icons" /></header>
        <div className="info">
          <h1>My Progress</h1>
          <ul>
            <li>You completed <b>7 of 24</b><br />lessons in Module 4</li>
            <li>But you have another<br /><b>2d 12h</b> to finish it.</li>
            <li>By the way, <b>{position}</b> students<br />are ahead you.</li>
          </ul>
        </div>
        <div ref="chart" className="chart">
          <svg width={width} height={height}>
            <g transform={translate}>
              <g className="now">
                {now}
              </g>
              <g className="axes">
                <g  className="yAxis">
                  <YAxis x={x.range()} y={y} progress={(myActions.length) ? _.last(myActions).progress[assumption] : 0} modules={[0].concat(modules.map(m => m.progress_finish[assumption]))} />
                </g>
                <g className="xAxis" transform="translate(0, 10)">
                  <Modules x={x} y={{y: y.range()[1], height: xAxisHeight}} activeModule={myActiveModule} modules={modules} assumption={assumption} />
                  <XAxis x={x} y={{y: y.range()[1], height: xAxisHeight}} actions={myActions} />
                </g>
              </g>
              <Modules x={x} y={y} activeModule={myActiveModule} modules={modules} assumption={assumption} />
              <g className="students">
                {studentLines}
              </g>
            </g>
          </svg>
        </div>
      </div>
    );
  }
}

class YAxis extends React.Component {
  render() {

    const {x, y, progress, modules} = this.props;
    const tickSize = 8;
    const numFormat = y.tickFormat(5, '%');
    const labelPadding = 8;
    const x1 = x[0];
    const x2 = x[1];

    const yTicks = modules.map((t, i) => {
      const y1 = y(t);
      const y2 = y(t);
      const text = numFormat(t);

      const num = (i) ? (<text x={x2} y={y2} dx={labelPadding} dy={labelPadding / 2} className="num">{i}</text>) : null;

      return (
        <g key={i}>
          <text x={x1} y={y1} dx={-labelPadding} dy={labelPadding / 2} className="progress">{text}</text>
          <line y1={y1} y2={y2} x1={x1} x2={x2} />
          {num}
        </g>
      )
    });

    const yCur = y(progress);
    const textCur = numFormat(progress);

    return (
      <g className="yTicks">
        {yTicks}
        <text x={x2} y={y(1) - 20} dx={labelPadding + 8} className="label">Module #</text>
        <g className="current">
          <text x={x1} y={yCur} dx={-labelPadding} dy={labelPadding / 2} className="progress">{textCur}</text>
          <line y1={yCur} y2={yCur} x1={x1} x2={x1 - tickSize} />
        </g>
      </g>
    )
  }
}

class XAxis extends React.Component {
  render() {
    const {x, y, actions} = this.props;
    const dateFormat = x.tickFormat('%b %d');

    const xTicks = x.ticks().map((t, i) => {
      const line = {
        x1: x(t),
        x2: x(t),
        y1: y.y + y.height / 2,
        y2: y.y + y.height
      };
      return (
        <g key={i}>
          <line {...line} />
          <text x={line.x2} y={line.y2} dy={y.height}>{dateFormat(t)}</text>
        </g>
      )
    });

    const actionsTicks = actions.map((t, i) => {
      const line = {
        x1: x(t.completiondate),
        x2: x(t.completiondate),
        y1: y.y + (y.height / 4),
        y2: y.y + (y.height * 3 / 4)
      };

      return (
        <line {...line} key={i} />
      )
    });

    return (
      <g>
        <g className="xTicks">
          {xTicks}
        </g>
        <g className="actionsTicks">
          {actionsTicks}
        </g>
      </g>
    )
  }
}

class Modules extends React.Component {
  render() {
    const { x, y, modules, activeModule, assumption } = this.props;

    const moduleRects = modules.map((m, i) => {
      const rect = {
        key: i,
        x:          x(m.release_date),
        width:      x(m.due_date) - x(m.release_date),
        y:          (_.isFunction(y)) ? y(m.progress_finish[assumption]) : y.y,
        height:     (_.isFunction(y)) ? y(m.progress_start[assumption]) - y(m.progress_finish[assumption]) : y.height,
        className:  (activeModule === m.module_number) ? 'active' : null
      };

      return (
        <rect {...rect} />
      )
    });

    return (
      <g className="modules">
        {moduleRects}
      </g>
    )

  }
}

// set font to Roboto
// fix X axis
// fix Y axis
// TODO: tune colors

// code the rest of the page
// add drag react component
// stylize selectbox
// TODO: test interactions ???
// TODO: improve copyrighting
// TODO: animations?

