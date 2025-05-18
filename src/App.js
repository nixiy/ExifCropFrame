import React, { useState, useRef, useEffect } from 'react';
import EXIF from 'exif-js';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [exifData, setExifData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const dropRef = useRef(null);

  // ドラッグイベントのハンドラー
  const handleDragEnter = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
      e.dataTransfer.clearData();
    }
  };

  // ファイル選択のハンドラー
  const handleFileSelect = e => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  }; // Exif情報を取得する関数
  const getExifData = file => {
    return new Promise(resolve => {
      setIsProcessing(true);
      const exifData = {};

      EXIF.getData(file, function () {
        const exifTags = EXIF.getAllTags(this);

        if (exifTags && Object.keys(exifTags).length > 0) {
          // 一般的なExifタグ
          const relevantTags = [
            'Make',
            'Model',
            'DateTime',
            'ExposureTime',
            'FNumber',
            'ISOSpeedRatings',
            'FocalLength',
            'GPSLatitude',
            'GPSLongitude',
            'GPSAltitude',
            'ExposureProgram',
            'MeteringMode',
            'Flash',
            'WhiteBalance',
          ];

          // 解像度情報を特別に処理
          if (
            exifTags['PixelXDimension'] !== undefined &&
            exifTags['PixelYDimension'] !== undefined
          ) {
            exifData['Resolution'] =
              `${exifTags['PixelXDimension']} × ${exifTags['PixelYDimension']}`;
          }

          relevantTags.forEach(tag => {
            if (exifTags[tag] !== undefined) {
              // 特定のタグのフォーマットを調整
              switch (tag) {
                case 'ExposureTime':
                  // 露出時間をより読みやすい形式に変換 (例: "1/100 sec")
                  const expValue = exifTags[tag];
                  if (expValue < 1) {
                    exifData[tag] = `1/${Math.round(1 / expValue)} 秒`;
                  } else {
                    exifData[tag] = `${expValue} 秒`;
                  }
                  break;
                case 'FNumber':
                  // F値をフォーマット (例: "f/2.8")
                  exifData[tag] = `f/${exifTags[tag]}`;
                  break;
                case 'FocalLength':
                  // 焦点距離をフォーマット (例: "24mm")
                  exifData[tag] = `${exifTags[tag]}mm`;
                  break;
                default:
                  exifData[tag] = exifTags[tag];
              }
            }
          });
        }

        setIsProcessing(false);
        resolve(exifData);
      });
    });
  };

  // ファイルの処理
  const processFile = async file => {
    // 画像ファイルのみを受け付ける
    if (!file.type.match('image.*')) {
      alert('画像ファイルを選択してください');
      return;
    }

    // 画像の基本情報を設定
    const reader = new FileReader();
    reader.onload = async e => {
      setImage({
        src: e.target.result,
        name: file.name,
        type: file.type,
        size: Math.round(file.size / 1024) + ' KB',
        originalFile: file, // 元のファイルオブジェクトを保存
      });

      // Exif情報を取得
      const exif = await getExifData(file);
      setExifData(exif);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="container">
      <h1>ExifCropFrame</h1>
      <div
        ref={dropRef}
        className={`drop-area ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {!image ? (
          <>
            <p>画像をここにドラッグ＆ドロップしてください</p>
            <p>または</p>
            <label className="file-input-label">
              画像を選択
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </label>
          </>
        ) : (
          <div className="image-preview">
            <img src={image.src} alt={image.name} />
            <div className="info-container">
              <div className="image-info">
                <h3>画像情報</h3>
                <p>
                  <strong>ファイル名:</strong> {image.name}
                </p>
                <p>
                  <strong>タイプ:</strong> {image.type}
                </p>
                <p>
                  <strong>サイズ:</strong> {image.size}
                </p>
              </div>
              {isProcessing ? (
                <div className="exif-info">
                  <h3>Exif情報を読み込み中...</h3>
                  <p>しばらくお待ちください...</p>
                </div>
              ) : exifData && Object.keys(exifData).length > 0 ? (
                <div className="exif-info">
                  <h3>Exif情報</h3>
                  {Object.entries(exifData).map(([key, value]) => {
                    // タグ名を日本語に変換
                    let displayName = key;
                    switch (key) {
                      case 'Make':
                        displayName = 'メーカー';
                        break;
                      case 'Model':
                        displayName = '機種';
                        break;
                      case 'DateTime':
                        displayName = '撮影日時';
                        break;
                      case 'ExposureTime':
                        displayName = '露出時間';
                        break;
                      case 'FNumber':
                        displayName = 'F値';
                        break;
                      case 'ISOSpeedRatings':
                        displayName = 'ISO感度';
                        break;
                      case 'FocalLength':
                        displayName = '焦点距離';
                        break;
                      case 'WhiteBalance':
                        displayName = 'ホワイトバランス';
                        break;
                      case 'Flash':
                        displayName = 'フラッシュ';
                        break;
                      case 'ExposureProgram':
                        displayName = '露出プログラム';
                        break;
                      case 'MeteringMode':
                        displayName = '測光モード';
                        break;
                      case 'Resolution':
                        displayName = '解像度';
                        break;
                      case 'GPSLatitude':
                        displayName = '緯度';
                        break;
                      case 'GPSLongitude':
                        displayName = '経度';
                        break;
                      case 'GPSAltitude':
                        displayName = '高度';
                        break;
                      default:
                        break;
                    }

                    return (
                      <p key={key}>
                        <strong>{displayName}:</strong> {value.toString()}
                      </p>
                    );
                  })}
                </div>
              ) : (
                <div className="exif-info">
                  <h3>Exif情報</h3>
                  <p>Exif情報が見つかりませんでした</p>
                </div>
              )}
            </div>
            <div className="button-container">
              <button
                className="clear-button"
                onClick={() => {
                  setImage(null);
                  setExifData(null);
                }}
              >
                クリア
              </button>
              {exifData && Object.keys(exifData).length > 0 && (
                <button
                  className="embed-button"
                  onClick={() => {
                    // 画像にExif情報を埋め込む機能は次のステップで実装します
                    alert('この機能は開発中です');
                  }}
                >
                  Exif情報を画像に埋め込む
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
