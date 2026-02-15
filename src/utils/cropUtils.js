import { generateDataURL } from './canvasUtils';

/**
 * クロップ情報を処理する関数
 * @param {Object} img - 画像オブジェクト
 * @param {Object} cropInfo - クロップ情報
 * @returns {Object} - 処理されたクロップ情報
 */
export function processCropInfo(img, cropInfo) {
    let cropWidth = img.width;
    let cropHeight = img.height;
    let offsetX = 0;
    let offsetY = 0;

    if (cropInfo?.pixelCrop) {
        const { pixelCrop } = cropInfo;
        cropWidth = pixelCrop.width;
        cropHeight = pixelCrop.height;
        offsetX = pixelCrop.x;
        offsetY = pixelCrop.y;
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

    // クロップサイズが無効な場合のフォールバック
    if (cropWidth <= 0 || cropHeight <= 0) {
        cropWidth = Math.max(1, cropWidth || img.width * 0.8);
        cropHeight = Math.max(1, cropHeight || img.height * 0.8);
    }

    // クロップが画像の範囲外になる場合の修正
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

    return { cropWidth, cropHeight, offsetX, offsetY };
}

/**
 * 画像を回転させ、指定されたクロップ領域を切り出す関数
 * @param {string} imageSrc - 元の画像のDataURL
 * @param {Object} pixelCrop - クロップ情報 (x, y, width, height)
 * @param {number} rotation - 回転角度 (度)
 * @returns {Promise<string>} - 回転・クロップ済みの画像のDataURL
 */
export async function getRotatedCroppedImage(imageSrc, pixelCrop, rotation) {
    const image = new Image();
    image.src = imageSrc;

    await new Promise(resolve => {
        image.onload = resolve;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const { width: imageWidth, height: imageHeight } = image;
    const { x, y, width, height } = pixelCrop;

    // 回転後のキャンバスサイズを計算
    const radians = (rotation * Math.PI) / 180;
    const cos = Math.abs(Math.cos(radians));
    const sin = Math.abs(Math.sin(radians));
    const rotatedWidth = imageWidth * cos + imageHeight * sin;
    const rotatedHeight = imageWidth * sin + imageHeight * cos;

    // 一時キャンバスに画像を回転させて描画
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = rotatedWidth;
    tempCanvas.height = rotatedHeight;

    tempCtx.translate(rotatedWidth / 2, rotatedHeight / 2);
    tempCtx.rotate(radians);
    tempCtx.drawImage(image, -imageWidth / 2, -imageHeight / 2);

    // 最終キャンバスにクロップ領域を切り出して描画
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(
        tempCanvas,
        x,
        y,
        width,
        height,
        0,
        0,
        width,
        height
    );

    return generateDataURL(ctx, canvas);
}
