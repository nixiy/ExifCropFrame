import { useState, useRef } from 'react';
import { embedTextInImage } from '../utils/imageProcessing';
import { DEFAULT_COLORS } from '../utils/constants';

/**
 * 画像処理に関するカスタムフック
 * @returns {Object} - 画像処理に関する状態と関数
 */
export const useImageProcessor = () => {
  const [image, setImage] = useState(null);
  const [embeddedImage, setEmbeddedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);
  // 埋め込みオプション（初期値はconstantsから取得）
  const [textColor, setTextColor] = useState(DEFAULT_COLORS.TEXT);
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_COLORS.BACKGROUND);
  const [borderSize, setBorderSize] = useState(2);

  /**
   * 画像にEXIF情報を埋め込む（プレビュー用 or ダウンロード用を切り替え）
   * @param {Object} exifData
   * @param {Object} selectedTags
   * @param {Object} cropInfo
   * @param {Object} options - { forDownload: boolean }
   */
  const processImage = async (exifData, selectedTags, cropInfo, options = {}) => {
    if (!image || !exifData || !canvasRef.current) return;
    setIsProcessing(true);
    try {
      const selectedTagKeys = Object.entries(selectedTags)
        .filter(([, isSelected]) => isSelected)
        .map(([key]) => key);
      if (selectedTagKeys.length === 0) {
        alert('表示するExif情報が選択されていません');
        return;
      }
      // プレビュー用は縮小画像、ダウンロード時は元画像
      const useImage =
        options.forDownload && image.originalFile
          ? await getOriginalImageInfo(image.originalFile)
          : { ...image, src: image.previewSrc || image.src };
      const dataURL = await embedTextInImage({
        image: useImage,
        exifData,
        selectedTags,
        textColor,
        backgroundColor,
        borderSize,
        cropInfo,
        canvas: canvasRef.current,
      });
      setEmbeddedImage(dataURL);
      return dataURL;
    } catch (error) {
      console.error('画像処理中にエラーが発生しました:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // 元画像の情報をDataURL化して返す（ダウンロード時のみ）
  const getOriginalImageInfo = file => {
    return new Promise((resolve, reject) => {
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
      reader.onerror = () => reject('元画像の読み込みに失敗しました');
      reader.readAsDataURL(file);
    });
  };

  // pixelCropを元画像サイズに変換する
  const scalePixelCropToOriginal = async (pixelCrop, previewImg, originalImg) => {
    if (!pixelCrop || !previewImg || !originalImg) return pixelCrop;
    const scaleX = originalImg.naturalWidth / previewImg.naturalWidth;
    const scaleY = originalImg.naturalHeight / previewImg.naturalHeight;
    return {
      x: Math.round(pixelCrop.x * scaleX),
      y: Math.round(pixelCrop.y * scaleY),
      width: Math.round(pixelCrop.width * scaleX),
      height: Math.round(pixelCrop.height * scaleY),
    };
  };

  // 元画像のImage要素を生成
  const loadImageElement = src => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  /**
   * 生成された画像をダウンロードする（元画像で再生成）
   */
  const downloadImage = async (exifData, selectedTags, cropInfo) => {
    if (!image) return;
    let newCropInfo = cropInfo;
    // pixelCropがある場合は元画像サイズに変換
    if (cropInfo && cropInfo.pixelCrop && image.previewSrc && image.originalFile) {
      const previewImg = await loadImageElement(image.previewSrc);
      const originalImgInfo = await getOriginalImageInfo(image.originalFile);
      const originalImg = await loadImageElement(originalImgInfo.src);
      const scaledPixelCrop = await scalePixelCropToOriginal(
        cropInfo.pixelCrop,
        previewImg,
        originalImg
      );
      newCropInfo = {
        ...cropInfo,
        pixelCrop: scaledPixelCrop,
        imageRef: originalImg,
      };
    }
    // ダウンロード用に高解像度で再生成
    const dataURL = await processImage(exifData, selectedTags, newCropInfo, { forDownload: true });
    if (!dataURL) return;
    const link = document.createElement('a');
    link.href = dataURL;
    const fileName =
      image.name.replace(/\.[^.]+$/, '') + '-exif.' + (image.type.split('/')[1] || 'jpg');
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * すべてのデータをリセットする
   */
  const resetImage = () => {
    setImage(null);
    setEmbeddedImage(null);
  };
  return {
    image,
    setImage,
    embeddedImage,
    isProcessing,
    canvasRef,
    textColor,
    setTextColor,
    backgroundColor,
    setBackgroundColor,
    borderSize,
    setBorderSize,
    processImage,
    downloadImage,
    resetImage,
  };
};
