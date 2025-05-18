/**
 * img/ディレクトリにある画像からExif情報を抽出するスクリプト
 * node test-exif-img-dir.js コマンドで実行
 */
const fs = require('fs');
const path = require('path');
const ExifParser = require('exif-parser');

// img/ディレクトリのパス
const imgDirPath = path.join(__dirname, 'img');

// 画像ファイル拡張子
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.JPG', '.JPEG'];

// 画像ファイルの一覧を取得
function getImageFiles() {
  try {
    console.log(`画像ディレクトリを検索中: ${imgDirPath}`);
    // ディレクトリの存在確認
    if (!fs.existsSync(imgDirPath)) {
      console.error(`ディレクトリが存在しません: ${imgDirPath}`);
      return [];
    }
    
    const files = fs.readdirSync(imgDirPath);
    console.log(`ディレクトリ内のファイル数: ${files.length}`);
    
    return files.filter(file => {
      const ext = path.extname(file);
      return IMAGE_EXTENSIONS.includes(ext);
    });
  } catch (error) {
    console.error('画像ディレクトリの読み込みエラー:', error);
    return [];
  }
}

// Exif情報を抽出
function extractExif(filePath) {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    const parser = ExifParser.create(imageBuffer);
    return parser.parse();
  } catch (error) {
    console.error(`Exif抽出エラー (${filePath}):`, error);
    return null;
  }
}

// メイン処理
function main() {
  console.log('=== img/ディレクトリの画像Exifテスト ===');
  
  const imageFiles = getImageFiles();
  
  if (imageFiles.length === 0) {
    console.log('画像ファイルが見つかりませんでした。');
    return;
  }
  
  console.log(`${imageFiles.length}個の画像ファイルを検出しました。\n`);
  
  // 各画像ファイルを処理
  imageFiles.forEach(file => {
    const filePath = path.join(imgDirPath, file);
    console.log(`\n=== ${file} の分析 ===`);
    
    const exifData = extractExif(filePath);
    
    if (!exifData || !exifData.tags) {
      console.log(`${file} からExif情報を取得できませんでした。`);
      return;
    }
    
    const tags = exifData.tags;
    
    // 主要なタグの出力
    const importantTags = [
      'Make', 'Model', 'ExposureTime', 'FNumber', 'ISO', 'FocalLength',
      'DateTimeOriginal', 'LensModel'
    ];
    
    console.log('主要なEXIFタグ:');
    importantTags.forEach(tag => {
      if (tags[tag] !== undefined) {
        // 特別な処理（日付フォーマットなど）
        if (tag === 'DateTimeOriginal' && typeof tags[tag] === 'number') {
          const date = new Date(tags[tag] * 1000);
          console.log(`${tag}: ${tags[tag]} (${date.toISOString()})`);
        } else if (tag === 'ExposureTime') {
          // 露出時間を分数形式で表示
          const value = tags[tag];
          if (value < 1) {
            const denominator = Math.round(1 / value);
            console.log(`${tag}: ${value} (1/${denominator}秒)`);
          } else {
            console.log(`${tag}: ${value}秒`);
          }
        } else {
          console.log(`${tag}: ${tags[tag]}`);
        }
      }
    });
    
    // 画像サイズ情報
    if (tags.ExifImageWidth && tags.ExifImageHeight) {
      console.log(`解像度: ${tags.ExifImageWidth} × ${tags.ExifImageHeight}`);
    }
    
    // その他の重要情報があれば追加
    if (tags.GPSLatitude || tags.GPSLongitude) {
      console.log(`GPS情報: 緯度=${tags.GPSLatitude}, 経度=${tags.GPSLongitude}`);
    }
  });
}

// スクリプト実行
main();
