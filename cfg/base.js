var path = require('path');
var port = 8000;
var srcPath = path.join(__dirname, '/../src');
var publicPath = '/assets/';

var autoprefixer = require('autoprefixer');
var precss = require('precss');
var color = require('postcss-color-function');
var magician = require('postcss-font-magician');

var toAbsolute = function (relativePath) {
  return path.resolve(__dirname, relativePath);
};

module.exports = {
  port: port,
  debug: true,
  output: {
    path: path.join(__dirname, '/../dist/assets'),
    filename: 'app.js',
    publicPath: publicPath
  },
  devServer: {
    contentBase: './src/',
    historyApiFallback: true,
    hot: true,
    port: port,
    publicPath: publicPath,
    noInfo: false
  },
  resolve: {
    extensions: [
      '',
      '.js',
      '.jsx'
    ],
    alias: {
      'tauCharts': toAbsolute('../node_modules/tauCharts/build/development/tauCharts'),
      'tauCharts-tooltip': toAbsolute('../node_modules/tauCharts/build/development/plugins/tauCharts.tooltip'),
      'tauCharts-legend': toAbsolute('../node_modules/tauCharts/build/development/plugins/tauCharts.legend'),
      'tauCharts-trendline': toAbsolute('../node_modules/tauCharts/build/development/plugins/tauCharts.trendline'),
      'tauCharts-export': toAbsolute('../node_modules/tauCharts/build/development/plugins/tauCharts.export'),
      'tauCharts-quick-filter': toAbsolute('../node_modules/tauCharts/build/development/plugins/tauCharts.quick-filter'),
      'tauCharts-annotations': toAbsolute('../node_modules/tauCharts/build/development/plugins/tauCharts.annotations'),
      'tauCharts-layers': toAbsolute('../node_modules/tauCharts/build/development/plugins/tauCharts.layers'),

      actions: srcPath + '/actions/',
      components: srcPath + '/components/',
      sources: srcPath + '/sources/',
      stores: srcPath + '/stores/',
      styles: srcPath + '/styles/',
      config: srcPath + '/config/' + process.env.REACT_WEBPACK_ENV
    }
  },
  module: {
    preLoaders: [{
        test: /\.(js|jsx)$/,
        include: srcPath,
        loader: 'eslint-loader'
      }],
    loaders: [
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader!postcss-loader'
      },
      {
        test: /\.sass/,
        loader: 'style-loader!css-loader!postcss-loader!sass-loader?outputStyle=expanded&indentedSyntax'
      },
      {
        test: /\.scss/,
        loader: 'style-loader!css-loader!postcss-loader!sass-loader?outputStyle=expanded'
      },
      {
        test: /\.less/,
        loader: 'style-loader!css-loader!postcss-loader!less-loader'
      },
      {
        test: /\.styl/,
        loader: 'style-loader!css-loader!postcss-loader!stylus-loader'
      },
      {
        test: /\.(png|jpg|gif|woff|woff2)$/,
        loader: 'url-loader?limit=8192'
      }
    ]
  },
  postcss: function () {
    return [autoprefixer, precss, color, magician];
  }
};
