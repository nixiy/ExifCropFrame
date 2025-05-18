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
const Button = ({ type = 'primary', onClick, disabled, children }) => {
  const getClassName = () => {
    const baseClass = 'button';
    switch (type) {
      case 'primary':
        return `${baseClass} primary-button`;
      case 'secondary':
        return `${baseClass} secondary-button`;
      case 'danger':
        return `${baseClass} danger-button`;
      case 'info':
        return `${baseClass} info-button`;
      case 'success':
        return `${baseClass} success-button`;
      default:
        return `${baseClass} primary-button`;
    }
  };

  return (
    <button className={getClassName()} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;
