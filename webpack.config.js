const path = require('path');

module.exports = {
  entry: './src/worker.js',
  output: {
    filename: 'worker.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'production',
  target: 'webworker',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
      },
    ],
  },
};