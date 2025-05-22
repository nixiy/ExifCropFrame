import React from 'react';

/**
 * ダウンロードボタンコンポーネント
 * @param {Object} props - props
 * @param {Function} props.onClick - クリックハンドラ
 * @param {string} props.position - ボタンの位置 ('top-left', 'top-right', 'bottom-left', 'bottom-right')
 * @returns {JSX.Element} - ダウンロードボタンコンポーネント
 */
const DownloadButton = ({ onClick, position = 'top-right' }) => {
  // ボタンの位置を計算
  let positionStyle = {};

  if (position.includes('top')) {
    positionStyle.top = '10px';
  } else if (position.includes('bottom')) {
    positionStyle.bottom = '10px';
  }

  if (position.includes('right')) {
    positionStyle.right = '10px';
  } else if (position.includes('left')) {
    positionStyle.left = '10px';
  }

  // ボタンのスタイル
  const buttonStyle = {
    position: 'absolute',
    ...positionStyle,
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
    fontSize: '16px',
    fontWeight: 'bold',
    padding: 0,
    zIndex: 10,
    transition: 'background-color 0.2s ease',
  };

  // ホバー時のスタイル変更
  const handleMouseEnter = e => {
    e.target.style.backgroundColor = 'rgba(0, 123, 255, 0.8)'; // 青っぽい色に変化
  };

  const handleMouseLeave = e => {
    e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  };

  // ダウンロードアイコンのスタイル
  const iconStyle = {
    width: '16px',
    height: '16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  return (
    <button
      style={buttonStyle}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title="画像をダウンロード"
      aria-label="画像をダウンロード"
    >
      <div style={iconStyle}>DL</div>
    </button>
  );
};

export default DownloadButton;
