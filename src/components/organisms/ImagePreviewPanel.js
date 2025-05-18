import React from 'react';
import Button from '../atoms/Button';
import CloseButton from '../atoms/CloseButton';

/**
 * 画像情報表示コンポーネント
 * @param {Object} props - props
 * @param {Object} props.image - 画像情報
 * @returns {JSX.Element} - 画像情報コンポーネント
 */
const ImageInfo = ({ image }) => {
  if (!image) return null;

  return (
    <div className="image-info">
      <h3>画像情報</h3>
      <p>
        <strong>ファイル名:</strong> {image.name}
      </p>
      <p>
        <strong>タイプ:</strong> {image.type}
      </p>
      <p>
        <strong>サイズ:</strong> {image.size}
      </p>
    </div>
  );
};

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
const ImagePreviewPanel = ({ image, onClear, onEmbedClick, showEmbedOptions, hasExifData }) => {
  if (!image) return null;
  return (
    <div className="image-preview">
      <div style={{ position: 'relative' }}>
        <img src={image.src} alt={image.name} />
        <CloseButton onClick={onClear} position="top-right" />
      </div>
      <div className="button-container">
        <Button type="danger" onClick={onClear}>
          クリア
        </Button>

        {hasExifData && !showEmbedOptions && (
          <Button type="success" onClick={onEmbedClick}>
            Exif情報を画像に埋め込む
          </Button>
        )}
      </div>
    </div>
  );
};

export default ImagePreviewPanel;
