import React from 'react';
import Label from '../atoms/Label';

/**
 * オプショングループコンポーネント
 * @param {Object} props - props
 * @param {string} props.label - ラベルテキスト
 * @param {React.ReactNode} props.children - 子要素（入力コントロールなど）
 * @param {boolean} props.isCheckbox - チェックボックスグループかどうか
 * @returns {JSX.Element} - オプショングループコンポーネント
 */
const OptionGroup = ({ label, children, isCheckbox = false }) => (
  <div className={`option-group${isCheckbox ? ' checkbox-group' : ''}`}>
    <Label>{label}</Label>
    {children}
  </div>
);

export default OptionGroup;
