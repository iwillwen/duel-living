module.exports = {
  entry: {
    main: './assets/src/entries/main.js',
    admin: './assets/src/entries/admin.js'
  },
  output: {
    path: __dirname + '/assets/build/',
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        loader: 'vue'
      },
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  },
  babel: {
    presets: [ 'es2015' ]
  }
}