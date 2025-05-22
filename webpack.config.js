const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/', // Add this line
    // publicPath の設定を削除
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      templateParameters: (compilation, assets, assetTags, options) => {
        return {
          isProduction: process.env.NODE_ENV === 'production',
          publicPath: process.env.NODE_ENV === 'production' ? '/ExifCropFrame/' : '/',
          process: { // process オブジェクトを維持
            env: {
              NODE_ENV: process.env.NODE_ENV || 'development'
            }
          }
        };
      },
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public/images',
          to: 'images',
          globOptions: {
            ignore: ['**/sample-image.jpg'],
          },
        },
      ],
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3000,
    hot: true,
  }
};
