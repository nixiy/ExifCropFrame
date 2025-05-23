import React, { useRef } from 'react';

/**
 * ダウンロードボタンコンポーネント
 * @param {Object} props - props
 * @param {Function} props.onClick - クリックハンドラ
 * @returns {JSX.Element} - ダウンロードボタンコンポーネント
 */
const DownloadButton = ({ onClick }) => {
  const rippleRef = useRef(null);

  // クリック時の波紋エフェクトを処理
  const handleClick = e => {
    const button = e.currentTarget;
    const ripple = rippleRef.current;

    // 波紋の位置をリセット
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${e.clientX - button.getBoundingClientRect().left - diameter / 2}px`;
    ripple.style.top = `${e.clientY - button.getBoundingClientRect().top - diameter / 2}px`;

    // アニメーションをリセットして再開
    ripple.classList.remove('animate');
    void ripple.offsetWidth; // リフロー強制
    ripple.classList.add('animate');

    // コールバック実行
    onClick(e);
  };

  return (
    <button
      className="floating-download-btn"
      onClick={handleClick}
      title="画像をダウンロード"
      aria-label="画像をダウンロード"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
        <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
      </svg>
      <span ref={rippleRef} className="download-ripple"></span>
    </button>
  );
};

export default DownloadButton;
