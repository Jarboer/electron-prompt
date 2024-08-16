// TODO: Make automatic (mainly the web stuff using loops)

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); 

module.exports = [
  // Node
  {
    watch: false,
    mode: 'development', //   mode: 'production',
    devtool: 'source-map', // TODO: Remove on publish
    target: 'node', // use require() & use NodeJs CommonJS style
    externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
    externalsPresets: {
      node: true, // in order to ignore built-in modules like path, fs, etc.
    },
    entry: {
      index: { import: './src/index.js', filename: './[name].js' }, // filename: './[name].bundle.js'
    },
    output: {
      path: path.resolve(__dirname, 'lib'), // Set output directory to 'lib'
      pathinfo: true, // For debugging
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        // {
        //   test: /\.ts$/,
        //   use: 'ts-loader',
        //   exclude: /node_modules/,
        // },
      ],
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: ['index.js'], // Only clean the main section
      }),
    ],
  },
  // Web
  {
    watch: false,
    mode: 'development', //   mode: 'production',
    devtool: 'inline-source-map', // TODO: Remove on publish
    target: 'web', // use require() & use NodeJs CommonJS style
    // externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
    // externalsPresets: {
    //   node: true, // in order to ignore built-in modules like path, fs, etc.
    // },
    entry: {
      prompt: {
        import: './src/page/prompt.js',
        filename: 'page/[name].js', // 'lib/page/[name].bundle.js'
      },
    },
    output: {
      path: path.resolve(__dirname, 'lib'), // Set output directory to 'lib'
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        // {
        //   test: /\.ts$/,
        //   use: 'ts-loader',
        //   exclude: /node_modules/,
        // },
        // {
        //   test: /\.(png|svg|jpg|jpeg|gif)$/i,
        //   type: 'asset/resource',
        // },
        //   {
        //     test: /\.css$/,
        //     use: ['style-loader', 'css-loader'],
        //   },
        //   {
        //     test: /\.html$/,
        //     use: 'html-loader',
        //   },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'src/page/prompt.html',
        chunks: ['prompt'],
        filename: 'page/prompt.html',
        inject: false, // Disable automatic injection
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'src/page/prompt-out.css',
            to: 'page',
          }
        ],
      }),
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: ['page/*'], // Only clean the main section
      }),
    ],
  },
];
