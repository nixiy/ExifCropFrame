import React from 'react';

/**
 * クローズボタン（✕）コンポーネント
 * @param {Object} props - props
 * @param {Function} props.onClick - クリックハンドラ
 * @param {string} props.position - ボタンの位置 ('top-left' または 'top-right')
 * @returns {JSX.Element} - クローズボタンコンポーネント
 */
const CloseButton = ({ onClick, position = 'top-right' }) => {
  // ポジションに応じたクラス名を生成
  const positionClass = position === 'top-left' ? 'position-top-left' : 'position-top-right';

  return (
    <button
      className={`close-button ${positionClass}`}
      onClick={onClick}
      title="画像をクリア"
      aria-label="画像をクリア"
    >
      ✕
    </button>
  );
};

export default CloseButton;
