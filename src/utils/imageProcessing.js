import { generateDataURL } from './canvasUtils';
import { getCameraInfoText, getDetailsInfoText } from './textUtils';
import { processCropInfo, getRotatedCroppedImage } from './cropUtils';

/**
 * 画像にテキストを埋め込む関数
 * @param {Object} options - オプション
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
  addFrame,
  rotation,
}) => {
  return new Promise((resolve, reject) => {
    if (!image || !exifData || !canvas) {
      reject('必要なパラメータがありません');
      return;
    }

    // 選択されたタグをフィルタリング
    const selectedTagKeys = Object.entries(selectedTags)
      .filter(([, isSelected]) => isSelected)
      .map(([key]) => key);

    if (!selectedTagKeys.length) {
      reject('表示するExif情報が選択されていません');
      return;
    }
    const img = new Image();
    img.onload = async () => {
      try {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        // クロップ情報の処理
        const { cropWidth, cropHeight, offsetX, offsetY } = processCropInfo(img, cropInfo);

        // 回転・クロップ済みのベース画像を取得
        const baseImageSrc = await getRotatedCroppedImage(image.src, { x: offsetX, y: offsetY, width: cropWidth, height: cropHeight }, rotation);
        const baseImage = new Image();
        baseImage.src = baseImageSrc;
        await new Promise(resolve => { baseImage.onload = resolve; });

        if (!addFrame) {
          // フレームなしの場合、回転・クロップ済みの画像をそのまま最終キャンバスに描画
          canvas.width = baseImage.width;
          canvas.height = baseImage.height;
          ctx.drawImage(baseImage, 0, 0);

          // データURLを生成して返す
          const dataURL = await generateDataURL(ctx, canvas);
          resolve(dataURL);
          return;
        }

        // フレームありの場合の処理
        const cameraInfoText = getCameraInfoText(exifData, selectedTagKeys);
        const detailsInfoText = getDetailsInfoText(exifData, selectedTagKeys);

        // レイアウト設定の計算
        const layout = calculateLayout(baseImage.width, borderSize, !!cameraInfoText, !!detailsInfoText);

        // キャンバスサイズの設定
        const totalWidth = baseImage.width + layout.borderWidth * 2;
        const totalHeight = baseImage.height + layout.borderWidth * 2 + layout.exifAreaHeight;
        canvas.width = totalWidth;
        canvas.height = totalHeight;

        // 背景を描画
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, totalWidth, totalHeight);

        // 画像を描画
        ctx.drawImage(
          baseImage,
          0,
          0,
          baseImage.width,
          baseImage.height,
          layout.borderWidth,
          layout.borderWidth,
          baseImage.width,
          baseImage.height
        );

        // Exif情報エリアの背景を描画
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, layout.borderWidth + baseImage.height, totalWidth, layout.exifAreaHeight);

        // テキストの配置を計算
        const actualTextHeight = layout.lineHeight * layout.totalLines;
        const verticalCenterOffset = Math.max(0, (layout.exifAreaHeight - actualTextHeight) / 2);
        let startY = layout.borderWidth + baseImage.height + verticalCenterOffset + layout.lineHeight * 0.8;

        // テキストを描画
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
        ctx.textAlign = 'center';

        if (cameraInfoText) {
          ctx.font = `bold ${layout.largeFontSize}px "Roboto", "Segoe UI", -apple-system, sans-serif`;
          ctx.fillStyle = textColor;
          ctx.fillText(cameraInfoText, totalWidth / 2, startY);
          startY += layout.lineHeight * 1.2;
        }

        if (detailsInfoText) {
          ctx.font = `${layout.mediumFontSize}px "Roboto", "Segoe UI", -apple-system, sans-serif`;
          ctx.fillStyle = textColor;
          ctx.fillText(detailsInfoText, totalWidth / 2, startY);
        }

        // データURLを生成して返す
        const dataURL = await generateDataURL(ctx, canvas);
        resolve(dataURL);
      } catch (error) {
        console.error('画像処理エラー:', error);
        reject(`画像処理に失敗しました: ${error.message}`);
      }
    };

    img.onerror = () => reject('画像の読み込みに失敗しました');
    img.src = image.src;
  });
};

/**
 * レイアウト設定を計算する内部関数
 */
function calculateLayout(imageWidth, borderSize, hasCameraInfo, hasDetailsInfo) {
  const borderMultiplier = [0.5, 1, 2, 3, 4][borderSize - 1] || 1;
  const borderWidth = Math.max(10, Math.floor(imageWidth / 100) * borderMultiplier);
  const baseFontSize = Math.max(12, Math.floor(imageWidth / 50));
  const largeFontSize = Math.floor(baseFontSize * 1.0);
  const mediumFontSize = Math.floor(baseFontSize * 0.8);
  const lineHeight = baseFontSize * 1.5;
  const totalLines = (hasCameraInfo ? 1 : 0) + (hasDetailsInfo ? 1 : 0);

  const padding = Math.max(20, Math.min(30, borderWidth * 0.5));
  const requiredTextHeight = lineHeight * (totalLines + 0.7) + padding;
  const minExifAreaHeight = Math.max(120, borderWidth * 1.5);
  const exifAreaHeight = Math.max(minExifAreaHeight, requiredTextHeight);

  return {
    borderWidth,
    baseFontSize,
    largeFontSize,
    mediumFontSize,
    lineHeight,
    totalLines,
    exifAreaHeight
  };
}

/**
 * プレビュー用の縮小画像を生成する
 * @param {string} src - 元の画像のDataURL
 * @param {File} file - 元のファイルオブジェクト
 * @returns {Promise<Object>} - 画像情報
 */
function createPreviewImage(src, file) {
  return new Promise((resolve, reject) => {
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
        src: src,
        previewSrc,
        name: file.name,
        type: file.type,
        size: Math.round(file.size / 1024) + ' KB',
        originalFile: file,
      });
    };

    img.onerror = reject;
    img.src = src;
  });
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
      createPreviewImage(originalSrc, file)
        .then(imageInfo => resolve(imageInfo))
        .catch(() => {
          // 画像の読み込みに失敗した場合はプレビューなしで返す
          resolve({
            src: originalSrc,
            previewSrc: originalSrc,
            name: file.name,
            type: file.type,
            size: Math.round(file.size / 1024) + ' KB',
            originalFile: file,
          });
        });
    };

    reader.onerror = () => reject('ファイルの読み込みに失敗しました');
    reader.readAsDataURL(file);
  });
};
