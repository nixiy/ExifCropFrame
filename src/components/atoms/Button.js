import React from 'react';

/**
 * モダンなボタンコンポーネント
 * @param {Object} props - props
 * @param {string} props.type - ボタンタイプ (primary, secondary, danger, info)
 * @param {Function} props.onClick - クリックハンドラ
 * @param {boolean} props.disabled - 無効状態
 * @param {React.ReactNode} props.icon - アイコン要素（オプション）
 * @param {boolean} props.isLoading - ローディング状態（オプション）
 * @param {React.ReactNode} props.children - 子要素
 * @returns {JSX.Element} - ボタンコンポーネント
 */
const Button = ({ type = 'primary', onClick, disabled, icon, isLoading = false, children }) => {
  // ボタンタイプに応じたクラス名を設定
  const getButtonClassName = () => {
    switch (type) {
      case 'primary':
        return 'button primary-button';
      case 'secondary':
        return 'button secondary-button';
      case 'danger':
        return 'button danger-button';
      case 'info':
        return 'button info-button';
      default:
        return 'button primary-button';
    }
  };

  return (
    <button className={getButtonClassName()} onClick={onClick} disabled={disabled || isLoading}>
      {isLoading && <span className="loading-spinner"></span>}
      {!isLoading && icon && <span className="button-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
