/**
 * 画像にテキストを埋め込む関数
 * @param {Object} options - オプション
 * @param {Object} options.image - 画像オブジェクト
 * @param {Object} options.exifData - EXIF情報
 * @param {Object} options.selectedTags - 選択されたタグ
 * @param {string} options.textColor - テキスト色
 * @param {string} options.backgroundColor - 背景色
 * @param {number} options.borderSize - 枠線サイズ（1-5）
 * @param {Object} options.cropInfo - クロップ情報（カスタムクロップ用）
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
  cropInfo,
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
      // willReadFrequently: true を指定してパフォーマンス警告を解消
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      // テキスト用の設定
      const selectedTagKeys = Object.entries(selectedTags)
        .filter(([, isSelected]) => isSelected)
        .map(([key]) => key);

      if (selectedTagKeys.length === 0) {
        reject('表示するExif情報が選択されていません');
        return;
      }

      // --- テキスト生成を関数に分離 ---
      const cameraInfoText = getCameraInfoText(exifData, selectedTagKeys);
      const detailsInfoText = getDetailsInfoText(exifData, selectedTagKeys);

      // アスペクト比に基づいてクロップサイズを計算
      let cropWidth = img.width;
      let cropHeight = img.height;
      let offsetX = 0;
      let offsetY = 0; // カスタムクロップ情報が指定されている場合はそれを使用
      if (cropInfo && cropInfo.pixelCrop) {
        // ピクセル単位のクロップ情報を優先
        const { pixelCrop } = cropInfo;
        // 画像サイズを超えないように制限
        cropWidth = Math.max(1, Math.min(pixelCrop.width, img.width));
        cropHeight = Math.max(1, Math.min(pixelCrop.height, img.height));
        offsetX = Math.max(0, Math.min(pixelCrop.x, img.width - cropWidth));
        offsetY = Math.max(0, Math.min(pixelCrop.y, img.height - cropHeight));
      } else if (cropInfo && cropInfo.crop) {
        // 従来のパーセント形式（後方互換性維持）
        const { crop } = cropInfo;

        // naturalWidthが利用可能な場合はそちらを使う
        const refWidth = cropInfo.imageRef.naturalWidth || cropInfo.imageRef.width;
        const refHeight = cropInfo.imageRef.naturalHeight || cropInfo.imageRef.height;
        const scaleX = img.width / refWidth;
        const scaleY = img.height / refHeight;
        cropWidth = Math.round(((crop.width * refWidth) / 100) * scaleX);
        cropHeight = Math.round(((crop.height * refHeight) / 100) * scaleY);
        offsetX = Math.round(((crop.x * refWidth) / 100) * scaleX);
        offsetY = Math.round(((crop.y * refHeight) / 100) * scaleY);
      }

      // 値の検証と調整
      if (cropWidth <= 0 || cropHeight <= 0) {
        console.warn('クロップサイズが無効です。デフォルト値を使用します。');
        cropWidth = Math.max(1, cropWidth || img.width * 0.8);
        cropHeight = Math.max(1, cropHeight || img.height * 0.8);
      }

      // 白い枠のサイズ（設定値に基づいて調整）
      const borderMultiplier = [0.5, 1, 2, 3, 4][borderSize - 1] || 1;
      const borderWidth = Math.max(10, Math.floor(cropWidth / 100) * borderMultiplier);

      // フォントサイズを画像サイズに合わせて固定設定（枠サイズによる動的調整なし）
      const baseFontSize = Math.max(12, Math.floor(cropWidth / 50));
      const largeFontSize = Math.floor(baseFontSize * 1.0); // カメラ情報用のフォント
      const mediumFontSize = Math.floor(baseFontSize * 0.8); // テクニカル情報用のフォント
      const lineHeight = baseFontSize * 1.5; // 行間の調整      // 下部のExif情報表示領域の高さを計算（カメラ情報 + テクニカル情報）
      const headerLines = (cameraInfoText ? 1 : 0) + (detailsInfoText ? 1 : 0);
      const totalLines = headerLines; // 実際に必要なテキスト表示エリアの高さを計算
      // パディングは枠サイズと若干の比例関係を持たせつつも、過剰にならないよう調整
      const padding = Math.max(20, Math.min(30, borderWidth * 0.5)); // パディングの上限を設定
      const requiredTextHeight = lineHeight * (totalLines + 0.7) + padding; // テキストに必要な高さ
      const minExifAreaHeight = Math.max(120, borderWidth * 1.5); // 最低高さも適度に調整
      const exifAreaHeight = Math.max(minExifAreaHeight, requiredTextHeight);

      // 新しいキャンバスのサイズを設定（白枠 + 画像 + 下部のExif領域）
      const totalWidth = cropWidth + borderWidth * 2;
      const totalHeight = cropHeight + borderWidth * 2 + exifAreaHeight;

      canvas.width = totalWidth;
      canvas.height = totalHeight; // 背景を指定された色で塗りつぶす
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, totalWidth, totalHeight); // 画像を描画（白枠の分だけオフセット）      // クロップした画像を描画
      try {
        // 値の検証
        if (cropWidth <= 0 || cropHeight <= 0) {
          throw new Error('クロップサイズが無効です');
        }

        if (
          offsetX < 0 ||
          offsetY < 0 ||
          offsetX + cropWidth > img.width ||
          offsetY + cropHeight > img.height
        ) {
          console.warn('クロップ領域が画像の範囲外です - 値を調整します');
          // クロップ領域を画像内に収める
          offsetX = Math.max(0, Math.min(offsetX, img.width - 1));
          offsetY = Math.max(0, Math.min(offsetY, img.height - 1));
          cropWidth = Math.min(cropWidth, img.width - offsetX);
          cropHeight = Math.min(cropHeight, img.height - offsetY);
        }

        ctx.drawImage(
          img,
          offsetX,
          offsetY,
          cropWidth,
          cropHeight, // ソース画像のクロップ範囲
          borderWidth,
          borderWidth,
          cropWidth,
          cropHeight // キャンバスへの描画位置とサイズ
        );
      } catch (error) {
        console.error('画像描画エラー:', error);
        throw new Error(`画像のクロップに失敗しました: ${error.message}`);
      }

      // Exif情報の背景を描画（指定された背景色で統一）
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, borderWidth + cropHeight, totalWidth, exifAreaHeight);

      // 実際のテキストの高さを考慮してより正確に中央揃え
      const actualTextHeight = lineHeight * totalLines;
      const verticalCenterOffset = Math.max(0, (exifAreaHeight - actualTextHeight) / 2);
      let startY = borderWidth + cropHeight + verticalCenterOffset + lineHeight * 0.8; // 行の高さ調整      // テキスト影は使用しない設定
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 0;

      // カメラ情報（メーカー・型番）を描画（太字フォント、やや大きめ）
      if (cameraInfoText) {
        ctx.font = `bold ${largeFontSize}px "Roboto", "Segoe UI", -apple-system, sans-serif`; // 太字フォントを使用
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.fillText(cameraInfoText, totalWidth / 2, startY);
        startY += lineHeight * 1.2; // 間隔の調整
      } // 詳細情報（焦点距離 / F値 / シャッター速度 / ISO）を描画（中サイズフォント）
      if (detailsInfoText) {
        ctx.font = `${mediumFontSize}px "Roboto", "Segoe UI", -apple-system, sans-serif`;
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.fillText(detailsInfoText, totalWidth / 2, startY);
        // 固定行間で調整
        startY += lineHeight * 1.2;
      }
      // 生成した画像のURLを取得
      try {
        // 空のキャンバスをチェック
        if (canvas.width <= 0 || canvas.height <= 0) {
          throw new Error('キャンバスのサイズが無効です');
        }

        // 画像データが正しく描画されているか確認
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const hasData = imageData.data.some(val => val !== 0);
        if (!hasData) {
          console.warn('キャンバスに画像データがありません');
        }
        // まずPNG形式で出力を試みる（より安全）
        let dataURL;
        try {
          dataURL = canvas.toDataURL('image/png');

          // PNGが失敗した場合はJPEGでも試す
          if (dataURL === 'data:,' || !dataURL.startsWith('data:image/')) {
            console.warn('PNG形式での出力に失敗しました、JPEGで試行します');
            dataURL = canvas.toDataURL('image/jpeg', 0.95);
          }
        } catch (e) {
          console.error('PNG形式での出力中にエラー:', e);
          // JPEGでフォールバック
          dataURL = canvas.toDataURL('image/jpeg', 0.9);
        }

        // データURLが正しいフォーマットであることを確認
        if (dataURL === 'data:,' || !dataURL.startsWith('data:image/')) {
          throw new Error('不正なデータURLが生成されました');
        }
        resolve(dataURL);
      } catch (error) {
        console.error('データURL生成エラー:', error);
        reject(`画像の生成に失敗しました: ${error.message}`);
      }
    };

    img.onerror = error => {
      console.error('画像読み込みエラー:', error);
      reject('画像の読み込みに失敗しました');
    };

    img.src = image.src;
  });
};

// 1行目のカメラ情報テキスト生成
function getCameraInfoText(exifData, selectedTagKeys) {
  const make = selectedTagKeys.includes('Make') ? exifData['Make'] : '';
  const model = selectedTagKeys.includes('Model') ? exifData['Model'] : '';
  const lensModel = selectedTagKeys.includes('LensModel') ? exifData['LensModel'] : '';
  let cameraText = make && model ? `${make.trim()}  ${model.trim()}` : make || model;
  if (lensModel) {
    return `${cameraText} / ${lensModel.trim()}`;
  } else {
    return cameraText;
  }
}
// 2行目の詳細情報テキスト生成
function getDetailsInfoText(exifData, selectedTagKeys) {
  const focalLength = selectedTagKeys.includes('FocalLength') ? exifData['FocalLength'] : '';
  const fNumber = selectedTagKeys.includes('FNumber') ? exifData['FNumber'] : '';
  const exposureTime = selectedTagKeys.includes('ExposureTime') ? exifData['ExposureTime'] : '';
  const iso = selectedTagKeys.includes('ISOSpeedRatings')
    ? `ISO${exifData['ISOSpeedRatings']}`
    : '';
  const details = [focalLength, fNumber, exposureTime, iso].filter(Boolean);
  return details.length > 0 ? details.join(' / ') : '';
}

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
      const originalSrc = e.target.result;
      // プレビュー用縮小画像を生成
      const img = new window.Image();
      img.onload = () => {
        // 最大幅・高さ
        const maxSize = 1000;
        let { width, height } = img;
        let scale = 1;
        if (width > maxSize || height > maxSize) {
          scale = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const previewSrc = canvas.toDataURL('image/jpeg', 0.8);
        resolve({
          src: originalSrc,
          previewSrc,
          name: file.name,
          type: file.type,
          size: Math.round(file.size / 1024) + ' KB',
          originalFile: file,
        });
      };
      img.onerror = () => {
        // 画像の読み込みに失敗した場合はプレビューなしで返す
        resolve({
          src: originalSrc,
          previewSrc: originalSrc,
          name: file.name,
          type: file.type,
          size: Math.round(file.size / 1024) + ' KB',
          originalFile: file,
        });
      };
      img.src = originalSrc;
    };

    reader.onerror = () => {
      reject('ファイルの読み込みに失敗しました');
    };

    reader.readAsDataURL(file);
  });
};
