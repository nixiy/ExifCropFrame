/**
 * 画像にテキストを埋め込む関数
 * @param {Object} options - オプション
 * @param {Object} options.image - 画像オブジェクト
 * @param {Object} options.exifData - EXIF情報
 * @param {Object} options.selectedTags - 選択されたタグ
 * @param {string} options.textColor - テキスト色
 * @param {string} options.backgroundColor - 背景色
 * @param {number} options.borderSize - 枠線サイズ（1-5）
 * @param {string} options.aspectRatio - アスペクト比（'original', '16:9', '21:9', '4:3', '3:2', '1:1'）
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
  aspectRatio,
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
        .filter(([, isSelected]) => isSelected)
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
        : ''; // スラッシュで区切ってコンパクトに表示、スペースを調整して視認性を向上
      const details = [focalLength, fNumber, exposureTime, iso].filter(Boolean);
      if (details.length > 0) {
        detailsInfoText = details.join(' / ');
      }

      // アスペクト比に基づいてクロップサイズを計算
      let cropWidth = img.width;
      let cropHeight = img.height;
      let offsetX = 0;
      let offsetY = 0;

      // 選択されたアスペクト比に基づいて画像をクロップ
      if (aspectRatio !== 'original') {
        const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);
        const targetRatio = widthRatio / heightRatio;

        const currentRatio = img.width / img.height;

        if (targetRatio > currentRatio) {
          // ターゲットアスペクト比が現在より横長の場合、高さを調整
          cropHeight = img.width / targetRatio;
          offsetY = (img.height - cropHeight) / 2;
        } else {
          // ターゲットアスペクト比が現在より縦長の場合、幅を調整
          cropWidth = img.height * targetRatio;
          offsetX = (img.width - cropWidth) / 2;
        }
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
      ctx.fillRect(0, 0, totalWidth, totalHeight); // 画像を描画（白枠の分だけオフセット）

      // クロップした画像を描画
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
        ctx.font = `${mediumFontSize}px "Roboto", "Segoe UI", -apple-system, sans-serif`; // より細身のフォントを使用
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.fillText(detailsInfoText, totalWidth / 2, startY);
        // 固定行間で調整
        startY += lineHeight * 1.2;
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
