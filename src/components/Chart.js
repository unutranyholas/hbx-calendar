import React from 'react';
import _ from 'lodash';

import { linear, time } from 'd3-scale';
import { line } from 'd3-shape';

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
    const {x, y} = this;
    const tickSize = 8;
    const labelPadding = 4;
    const dateFormat = x.tickFormat('%b %d');
    const numFormat = y.tickFormat(5, '%');
    const dotRadius = 3;

    const now = ( <line y1={y.range()[0]} y2={y.range()[1]} x1={x(date)} x2={x(date)} /> );

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
              y={y(m.progress_finish.te)}
              width={x(m.due_date) - x(m.release_date)}
              height={y(m.progress_start[assumption]) - y(m.progress_finish[assumption])}
        />
      )
    });

    const studentLines = actions.map((s, i) => {
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
                {xAxis}
                {yAxis}
              </g>
              <g className="modules">
                {moduleRects}
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
