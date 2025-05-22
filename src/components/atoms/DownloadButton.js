import React from 'react';

/**
 * ダウンロードボタンコンポーネント
 * @param {Object} props - props
 * @param {Function} props.onClick - クリックハンドラ
 * @param {string} props.position - ボタンの位置 ('top-left', 'top-right', 'bottom-left', 'bottom-right')
 * @returns {JSX.Element} - ダウンロードボタンコンポーネント
 */
const DownloadButton = ({ onClick, position = 'top-right' }) => {
  // ポジションに応じたクラス名を生成
  const positionClass = `position-${position}`;

  return (
    <button
      className={`download-btn ${positionClass}`}
      onClick={onClick}
      title="画像をダウンロード"
      aria-label="画像をダウンロード"
    >
      <span className="download-icon">DL</span>
    </button>
  );
};

export default DownloadButton;
