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
   * 画像にEXIF情報を埋め込む
   * @param {Object} exifData - EXIF情報
   * @param {Object} selectedTags - 選択されたタグ
   * @param {Object} cropInfo - クロップ情報
   */ const processImage = async (exifData, selectedTags, cropInfo) => {
    if (!image || !exifData || !canvasRef.current) return;

    setIsProcessing(true);

    try {
      // 選択されたタグのチェック
      const selectedTagKeys = Object.entries(selectedTags)
        .filter(([, isSelected]) => isSelected)
        .map(([key]) => key);

      if (selectedTagKeys.length === 0) {
        alert('表示するExif情報が選択されていません');
        return;
      }

      const dataURL = await embedTextInImage({
        image,
        exifData,
        selectedTags,
        textColor,
        backgroundColor,
        borderSize,
        cropInfo,
        canvas: canvasRef.current,
      });

      setEmbeddedImage(dataURL);
    } catch (error) {
      console.error('画像処理中にエラーが発生しました:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * 生成された画像をダウンロードする
   */
  const downloadImage = () => {
    if (!embeddedImage || !image) return;

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
