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
      className={`drop-area ${isDragging ? 'dragging' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {!hasImage ? (
        <>
          <p>画像をここにドラッグ＆ドロップしてください</p>
          <p>または</p>
          <FileInput onFileSelect={onFileSelect} />
        </>
      ) : (
        children
      )}
    </div>
  );
};

export default DropZone;
