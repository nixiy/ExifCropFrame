import React from 'react';
import DownloadButton from '../atoms/DownloadButton';

/**
 * 埋め込み画像プレビューコンポーネント
 * @param {Object} props - props
 * @param {string} props.embeddedImage - 埋め込み画像のDataURL
 * @param {Function} props.onDownload - ダウンロードボタンハンドラ
 * @returns {JSX.Element} - 埋め込み画像プレビューコンポーネント
 */
const EmbeddedImagePreview = ({ embeddedImage, onDownload }) => {
  if (!embeddedImage) return null;
  return (
    <div className="embedded-image-preview">
      <div style={{ position: 'relative' }}>
        <img src={embeddedImage} alt="Exif情報付き画像" />
        <DownloadButton onClick={onDownload} position="top-right" />
      </div>
    </div>
  );
};

export default EmbeddedImagePreview;
