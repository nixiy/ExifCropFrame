import React from 'react';

/**
 * クローズボタン（✕）コンポーネント
 * @param {Object} props - props
 * @param {Function} props.onClick - クリックハンドラ
 * @param {string} props.position - ボタンの位置 ('top-left' または 'top-right')
 * @returns {JSX.Element} - クローズボタンコンポーネント
 */
const CloseButton = ({ onClick, position = 'top-right' }) => {
  // ボタンのスタイル
  const buttonStyle = {
    position: 'absolute',
    top: '10px',
    right: position === 'top-right' ? '10px' : 'auto',
    left: position === 'top-left' ? '10px' : 'auto',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
    padding: 0,
    zIndex: 10,
    transition: 'background-color 0.2s ease',
  };

  // ホバー時のスタイル変更
  const handleMouseEnter = e => {
    e.target.style.backgroundColor = 'rgba(220, 53, 69, 0.8)'; // より赤っぽい色に変化
  };

  const handleMouseLeave = e => {
    e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  };

  return (
    <button
      style={buttonStyle}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title="画像をクリア"
      aria-label="画像をクリア"
    >
      ✕
    </button>
  );
};

export default CloseButton;
