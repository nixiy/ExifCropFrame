import React from 'react';
import { JAPANESE_TAG_NAMES } from '../../utils/constants';

/**
 * EXIF情報表示パネル
 * @param {Object} props - props
 * @param {Object} props.exifData - EXIF情報
 * @param {boolean} props.isProcessing - 処理中かどうか
 * @returns {JSX.Element} - EXIF情報表示パネル
 */
const ExifInfoPanel = ({ exifData, isProcessing }) => {
  if (isProcessing) {
    return (
      <div className="exif-info">
        <h3>Exif情報を読み込み中...</h3>
        <p>しばらくお待ちください...</p>
      </div>
    );
  }

  if (!exifData || Object.keys(exifData).length === 0) {
    return (
      <div className="exif-info">
        <h3>Exif情報</h3>
        <p>Exif情報が見つかりませんでした</p>
      </div>
    );
  }

  return (
    <div className="exif-info">
      <h3>Exif情報</h3>
      {Object.entries(exifData).map(([key, value]) => {
        // タグ名を日本語に変換
        const displayName = JAPANESE_TAG_NAMES[key] || key;

        return (
          <p key={key}>
            <strong>{displayName}:</strong> {value.toString()}
          </p>
        );
      })}
    </div>
  );
};

export default ExifInfoPanel;
