import React from 'react';
import Button from '../atoms/Button';

/**
 * ファイル入力コンポーネント
 * @param {Object} props - props
 * @param {Function} props.onFileSelect - ファイル選択ハンドラ
 * @returns {JSX.Element} - ファイル入力コンポーネント
 */
const FileInput = ({ onFileSelect }) => {
  const handleChange = e => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileSelect(file);
    }
  };

  return (
    <label className="file-input-label">
      画像を選択
      <input type="file" accept="image/*" onChange={handleChange} style={{ display: 'none' }} />
    </label>
  );
};

export default FileInput;
