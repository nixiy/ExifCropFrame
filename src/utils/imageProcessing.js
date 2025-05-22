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
    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const selectedTagKeys = Object.entries(selectedTags)
        .filter(([, isSelected]) => isSelected)
        .map(([key]) => key);
      if (!selectedTagKeys.length) {
        reject('表示するExif情報が選択されていません');
        return;
      }
      const cameraInfoText = getCameraInfoText(exifData, selectedTagKeys);
      const detailsInfoText = getDetailsInfoText(exifData, selectedTagKeys);
      let cropWidth = img.width;
      let cropHeight = img.height;
      let offsetX = 0;
      let offsetY = 0;
      if (cropInfo?.pixelCrop) {
        const { pixelCrop } = cropInfo;
        cropWidth = Math.max(1, Math.min(pixelCrop.width, img.width));
        cropHeight = Math.max(1, Math.min(pixelCrop.height, img.height));
        offsetX = Math.max(0, Math.min(pixelCrop.x, img.width - cropWidth));
        offsetY = Math.max(0, Math.min(pixelCrop.y, img.height - cropHeight));
      } else if (cropInfo?.crop) {
        const { crop } = cropInfo;
        const refWidth = cropInfo.imageRef.naturalWidth || cropInfo.imageRef.width;
        const refHeight = cropInfo.imageRef.naturalHeight || cropInfo.imageRef.height;
        const scaleX = img.width / refWidth;
        const scaleY = img.height / refHeight;
        cropWidth = Math.round(((crop.width * refWidth) / 100) * scaleX);
        cropHeight = Math.round(((crop.height * refHeight) / 100) * scaleY);
        offsetX = Math.round(((crop.x * refWidth) / 100) * scaleX);
        offsetY = Math.round(((crop.y * refHeight) / 100) * scaleY);
      }
      if (cropWidth <= 0 || cropHeight <= 0) {
        cropWidth = Math.max(1, cropWidth || img.width * 0.8);
        cropHeight = Math.max(1, cropHeight || img.height * 0.8);
      }
      const borderMultiplier = [0.5, 1, 2, 3, 4][borderSize - 1] || 1;
      const borderWidth = Math.max(10, Math.floor(cropWidth / 100) * borderMultiplier);
      const baseFontSize = Math.max(12, Math.floor(cropWidth / 50));
      const largeFontSize = Math.floor(baseFontSize * 1.0);
      const mediumFontSize = Math.floor(baseFontSize * 0.8);
      const lineHeight = baseFontSize * 1.5;
      const totalLines = (cameraInfoText ? 1 : 0) + (detailsInfoText ? 1 : 0);
      const padding = Math.max(20, Math.min(30, borderWidth * 0.5));
      const requiredTextHeight = lineHeight * (totalLines + 0.7) + padding;
      const minExifAreaHeight = Math.max(120, borderWidth * 1.5);
      const exifAreaHeight = Math.max(minExifAreaHeight, requiredTextHeight);
      const totalWidth = cropWidth + borderWidth * 2;
      const totalHeight = cropHeight + borderWidth * 2 + exifAreaHeight;
      canvas.width = totalWidth;
      canvas.height = totalHeight;
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, totalWidth, totalHeight);
      try {
        if (cropWidth <= 0 || cropHeight <= 0) throw new Error('クロップサイズが無効です');
        if (
          offsetX < 0 ||
          offsetY < 0 ||
          offsetX + cropWidth > img.width ||
          offsetY + cropHeight > img.height
        ) {
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
          cropHeight,
          borderWidth,
          borderWidth,
          cropWidth,
          cropHeight
        );
      } catch (error) {
        console.error('画像描画エラー:', error);
        throw new Error(`画像のクロップに失敗しました: ${error.message}`);
      }
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, borderWidth + cropHeight, totalWidth, exifAreaHeight);
      const actualTextHeight = lineHeight * totalLines;
      const verticalCenterOffset = Math.max(0, (exifAreaHeight - actualTextHeight) / 2);
      let startY = borderWidth + cropHeight + verticalCenterOffset + lineHeight * 0.8;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 0;
      if (cameraInfoText) {
        ctx.font = `bold ${largeFontSize}px "Roboto", "Segoe UI", -apple-system, sans-serif`;
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.fillText(cameraInfoText, totalWidth / 2, startY);
        startY += lineHeight * 1.2;
      }
      if (detailsInfoText) {
        ctx.font = `${mediumFontSize}px "Roboto", "Segoe UI", -apple-system, sans-serif`;
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.fillText(detailsInfoText, totalWidth / 2, startY);
        startY += lineHeight * 1.2;
      }
      finalizeImage(); // ロゴ処理を削除し、直接finalizeImageを呼び出す

      // 画像のDataURLを生成して返す関数
      function finalizeImage() {
        try {
          if (canvas.width <= 0 || canvas.height <= 0)
            throw new Error('キャンバスのサイズが無効です');
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const hasData = imageData.data.some(val => val !== 0);
          if (!hasData) {
            console.warn('キャンバスに画像データがありません');
          }

          let dataURL;
          try {
            dataURL = canvas.toDataURL('image/png');
            if (dataURL === 'data:,' || !dataURL.startsWith('data:image/')) {
              dataURL = canvas.toDataURL('image/jpeg', 0.95);
            }
          } catch (e) {
            dataURL = canvas.toDataURL('image/jpeg', 0.9);
          }

          if (dataURL === 'data:,' || !dataURL.startsWith('data:image/')) {
            throw new Error('不正なデータURLが生成されました');
          }

          resolve(dataURL);
        } catch (error) {
          console.error('データURL生成エラー:', error);
          reject(`画像の生成に失敗しました: ${error.message}`);
        }
      }
    };
    img.onerror = () => reject('画像の読み込みに失敗しました');
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
