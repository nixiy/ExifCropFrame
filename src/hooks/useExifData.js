import { useState, useEffect } from 'react';
import { getExifData } from '../utils/exifUtils';
import { DEFAULT_SELECTED_TAGS } from '../utils/constants';

/**
 * EXIF情報を扱うためのカスタムフック
 * @returns {Object} - EXIF情報と関連する状態・関数
 */
export const useExifData = () => {
  const [exifData, setExifData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedExifTags, setSelectedExifTags] = useState({});

  /**
   * ファイルからEXIF情報を取得する
   * @param {File} file - 画像ファイル
   */
  const fetchExifData = async file => {
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
   * タグの選択状態を更新する
   * @param {string} tag - タグ名
   * @param {boolean} isSelected - 選択状態
   */
  const updateTagSelection = (tag, isSelected) => {
    setSelectedExifTags(prev => ({
      ...prev,
      [tag]: isSelected,
    }));
  };

  /**
   * すべてのデータをリセットする
   */
  const resetExifData = () => {
    setExifData(null);
    setSelectedExifTags({});
  };

  return {
    exifData,
    isProcessing,
    selectedExifTags,
    fetchExifData,
    updateTagSelection,
    resetExifData,
  };
};
