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
      prompt: { import: './src/pages/prompt/prompt.ts', filename: './pages/[name]/[name].js' },
      'login-prompt': { import: './src/pages/login-prompt/login-prompt.ts', filename: './pages/[name]/[name].js' },
      'prompt.controller': { import: './src/pages/prompt.controller.ts', filename: './pages/[name].js' },
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
      //   template: 'src/prompt/prompt.html',
      //   chunks: ['prompt'],
      //   filename: './prompt/prompt.html',
      //   inject: false, // Disable automatic injection
      // }),
      new CopyWebpackPlugin({
        patterns: [
          // Copy all non ts files in prompt
          {
            from: './pages/prompt/**/*',
            to: '[path][name][ext]',
            context: 'src',
            globOptions: {
              ignore: ['**/*.ts'],
            },
          },
          // Copy all non ts files in login-prompt
          {
            from: './pages/login-prompt/**/*',
            to: '[path][name][ext]',
            context: 'src',
            globOptions: {
              ignore: ['**/*.ts'],
            },
          },
          // Copy the css file in pages
          {
            from: './pages/tailwind-out.css',
            to: 'pages/tailwind-out.css',
            context: 'src',
          },
          { from: './types/**/*', to: '[path][name][ext]', context: 'src' }, // Copy all files in types
        ],
      }),
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: ['*'], // Clean the output before building
      }),
    ],
  },
];
