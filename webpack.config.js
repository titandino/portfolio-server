const HTMLPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    home: [
      `${__dirname}/app/index.js`
    ],
    style: [
      `${__dirname}/app/partials/main.scss`
    ],
    admin: [
      `${__dirname}/app/js/admin.js`
    ],
    rs: [
      `${__dirname}/app/js/rs.js`
    ],
    ipviewer: [
      `${__dirname}/app/js/ipviewer.js`
    ]
  },
  output: {
    filename: '[name].js',
    path: `${__dirname}/build`
  },
  plugins: [
    new HTMLPlugin({
      inject: true,
      filename: 'index.html',
      template: `${__dirname}/app/index.html`,
      chunks: ['home', 'style']
    }),
    new HTMLPlugin({
      inject: true,
      filename: 'admin.html',
      template: `${__dirname}/app/admin.html`,
      chunks: ['home', 'admin', 'style']
    }),
    new HTMLPlugin({
      inject: true,
      filename: 'rs.html',
      template: `${__dirname}/app/rs.html`,
      chunks: ['rs', 'style']
    }),
    new HTMLPlugin({
      inject: true,
      filename: 'ipviewer.html',
      template: `${__dirname}/app/ipviewer.html`,
      chunks: ['ipviewer', 'style']
    }),
    new CopyPlugin([
      { from: `${__dirname}/app/asteroids`, to: `${__dirname}/build/asteroids` },
    ]),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{
          loader: require.resolve('babel-loader'),
          options: {
            cacheDirectory: true
          },
        }]
      },
      {
        test: /\.(html)$/,
        use: ['html-loader']
      },
      {
        test: /\.scss$/,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader"
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader'
        ]
      },
    ],
  },
};
