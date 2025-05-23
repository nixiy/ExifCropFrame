import React from 'react';
import Label from '../atoms/Label';

/**
 * オプショングループコンポーネント
 * @param {Object} props - props
 * @param {string} props.label - ラベルテキスト
 * @param {React.ReactNode} props.children - 子要素（入力コントロールなど）
 * @param {boolean} props.isCheckbox - チェックボックスグループかどうか
 * @param {boolean} props.hideLabel - ラベルを非表示にするかどうか
 * @param {string} props.className - 追加のクラス名
 * @returns {JSX.Element} - オプショングループコンポーネント
 */
const OptionGroup = ({
  label,
  children,
  isCheckbox = false,
  hideLabel = false,
  className = '',
}) => (
  <div
    className={`option-group${isCheckbox ? ' checkbox-group' : ''}${hideLabel ? ' no-label' : ''} ${className}`}
  >
    {!hideLabel && <Label>{label}</Label>}
    {children}
  </div>
);

export default OptionGroup;
