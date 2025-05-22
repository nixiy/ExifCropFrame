import React from 'react';

/**
 * ボタンコンポーネント
 * @param {Object} props - props
 * @param {string} props.type - ボタンタイプ (primary, secondary, danger, info)
 * @param {Function} props.onClick - クリックハンドラ
 * @param {boolean} props.disabled - 無効状態
 * @param {React.ReactNode} props.children - 子要素
 * @returns {JSX.Element} - ボタンコンポーネント
 */
const Button = ({ type = 'primary', onClick, disabled, children }) => (
  <button className="button primary-button" onClick={onClick} disabled={disabled}>
    {children}
  </button>
);

export default Button;
