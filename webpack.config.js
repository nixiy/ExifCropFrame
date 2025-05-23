const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// 環境変数をログ出力（デバッグ用）
console.log('NODE_ENV:', process.env.NODE_ENV);
const isProduction = process.env.NODE_ENV === 'production';

// package.jsonからhomepageの設定を取得
const packageJson = require('./package.json');
let publicPath = '/';

if (isProduction && packageJson.homepage) {
  // homepage URLから適切なpublicPathを抽出
  try {
    const url = new URL(packageJson.homepage);
    // パスの最後にスラッシュがあることを確認
    publicPath = `${url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`}`;
    console.log('Extracted publicPath from homepage:', publicPath);
  } catch (e) {
    console.warn('Failed to extract publicPath from homepage:', e);
    publicPath = '/ExifCropFrame/'; // フォールバックとして直接指定
  }
}

console.log('Using publicPath:', publicPath);

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: isProduction ? '' : '/', // 本番環境では相対パスを使用
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
        // 外部で定義した変数を再利用
        return {
          isProduction: isProduction,
          publicPath: publicPath,
          process: {
            env: {
              NODE_ENV: process.env.NODE_ENV || 'development'
            }
          }
        };
      },      // scriptタグのsrcを自動で設定させる（publicPathが適用される）
      inject: true,
      // 本番環境では相対パスを使用
      publicPath: isProduction ? '' : publicPath,
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
