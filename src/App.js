import React, { useState, useRef, useEffect } from 'react';
import EXIF from 'exif-js';
import ExifParser from 'exif-parser';
import './App.css';

// 開発環境用のサンプル画像
import sampleImg from './sample-image.jpg'; // srcフォルダ内のサンプル画像

function App() {
  const [image, setImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [exifData, setExifData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [embeddedImage, setEmbeddedImage] = useState(null);
  const [showEmbedOptions, setShowEmbedOptions] = useState(false);
  const [textPosition, setTextPosition] = useState('bottom');
  const [textColor, setTextColor] = useState('#000000');
  const [textShadow, setTextShadow] = useState(true);
  const [borderSize, setBorderSize] = useState(2); // 白枠のサイズ（1-5の値）
  const [selectedExifTags, setSelectedExifTags] = useState({});
  const [useColumns, setUseColumns] = useState(true); // 2カラム表示を有効にするかどうか
  const dropRef = useRef(null);
  const canvasRef = useRef(null);

  // 開発環境で自動的にサンプル画像をロードする関数
  const loadSampleImage = async () => {
    try {
      // サンプル画像のURLをフェッチしてBlobに変換
      const response = await fetch(sampleImg);
      const blob = await response.blob();

      // Blobからファイルオブジェクトを作成
      const file = new File([blob], 'sample-image.jpg', { type: blob.type }); // 通常の画像処理フローを使用
      processFile(file);

      // 自動的にオプション画面も開く (Exif読み込みに時間がかかるため少し遅延)
      setTimeout(() => setShowEmbedOptions(true), 1000);
    } catch (error) {
      console.error('サンプル画像のロード中にエラーが発生しました:', error);
    }
  }; // 開発環境でのテスト用に自動的にサンプル画像をロード
  useEffect(() => {
    // 開発環境のみで実行し、画像がまだロードされていない場合のみ実行
    if (process.env.NODE_ENV === 'development' && !image) {
      loadSampleImage();
    }
  }, []); // コンポーネントのマウント時のみ実行

  // 画像とEXIFデータが揃ったら自動的に画像生成を実行
  useEffect(() => {
    // 画像とEXIFデータが存在し、canvasが準備できている場合
    if (
      image &&
      exifData &&
      canvasRef.current &&
      showEmbedOptions &&
      !embeddedImage &&
      !isProcessing
    ) {
      console.log('useEffectから自動画像生成を開始します');
      // 少し遅延させて確実にレンダリングが完了してから実行
      const timer = setTimeout(() => {
        embedTextInImage();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [image, exifData, showEmbedOptions, embeddedImage, isProcessing]);

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

      // 従来のEXIF.jsを使った処理
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
            'LensModel', // レンズモデル情報を追加
            'LensInfo', // レンズ情報を追加
          ];

          // 解像度情報を特別に処理
          if (
            exifTags['PixelXDimension'] !== undefined &&
            exifTags['PixelYDimension'] !== undefined
          ) {
            exifData['Resolution'] =
              `${exifTags['PixelXDimension']} × ${exifTags['PixelYDimension']}`;
          }

          // レンズ情報を処理
          // exif-jsではLensModelとLensInfoが取得できる場合があります
          if (exifTags['LensModel']) {
            exifData['LensModel'] = exifTags['LensModel'];
          }

          if (exifTags['LensInfo']) {
            exifData['LensInfo'] = exifTags['LensInfo'];
          }

          // レンズIDを処理（存在する場合）
          if (exifTags['LensID']) {
            exifData['LensID'] = exifTags['LensID'];
          }

          relevantTags.forEach(tag => {
            if (exifTags[tag] !== undefined) {
              // 特定のタグのフォーマットを調整
              switch (tag) {
                case 'ExposureTime':
                  // 露出時間をより読みやすい形式に変換 (例: "1/100 s")
                  const expValue = exifTags[tag];
                  if (expValue < 1) {
                    exifData[tag] = `1/${Math.round(1 / expValue)}s`;
                  } else {
                    exifData[tag] = `${expValue}s`;
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

        // exif-parser を使用して追加のレンズ情報を取得する
        // これは特に、exif-jsがレンズデータを正しく取得できない場合に役立ちます
        // ファイルを読み込んでパースする
        if (!exifData['LensModel'] || !exifData['LensInfo']) {
          const fileReader = new FileReader();
          fileReader.onload = function () {
            try {
              const buffer = fileReader.result;
              // ArrayBufferをバッファに変換する
              const parser = ExifParser.create(buffer);
              const result = parser.parse();

              // メーカーノートやIFDによって取得できるタグが異なります
              if (result.tags) {
                // レンズモデル情報が不足している場合に追加
                if (!exifData['LensModel'] && result.tags.LensModel) {
                  exifData['LensModel'] = result.tags.LensModel;
                }

                // レンズ仕様情報が不足している場合に追加
                if (!exifData['LensInfo'] && result.tags.LensSpecification) {
                  const lens = result.tags.LensSpecification;
                  if (Array.isArray(lens) && lens.length >= 4) {
                    // 多くの場合、配列は[最小焦点距離, 最大焦点距離, 最小F値, 最大F値]の形式
                    const minFocal = lens[0];
                    const maxFocal = lens[1];
                    const minFNumber = lens[2];
                    const maxFNumber = lens[3];

                    if (minFocal === maxFocal) {
                      exifData['LensInfo'] = `${minFocal}mm f/${minFNumber}`;
                    } else {
                      exifData['LensInfo'] =
                        `${minFocal}-${maxFocal}mm f/${minFNumber}-${maxFNumber}`;
                    }
                  }
                }

                // MakerNotesからレンズ情報を抽出（主にCanon, Nikon, Sonyなど）
                if (!exifData['LensModel'] && result.tags.LensType) {
                  exifData['LensModel'] = result.tags.LensType;
                }

                if (!exifData['LensModel'] && result.tags.Lens) {
                  exifData['LensModel'] = result.tags.Lens;
                }

                // Sony特有のタグを処理
                if (!exifData['LensModel'] && result.tags.SonyLensID) {
                  exifData['LensModel'] = `Sony Lens (ID: ${result.tags.SonyLensID})`;
                }
              }
            } catch (e) {
              console.error('レンズ情報の解析に失敗しました:', e);
            } finally {
              setIsProcessing(false);
              resolve(exifData);
            }
          };

          fileReader.onerror = function () {
            console.error('ファイルの読み込みに失敗しました');
            setIsProcessing(false);
            resolve(exifData);
          };

          // ファイルをArrayBufferとして読み込む
          fileReader.readAsArrayBuffer(file);
        } else {
          // レンズ情報がすでに取得できている場合はここで終了
          setIsProcessing(false);
          resolve(exifData);
        }
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
      setExifData(exif); // 指定されたExifタグのみを選択状態にする
      const tagsObj = {};
      const defaultSelectedTags = [
        'Make',
        'Model',
        'ExposureTime',
        'FNumber',
        'ISOSpeedRatings',
        'FocalLength',
        'LensModel', // レンズ情報もデフォルトで表示
        'LensInfo',
        'LensID',
      ];

      Object.keys(exif).forEach(key => {
        // デフォルトで選択するタグリストに含まれるかどうかをチェック
        tagsObj[key] = defaultSelectedTags.includes(key);
      });
      setSelectedExifTags(tagsObj); // 画像とEXIFデータが読み込まれた後、オプション画面のみを表示する
      // （実際の画像生成はuseEffectで処理）
      setTimeout(() => {
        setShowEmbedOptions(true); // オプション画面を表示
      }, 1000);
    };
    reader.readAsDataURL(file);
  };
  // 画像にテキストを埋め込む（白枠付きで下部に余裕を持たせた形式）
  const embedTextInImage = () => {
    if (!image || !exifData || !canvasRef.current) return;

    setIsProcessing(true);

    // 画像を読み込む
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // テキスト用の設定
      const selectedTags = Object.entries(selectedExifTags)
        .filter(([key, isSelected]) => isSelected)
        .map(([key]) => key);

      if (selectedTags.length === 0) {
        setIsProcessing(false);
        alert('表示するExif情報が選択されていません');
        return;
      } // メーカーと型番、およびその他の情報を別々に準備
      let cameraInfoText = '';
      let detailsInfoText = ''; // メーカーと型番を取得
      const make = selectedTags.includes('Make') ? exifData['Make'] : '';
      const model = selectedTags.includes('Model') ? exifData['Model'] : '';

      if (make || model) {
        // メーカー名と型番の間にスペースを追加し、メーカー名の後に必要に応じてスペースを追加
        cameraInfoText = make && model ? `${make.trim()}  ${model.trim()}` : make || model;
      } // 2行目の情報（焦点距離 / F値 / 露出時間 / ISO）を準備
      const focalLength = selectedTags.includes('FocalLength') ? exifData['FocalLength'] : '';
      const fNumber = selectedTags.includes('FNumber') ? exifData['FNumber'] : '';
      const exposureTime = selectedTags.includes('ExposureTime') ? exifData['ExposureTime'] : '';
      const iso = selectedTags.includes('ISOSpeedRatings')
        ? `ISO${exifData['ISOSpeedRatings']}`
        : ''; // スペースを削除// スラッシュで区切ってコンパクトに表示、スペースを調整して視認性を向上
      const details = [focalLength, fNumber, exposureTime, iso].filter(Boolean);
      if (details.length > 0) {
        detailsInfoText = details.join(' / '); // スラッシュ（/）で区切る
      }

      // その他の選択されたExif情報を準備
      const otherExifTexts = selectedTags
        .filter(
          key =>
            ![
              'Make',
              'Model',
              'FocalLength',
              'FNumber',
              'ExposureTime',
              'ISOSpeedRatings',
            ].includes(key)
        )
        .map(key => {
          // 日本語表示名に変換
          let displayName = key;
          switch (key) {
            case 'DateTime':
              displayName = '撮影日時';
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
            default:
              break;
          }
          return `${displayName}: ${exifData[key]}`;
        }); // フォントサイズの計算
      const baseFontSize = Math.max(12, Math.floor(img.width / 50));
      const largeFontSize = Math.floor(baseFontSize * 1.3); // カメラ情報用のフォント（2行目よりほんの少し大きい程度）
      const mediumFontSize = Math.floor(baseFontSize * 1.1); // テクニカル情報用の中間サイズフォント
      const smallFontSize = baseFontSize; // その他の詳細情報用のフォント
      const lineHeight = baseFontSize * 1.5; // 行間の調整

      // 下部のExif情報表示領域の高さを計算（大きいフォント + 中間フォント + その他の情報）
      const headerLines = (cameraInfoText ? 1 : 0) + (detailsInfoText ? 1 : 0);
      const totalLines = headerLines + otherExifTexts.length;
      const exifAreaHeight = Math.max(120, lineHeight * (totalLines + 1.5)); // 余白を少し増やす
      // 白い枠のサイズ（設定値に基づいて調整）
      const borderMultiplier = [0.5, 1, 2, 3, 4][borderSize - 1] || 1;
      const borderWidth = Math.max(10, Math.floor(img.width / 100) * borderMultiplier);

      // 新しいキャンバスのサイズを設定（白枠 + 画像 + 下部のExif領域）
      const totalWidth = img.width + borderWidth * 2;
      const totalHeight = img.height + borderWidth * 2 + exifAreaHeight;

      canvas.width = totalWidth;
      canvas.height = totalHeight;

      // 背景を白で塗りつぶす
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, totalWidth, totalHeight); // 画像を描画（白枠の分だけオフセット）
      ctx.drawImage(img, borderWidth, borderWidth);
      // Exif情報の背景を描画（純粋な白色で統一）
      ctx.fillStyle = '#ffffff'; // 完全な白色
      ctx.fillRect(0, borderWidth + img.height, totalWidth, exifAreaHeight);

      // テキスト描画位置の基準を設定（上部に少し余白をとる）
      const startX = borderWidth + 10;
      let startY = borderWidth + img.height + 20 + lineHeight;
      // テキスト影の設定（すべてのテキストに適用）
      if (textShadow) {
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.shadowBlur = 2;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      } else {
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
      } // カメラ情報（メーカー・型番）を描画（細身フォント、やや大きめ）
      if (cameraInfoText) {
        ctx.font = `${largeFontSize}px "Roboto", "Segoe UI", -apple-system, sans-serif`; // より細身のフォントを使用
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.fillText(cameraInfoText, totalWidth / 2, startY);
        startY += lineHeight * 1.2; // 間隔の調整
      }

      // 詳細情報（焦点距離 / F値 / シャッター速度 / ISO）を描画（中サイズフォント）
      if (detailsInfoText) {
        ctx.font = `${mediumFontSize}px "Roboto", "Segoe UI", -apple-system, sans-serif`; // より細身のフォントを使用
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.fillText(detailsInfoText, totalWidth / 2, startY);
        startY += lineHeight * 1.3; // 次のセクションまでの間隔を調整
      } // その他の情報を描画（左揃え、通常サイズ）
      if (otherExifTexts.length > 0) {
        ctx.font = `${smallFontSize}px "Roboto", "Segoe UI", -apple-system, sans-serif`; // より細身のフォントを使用
        ctx.fillStyle = textColor;
        ctx.textAlign = 'left';

        // メインセクションと他の情報の間に区切り線を追加（オプション）
        if (cameraInfoText || detailsInfoText) {
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(totalWidth * 0.2, startY - lineHeight * 0.5);
          ctx.lineTo(totalWidth * 0.8, startY - lineHeight * 0.5);
          ctx.stroke();
        }

        // 2カラムレイアウトの場合の設定
        const shouldUseColumns = useColumns && otherExifTexts.length > 3 && img.width > 600;
        const columnWidth = (totalWidth - startX * 2) / (shouldUseColumns ? 2 : 1);

        otherExifTexts.forEach((text, index) => {
          let x = startX;
          let y = startY;

          // 2カラム表示の場合
          if (shouldUseColumns) {
            const column = Math.floor(index / Math.ceil(otherExifTexts.length / 2));
            x = startX + column * columnWidth;
            y = startY + (index % Math.ceil(otherExifTexts.length / 2)) * lineHeight;
          } else {
            y = startY + index * lineHeight;
          }

          ctx.fillText(text, x, y);
        });
      } // 生成した画像のURLを取得
      const dataURL = canvas.toDataURL(image.type || 'image/jpeg');
      setEmbeddedImage(dataURL);
      setIsProcessing(false);

      // 少し待ってからプレビュー領域にスクロール
      setTimeout(() => {
        const previewElement = document.querySelector('.embedded-image-preview');
        if (previewElement) {
          previewElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    };

    img.src = image.src;
  };

  // 埋め込み画像のダウンロード
  const downloadEmbeddedImage = () => {
    if (!embeddedImage) return;

    // ダウンロードリンクを作成
    const link = document.createElement('a');
    link.href = embeddedImage;

    // ファイル名を設定（元のファイル名に-exifを付加）
    const fileName =
      image.name.replace(/\.[^.]+$/, '') + '-exif.' + (image.type.split('/')[1] || 'jpg');
    link.download = fileName;

    // リンクをクリックしてダウンロード開始
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                      case 'LensModel':
                        displayName = 'レンズ';
                        break;
                      case 'LensInfo':
                        displayName = 'レンズ情報';
                        break;
                      case 'LensID':
                        displayName = 'レンズID';
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
              {' '}
              <button
                className="clear-button"
                onClick={() => {
                  setImage(null);
                  setExifData(null);
                  setEmbeddedImage(null);
                  setShowEmbedOptions(false);
                  setSelectedExifTags({});
                }}
              >
                クリア
              </button>{' '}
              {process.env.NODE_ENV === 'development' && !image && (
                <button className="test-button" onClick={loadSampleImage}>
                  テスト画像読込
                </button>
              )}{' '}
              {exifData && Object.keys(exifData).length > 0 && (
                <button
                  className="embed-button"
                  onClick={() => setShowEmbedOptions(!showEmbedOptions)}
                >
                  Exif情報を画像に埋め込む
                </button>
              )}
            </div>

            {showEmbedOptions && exifData && Object.keys(exifData).length > 0 && (
              <div className="embed-options">
                <h3>埋め込みオプション</h3>{' '}
                <div className="option-group">
                  <label>テキスト色: </label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={e => setTextColor(e.target.value)}
                  />
                </div>
                <div className="option-group">
                  <label>白枠のサイズ: </label>
                  <select value={borderSize} onChange={e => setBorderSize(Number(e.target.value))}>
                    <option value="1">極細</option>
                    <option value="2">細い</option>
                    <option value="3">標準</option>
                    <option value="4">太い</option>
                    <option value="5">極太</option>
                  </select>
                </div>
                <div className="option-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={textShadow}
                      onChange={e => setTextShadow(e.target.checked)}
                    />
                    テキスト影を表示
                  </label>
                </div>
                <div className="option-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={useColumns}
                      onChange={e => setUseColumns(e.target.checked)}
                    />
                    情報を2列で表示（可能な場合）
                  </label>
                </div>
                <div className="exif-tags-selector">
                  <h4>表示するExif項目を選択</h4>
                  <div className="tags-list">
                    {Object.keys(exifData).map(tag => {
                      // 日本語表示名に変換
                      let displayName = tag;
                      switch (tag) {
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
                        case 'LensModel':
                          displayName = 'レンズ';
                          break;
                        case 'LensInfo':
                          displayName = 'レンズ情報';
                          break;
                        case 'LensID':
                          displayName = 'レンズID';
                          break;
                        default:
                          break;
                      }
                      return (
                        <label key={tag} className="tag-checkbox">
                          <input
                            type="checkbox"
                            checked={!!selectedExifTags[tag]}
                            onChange={e => {
                              setSelectedExifTags({
                                ...selectedExifTags,
                                [tag]: e.target.checked,
                              });
                            }}
                          />
                          <span>{displayName}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="embed-buttons">
                  <button
                    className="generate-button"
                    onClick={embedTextInImage}
                    disabled={isProcessing}
                  >
                    {isProcessing ? '処理中...' : '画像を生成'}
                  </button>
                </div>{' '}
                {embeddedImage && (
                  <div className="embedded-image-preview">
                    <h3>生成された画像</h3>
                    <p className="preview-hint">
                      設定を変更した場合は「画像を生成」ボタンを押して再生成できます
                    </p>
                    <img src={embeddedImage} alt="Exif情報付き画像" />
                    <button className="download-button" onClick={downloadEmbeddedImage}>
                      画像をダウンロード
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 非表示のCanvasエレメント */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
