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
      'electron-prompt': { import: './src/electron-prompt.ts', filename: './[name].js' },
      // prompt: { import: './src/page/prompt.js', filename: './page/[name].js' },
    },
    output: {
      path: path.resolve(__dirname, 'lib'),
      // pathinfo: true, // For debugging
      globalObject: 'this',
      library: {
        name: 'electronPrompt',
        type: 'umd',
      },
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
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
          // Copy all files in page
          {
            from: './page/**/*',
            to: '[path][name][ext]',
            context: 'src',
            globOptions: {
              ignore: [
                '**/prompt-in.css',
              ],
            },
          },
          { from: './types/**/*', to: '[path][name][ext]', context: 'src' }, // Copy all files in types
          // { from: './electron-prompt-type.d.ts', to: '[path][name][ext]', context: 'src' }, // Copy all files in types
        ],
      }),
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: ['*'], // Clean the output before building
      }),
    ],
  },
];
