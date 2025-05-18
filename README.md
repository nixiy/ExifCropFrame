# ExifCropFrame

ドラッグアンドドロップした写真のExifを読み込み、以下を行うReactアプリ

- 生成写真にExif情報をテキストで埋め込む。
- 画像の比率をGUI上で調整できる。(21:9など)

## 開発

### インストール

```bash
npm install
```

### 開発サーバー起動

```bash
npm start
```

### ビルド

```bash
npm run build
```

## テスト

### 単体テスト実行

```bash
npm test
```

### Exif情報取得テスト

サンプル画像からExif情報を抽出するテストを実行します：

```bash
# public/images/sample-image.jpgからExif情報を取得
npm run test:exif

# img/ディレクトリ内の全画像からExif情報を取得
npm run test:exif-img
```

### 全テスト実行

単体テストと統合テストを順番に実行します：

```bash
npm run test:all
```
