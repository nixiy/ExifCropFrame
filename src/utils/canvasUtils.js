/**
 * キャンバスからDataURLを生成する関数
 * @param {CanvasRenderingContext2D} ctx - キャンバスコンテキスト
 * @param {HTMLCanvasElement} canvas - キャンバス要素
 * @returns {Promise<string>} - 生成されたDataURL
 */
export function generateDataURL(ctx, canvas) {
  return new Promise((resolve, reject) => {
    try {
      if (canvas.width <= 0 || canvas.height <= 0) {
        throw new Error('キャンバスのサイズが無効です');
      }

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const hasData = imageData.data.some(val => val !== 0);
      if (!hasData) {
        console.warn('キャンバスに画像データがありません');
      }

      // 最初にPNG形式を試し、失敗したらJPEG形式を試す
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
        throw new Error('不正なDataURLが生成されました');
      }

      resolve(dataURL);
    } catch (error) {
      console.error('DataURL生成エラー:', error);
      reject(`画像の生成に失敗しました: ${error.message}`);
    }
  });
}
