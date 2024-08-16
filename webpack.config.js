const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = [
  // Node Configuration
  {
    watch: false,
    mode: 'development', // TODO: Switch to 'production' later
    // TODO: Remove on publish
    // devtool: 'source-map', // Use inline-source-map for better debugging during development
    target: 'node', // use require() & use NodeJs CommonJS style
    externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
    externalsPresets: {
      node: true, // in order to ignore built-in modules like path, fs, etc.
    },
    entry: {
    //   index: { import: './src/index.js', filename: './[name].js' },
    //   prompt: { import: './src/page/prompt.js', filename: './page/[name].js' },
    },
    output: {
      path: path.resolve(__dirname, 'lib'),
      // pathinfo: true, // For debugging
    },
    // resolve: {
    //   extensions: ['.ts', '.js'],
    // },
    // module: {
    //   rules: [
    //     {
    //       test: /\.ts$/,
    //       use: 'ts-loader',
    //       exclude: /node_modules/,
    //     },
    //   ],
    // },
    plugins: [
      // new HtmlWebpackPlugin({
      //   template: 'src/page/prompt.html',
      //   chunks: ['prompt'],
      //   filename: './page/prompt.html',
      //   inject: false, // Disable automatic injection
      // }),
      // new CopyWebpackPlugin({
      //   patterns: [
      //     { from: 'src/page/prompt-out.css', to: './page' },
      //   ],
      // }),
      new CopyWebpackPlugin({
        patterns: [
          { from: './**/*', to: '[path][name][ext]', context: 'src' }, // Copy all files
        ],
      }),
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: ['*'], // Clean the output before building
      }),
    ],
  },
];
