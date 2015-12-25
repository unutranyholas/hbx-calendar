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
    const tickSize = 8;
    const xAxisHeight = 16;

    const numFormat = y.tickFormat(5, '%');
    const dotRadius = 2.5;
    const labelPadding = 4;

    const now = ( <line y1={y.range()[0]} y2={y.range()[1]} x1={x(date)} x2={x(date)} /> );

    //const position = _.findIndex(actions, s => s.isMe);
    //const stats = ( <g><text x="0" y="0"><tspan>{position}</tspan><tspan> students are ahead you</tspan></text></g> ) ;

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

    const yAxis = (
      <g className="yAxis">
        <line y1={y.range()[1]} y2={y.range()[0]} x1={x.range()[0]} x2={x.range()[0]} />
        {yTicks}
      </g>
    );

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

    return (
      <div>
        <h1>{this.props.modules[0].course}</h1>
        <div ref="chart" className="chart">
          <svg width={width} height={height}>
            <g transform={translate}>
              <g className="now">
                {now}
              </g>
              <g className="axes">
                {yAxis}
                <g className="x-axis" transform="translate(0, 10)">
                  <XAxis x={x} y={{y: y.range()[1], height: xAxisHeight}} actions={myActions} />
                  <Modules x={x} y={{y: y.range()[1], height: xAxisHeight}} activeModule={myActiveModule} modules={modules} assumption={assumption} />
                </g>
              </g>
              <g className="modules">
                <Modules x={x} y={y} activeModule={myActiveModule} modules={modules} assumption={assumption} />
              </g>
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
// TODO: fix X axis
// TODO: fix Y axis
// TODO: tune colors
// TODO: code the rest of the page
// TODO: add drag react component
// TODO: stylize selectbox
// TODO: test interactions
// TODO: improve copyrighting
// TODO: animations?

