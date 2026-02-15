import React, { createContext, useContext, useState } from 'react';
import { getExifData } from '../utils/exifUtils';
import { DEFAULT_SELECTED_TAGS } from '../utils/constants';

// コンテキストの作成
const ExifContext = createContext();

/**
 * ExifProviderコンポーネント
 * @param {Object} props - props
 * @param {React.ReactNode} props.children - 子要素
 * @returns {JSX.Element} - ExifProviderコンポーネント
 */
export const ExifProvider = ({ children }) => {
  const [exifData, setExifData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedExifTags, setSelectedExifTags] = useState({});
  const [rotation, setRotation] = useState(0);

  /**
   * ファイルからEXIF情報を取得する
   * @param {File} file - 画像ファイル
   */ const fetchExifData = async file => {
    setIsProcessing(true);
    try {
      const exif = await getExifData(file);

      setExifData(exif);

      // デフォルトで選択するタグを設定
      const tagsObj = {};

      Object.keys(exif).forEach(key => {
        tagsObj[key] = DEFAULT_SELECTED_TAGS.includes(key);
      });

      setSelectedExifTags(tagsObj);
    } catch (error) {
      console.error('EXIF情報の取得に失敗しました:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * すべてのデータをリセットする
   */
  const resetExifData = () => {
    setExifData(null);
    setSelectedExifTags({});
  };

  const value = {
    exifData,
    isProcessing,
    selectedExifTags,
    fetchExifData,
    resetExifData,
    rotation,
    setRotation,
  };

  return <ExifContext.Provider value={value}>{children}</ExifContext.Provider>;
};

/**
 * EXIF情報を取得するためのカスタムフック
 * @returns {Object} - EXIF情報と関連する状態・関数
 */
export const useExif = () => {
  const context = useContext(ExifContext);

  if (!context) {
    throw new Error('useExif must be used within an ExifProvider');
  }

  return context;
};

export default ExifContext;
