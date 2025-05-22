import React from 'react';
import FileInput from '../molecules/FileInput';

/**
 * ドロップゾーンコンポーネント
 * @param {Object} props - props
 * @param {boolean} props.isDragging - ドラッグ状態
 * @param {Function} props.onDrop - ドロップハンドラ
 * @param {Function} props.onFileSelect - ファイル選択ハンドラ
 * @param {boolean} props.hasImage - 画像が選択されているかどうか
 * @returns {JSX.Element} - ドロップゾーンコンポーネント
 */
const DropZone = ({ isDragging, onDrop, onFileSelect, hasImage, children }) => {
  const handleDragEnter = e => {
    e.preventDefault();
    e.stopPropagation();
    onDrop({ isDragging: true });
  };

  const handleDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();
    onDrop({ isDragging: false });
  };

  const handleDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      onDrop({ isDragging: true });
    }
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    onDrop({ isDragging: false });

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileSelect(file);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div
      className={`drop-area${isDragging ? ' dragging' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {' '}
      {!hasImage ? (
        <>
          <div className="drop-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <p className="drop-title">画像をここにドラッグ＆ドロップ</p>
          <p className="drop-subtitle">または</p>
          <FileInput onFileSelect={onFileSelect} />
          <p className="drop-support">対応形式: JPG, PNG, GIF など</p>
        </>
      ) : (
        children
      )}
    </div>
  );
};

export default DropZone;
