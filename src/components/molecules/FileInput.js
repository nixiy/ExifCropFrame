import React from 'react';

/**
 * モダンなファイル入力コンポーネント
 * @param {Object} props - props
 * @param {Function} props.onFileSelect - ファイル選択ハンドラ
 * @returns {JSX.Element} - ファイル入力コンポーネント
 */
const FileInput = ({ onFileSelect }) => {
  const handleChange = e => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <label className="file-input-label">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
      </svg>
      <span>画像を選択</span>
      <input type="file" accept="image/*" onChange={handleChange} style={{ display: 'none' }} />
    </label>
  );
};

export default FileInput;
