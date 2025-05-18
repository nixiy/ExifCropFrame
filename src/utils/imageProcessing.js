/**
 * 画像にテキストを埋め込む関数
 * @param {Object} options - オプション
 * @param {Object} options.image - 画像オブジェクト
 * @param {Object} options.exifData - EXIF情報
 * @param {Object} options.selectedTags - 選択されたタグ
 * @param {string} options.textColor - テキスト色
 * @param {string} options.backgroundColor - 背景色
 * @param {number} options.borderSize - 枠線サイズ（1-5）
 * @param {boolean} options.textShadow - テキスト影の有無
 * @param {boolean} options.useColumns - 2カラム表示の有無
 * @param {HTMLCanvasElement} options.canvas - キャンバス要素
 * @returns {Promise<string>} - 生成された画像のDataURL
 */
export const embedTextInImage = ({
  image,
  exifData,
  selectedTags,
  textColor,
  backgroundColor,
  borderSize,
  textShadow,
  useColumns,
  canvas,
}) => {
  return new Promise((resolve, reject) => {
    if (!image || !exifData || !canvas) {
      reject('必要なパラメータがありません');
      return;
    }

    // 画像を読み込む
    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d');

      // テキスト用の設定
      const selectedTagKeys = Object.entries(selectedTags)
        .filter(([key, isSelected]) => isSelected)
        .map(([key]) => key);

      if (selectedTagKeys.length === 0) {
        reject('表示するExif情報が選択されていません');
        return;
      }

      // メーカーと型番、およびその他の情報を別々に準備
      let cameraInfoText = '';
      let detailsInfoText = '';

      // メーカーと型番を取得
      const make = selectedTagKeys.includes('Make') ? exifData['Make'] : '';
      const model = selectedTagKeys.includes('Model') ? exifData['Model'] : '';
      const lensModel = selectedTagKeys.includes('LensModel') ? exifData['LensModel'] : '';

      if (make || model) {
        // メーカー名と型番を結合し、レンズモデル情報も含める
        let cameraText = make && model ? `${make.trim()}  ${model.trim()}` : make || model;

        // レンズモデル情報があれば、カメラ情報の後に「/」で区切って追加
        if (lensModel) {
          cameraInfoText = `${cameraText} / ${lensModel.trim()}`;
        } else {
          cameraInfoText = cameraText;
        }
      }

      // 2行目の情報（焦点距離 / F値 / 露出時間 / ISO）を準備
      const focalLength = selectedTagKeys.includes('FocalLength') ? exifData['FocalLength'] : '';
      const fNumber = selectedTagKeys.includes('FNumber') ? exifData['FNumber'] : '';
      const exposureTime = selectedTagKeys.includes('ExposureTime') ? exifData['ExposureTime'] : '';
      const iso = selectedTagKeys.includes('ISOSpeedRatings')
        ? `ISO${exifData['ISOSpeedRatings']}`
        : '';

      // スラッシュで区切ってコンパクトに表示、スペースを調整して視認性を向上
      const details = [focalLength, fNumber, exposureTime, iso].filter(Boolean);
      if (details.length > 0) {
        detailsInfoText = details.join(' / ');
      }

      // その他の選択されたExif情報を準備
      const otherExifTexts = selectedTagKeys
        .filter(
          key =>
            ![
              'Make',
              'Model',
              'FocalLength',
              'FNumber',
              'ExposureTime',
              'ISOSpeedRatings',
              'LensModel',
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
        }); // 白い枠のサイズ（設定値に基づいて調整）
      const borderMultiplier = [0.5, 1, 2, 3, 4][borderSize - 1] || 1;
      const borderWidth = Math.max(10, Math.floor(img.width / 100) * borderMultiplier);

      // フォントサイズを画像サイズに合わせて固定設定（枠サイズによる動的調整なし）
      const baseFontSize = Math.max(12, Math.floor(img.width / 50));
      const largeFontSize = Math.floor(baseFontSize * 1.3); // カメラ情報用のフォント
      const mediumFontSize = Math.floor(baseFontSize * 1.1); // テクニカル情報用のフォント
      const smallFontSize = baseFontSize; // その他の詳細情報用のフォント
      const lineHeight = baseFontSize * 1.5; // 行間の調整

      // 下部のExif情報表示領域の高さを計算（大きいフォント + 中間フォント + その他の情報）
      const headerLines = (cameraInfoText ? 1 : 0) + (detailsInfoText ? 1 : 0);
      const totalLines = headerLines + otherExifTexts.length; // 実際に必要なテキスト表示エリアの高さを計算
      // パディングは枠サイズと若干の比例関係を持たせつつも、過剰にならないよう調整
      const padding = Math.max(20, Math.min(30, borderWidth * 0.5)); // パディングの上限を設定
      const requiredTextHeight = lineHeight * (totalLines + 0.7) + padding; // テキストに必要な高さ
      const minExifAreaHeight = Math.max(120, borderWidth * 1.5); // 最低高さも適度に調整
      const exifAreaHeight = Math.max(minExifAreaHeight, requiredTextHeight);

      // 新しいキャンバスのサイズを設定（白枠 + 画像 + 下部のExif領域）
      const totalWidth = img.width + borderWidth * 2;
      const totalHeight = img.height + borderWidth * 2 + exifAreaHeight;

      canvas.width = totalWidth;
      canvas.height = totalHeight; // 背景を指定された色で塗りつぶす
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, totalWidth, totalHeight); // 画像を描画（白枠の分だけオフセット）
      ctx.drawImage(img, borderWidth, borderWidth);

      // Exif情報の背景を描画（指定された背景色で統一）
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, borderWidth + img.height, totalWidth, exifAreaHeight);

      // テキスト全体を縦方向に中央揃えするための開始Y位置を計算
      const startX = borderWidth + padding * 0.5; // パディングを考慮した横位置

      // 実際のテキストの高さを考慮してより正確に中央揃え
      const actualTextHeight = lineHeight * totalLines;
      const verticalCenterOffset = Math.max(0, (exifAreaHeight - actualTextHeight) / 2);
      let startY = borderWidth + img.height + verticalCenterOffset + lineHeight * 0.8; // 行の高さ調整

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
      }

      // カメラ情報（メーカー・型番）を描画（太字フォント、やや大きめ）
      if (cameraInfoText) {
        ctx.font = `bold ${largeFontSize}px "Roboto", "Segoe UI", -apple-system, sans-serif`; // 太字フォントを使用
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.fillText(cameraInfoText, totalWidth / 2, startY);
        startY += lineHeight * 1.2; // 間隔の調整
      } // 詳細情報（焦点距離 / F値 / シャッター速度 / ISO）を描画（中サイズフォント）
      if (detailsInfoText) {
        ctx.font = `${mediumFontSize}px "Roboto", "Segoe UI", -apple-system, sans-serif`; // より細身のフォントを使用
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.fillText(detailsInfoText, totalWidth / 2, startY);
        // 固定行間で調整
        startY += lineHeight * 1.2;
      }

      // その他の情報を描画（左揃え、通常サイズ）
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
      }

      // 生成した画像のURLを取得
      const dataURL = canvas.toDataURL(image.type || 'image/jpeg');
      resolve(dataURL);
    };

    img.onerror = () => {
      reject('画像の読み込みに失敗しました');
    };

    img.src = image.src;
  });
};

/**
 * ファイルを処理して画像情報を取得する
 * @param {File} file - 画像ファイル
 * @returns {Promise<Object>} - 画像情報
 */
export const processImageFile = file => {
  return new Promise((resolve, reject) => {
    if (!file.type.match('image.*')) {
      reject('画像ファイルを選択してください');
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      resolve({
        src: e.target.result,
        name: file.name,
        type: file.type,
        size: Math.round(file.size / 1024) + ' KB',
        originalFile: file,
      });
    };

    reader.onerror = () => {
      reject('ファイルの読み込みに失敗しました');
    };

    reader.readAsDataURL(file);
  });
};
