import React from 'react';
import DownloadButton from '../atoms/DownloadButton';

/**
 * 埋め込み画像プレビューコンポーネント
 * @param {Object} props - props
 * @param {string} props.embeddedImage - 埋め込み画像のDataURL
 * @param {Function} props.onDownload - ダウンロードボタンハンドラ
 * @param {boolean} props.isDownloadProcessing - ダウンロード画像生成中フラグ
 * @param {number} props.downloadProgress - ダウンロード進捗（%）
 * @returns {JSX.Element} - 埋め込み画像プレビューコンポーネント
 */
const EmbeddedImagePreview = ({
  embeddedImage,
  onDownload,
  isDownloadProcessing,
  downloadProgress,
}) => {
  if (!embeddedImage) return null;
  return (
    <div className="embedded-image-preview">
      <div style={{ position: 'relative' }}>
        <img src={embeddedImage} alt="Exif情報付き画像" />
        <DownloadButton onClick={onDownload} position="top-right" />
        {/* ダウンロード画像生成中の進捗表示 */}
        {isDownloadProcessing && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.55)',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 'bold',
              zIndex: 30,
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              letterSpacing: '0.05em',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            <div>DL用画像生成中...</div>
            {typeof downloadProgress === 'number' && (
              <div style={{ fontSize: '1.3rem', marginTop: 12 }}>{downloadProgress}%</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmbeddedImagePreview;
