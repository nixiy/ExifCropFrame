// test-exif.js - サンプル画像を読み込んでExifデータをテストするスクリプト
const fs = require('fs');
const path = require('path');
const ExifParser = require('exif-parser');

// サンプル画像のパス
const sampleImagePath = path.join(__dirname, 'public', 'images', 'sample-image.jpg');

// 画像ファイル読み込み
try {
  console.log(`ファイル読み込み開始: ${sampleImagePath}`);
  const imageBuffer = fs.readFileSync(sampleImagePath);
  console.log(`ファイル読み込み成功 (サイズ: ${imageBuffer.length} bytes)`);
  
  // Exif解析
  const parser = ExifParser.create(imageBuffer);
  const exifData = parser.parse();
  
  console.log('Exifデータ解析結果:');
  console.log('------------------');
  
  if (exifData && exifData.tags) {
    // 主要なタグの出力
    const importantTags = [
      'Make', 'Model', 'ExposureTime', 'FNumber', 'ISO', 'FocalLength',
      'DateTimeOriginal', 'LensModel'
    ];
    
    console.log('主要なEXIFタグ:');
    importantTags.forEach(tag => {
      if (exifData.tags[tag] !== undefined) {
        console.log(`${tag}: ${exifData.tags[tag]}`);
      }
    });
    
    console.log('\n全てのEXIFタグ:');
    Object.keys(exifData.tags).forEach(tag => {
      console.log(`${tag}: ${exifData.tags[tag]}`);
    });
  } else {
    console.log('有効なExifデータが見つかりませんでした。');
  }
} catch (error) {
  console.error('エラー発生:', error);
}
