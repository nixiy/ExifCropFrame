import React from 'react';
import CloseButton from '../atoms/CloseButton';

/**
 * 画像プレビューコンポーネント
 * @param {Object} props - props
 * @param {Object} props.image - 画像情報
 * @param {Function} props.onClear - クリアボタンハンドラ
 * @param {Function} props.onEmbedClick - 埋め込みボタンハンドラ
 * @param {boolean} props.showEmbedOptions - 埋め込みオプション表示状態
 * @param {boolean} props.hasExifData - EXIF情報があるかどうか
 * @returns {JSX.Element} - 画像プレビューコンポーネント
 */
const ImagePreviewPanel = ({ image, onClear }) => {
  if (!image) return null;
  return (
    <div className="image-preview">
      <div style={{ position: 'relative' }}>
        <img src={image.src} alt={image.name} />
        <CloseButton onClick={onClear} position="top-right" />
      </div>{' '}
    </div>
  );
};

export default ImagePreviewPanel;
