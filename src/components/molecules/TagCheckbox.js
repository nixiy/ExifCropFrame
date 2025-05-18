import React from 'react';
import Label from '../atoms/Label';
import Checkbox from '../atoms/Checkbox';

/**
 * タグチェックボックスコンポーネント
 * @param {Object} props - props
 * @param {string} props.tag - タグID
 * @param {string} props.label - 表示ラベル
 * @param {boolean} props.checked - チェック状態
 * @param {Function} props.onChange - 変更ハンドラ
 * @returns {JSX.Element} - タグチェックボックスコンポーネント
 */
const TagCheckbox = ({ tag, label, checked, onChange }) => {
  const id = `tag-${tag}`;

  return (
    <label className="tag-checkbox">
      <Checkbox id={id} checked={checked} onChange={e => onChange(tag, e.target.checked)} />
      <span>{label}</span>
    </label>
  );
};

export default TagCheckbox;
