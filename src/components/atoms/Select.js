import React from 'react';

/**
 * セレクト（選択リスト）コンポーネント
 * @param {Object} props - props
 * @param {Array} props.options - オプションの配列 [{value, label}]
 * @param {string|number} props.value - 選択されている値
 * @param {Function} props.onChange - 変更ハンドラ
 * @returns {JSX.Element} - セレクトコンポーネント
 */
const Select = ({ options, value, onChange }) => {
  return (
    <select value={value} onChange={onChange}>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
