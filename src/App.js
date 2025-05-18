import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dropRef = useRef(null);

  // ドラッグイベントのハンドラー
  const handleDragEnter = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
      e.dataTransfer.clearData();
    }
  };

  // ファイル選択のハンドラー
  const handleFileSelect = e => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };
  // ファイルの処理
  const processFile = file => {
    // 画像ファイルのみを受け付ける
    if (!file.type.match('image.*')) {
      alert('画像ファイルを選択してください');
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      setImage({
        src: e.target.result,
        name: file.name,
        type: file.type,
        size: Math.round(file.size / 1024) + ' KB',
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="container">
      <h1>ExifCropFrame</h1>
      <div
        ref={dropRef}
        className={`drop-area ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {!image ? (
          <>
            <p>画像をここにドラッグ＆ドロップしてください</p>
            <p>または</p>
            <label className="file-input-label">
              画像を選択
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </label>
          </>
        ) : (
          <div className="image-preview">
            <img src={image.src} alt={image.name} />
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
            <button className="clear-button" onClick={() => setImage(null)}>
              クリア
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
