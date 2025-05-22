# ExifCropFrame

![ExifCropFrame](public/images/logo_white.png)

[![Demo App](https://img.shields.io/badge/Demo-Live%20App-4285F4?style=for-the-badge&logo=react)](https://nixiy.github.io/ExifCropFrame)
[![GitHub repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/nixiy/ExifCropFrame)

*English version follows Japanese*

## 概要

ExifCropFrameは、写真のExif情報をテキストとして画像に埋め込み、様々な比率でクロップ・フレーミングできるReactアプリケーションです。写真共有時に撮影データを簡単に表示したい写真愛好家向けのツールです。

**主な機能:**

- 画像のドラッグ＆ドロップまたはファイル選択による簡単な読み込み
- Exif情報の自動抽出と視覚的な表示
- カスタマイズ可能なテキスト色と背景色
- 様々なアスペクト比での画像クロップ（21:9, 16:9, 1:1など）
- 美しいモダンなUIデザイン
- 処理した画像のダウンロード

## 使い方

1. [アプリケーション](https://nixiy.github.io/ExifCropFrame)にアクセス
2. 画像をドラッグ＆ドロップするか、「画像を選択」ボタンをクリック
3. 必要に応じてExif情報の表示をカスタマイズ:
   - テキスト色とバックグラウンド色を調整
   - 枠サイズを選択
   - アスペクト比を設定
   - 必要に応じてクロップ領域を調整
4. 「画像を生成」ボタンをクリック
5. 生成された画像をダウンロード

## 対応しているExif情報

- カメラメーカー・モデル
- 撮影日時
- 露出設定（シャッタースピード、F値、ISO）
- レンズ情報
- 焦点距離
- GPS情報（位置情報が含まれている場合）
- その他のカメラ設定

## 開発者向け情報

### 必要条件

- Node.js (v14.0.0以上)
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/nixiy/ExifCropFrame.git
cd ExifCropFrame

# 依存パッケージをインストール
npm install
```

### 開発サーバーの起動

```bash
npm start
```
アプリは http://localhost:8080 で利用可能になります。

### ビルド

```bash
npm run build
```

### デプロイ

GitHub Pagesへのデプロイ:

```bash
npm run deploy
```

### 主要な技術

- React.js
- Exif Parser - 画像メタデータの抽出
- React Image Crop - 画像クロッピング機能
- Webpack - バンドル

## ライセンス

このプロジェクトはMITライセンスで提供されています。

## 作者

[nixiy](https://github.com/nixiy)

---

# ExifCropFrame [English]

## Overview

ExifCropFrame is a React application that embeds Exif information as text onto photos and allows cropping/framing in various aspect ratios. It's designed for photography enthusiasts who want to easily display shooting data when sharing their photos.

**Key Features:**

- Easy image loading via drag & drop or file selection
- Automatic Exif data extraction and visual display
- Customizable text color and background color
- Image cropping with various aspect ratios (21:9, 16:9, 1:1, etc.)
- Beautiful modern UI design
- Download of processed images

## How to Use

1. Visit the [application](https://nixiy.github.io/ExifCropFrame)
2. Drag & drop an image or click "Select Image"
3. Customize Exif information display as needed:
   - Adjust text color and background color
   - Select border size
   - Set aspect ratio
   - Adjust crop area if needed
4. Click "Generate Image"
5. Download the generated image

## Supported Exif Information

- Camera make/model
- Date and time
- Exposure settings (shutter speed, f-number, ISO)
- Lens information
- Focal length
- GPS information (if included)
- Other camera settings

## Developer Information

### Requirements

- Node.js (v14.0.0 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/nixiy/ExifCropFrame.git
cd ExifCropFrame

# Install dependencies
npm install
```

### Start Development Server

```bash
npm start
```
The app will be available at http://localhost:8080.

### Build

```bash
npm run build
```

### Deploy

Deploy to GitHub Pages:

```bash
npm run deploy
```

### Core Technologies

- React.js
- Exif Parser - for extracting image metadata
- React Image Crop - for image cropping functionality
- Webpack - for bundling

## License

This project is available under the MIT License.

## Author

[nixiy](https://github.com/nixiy)
