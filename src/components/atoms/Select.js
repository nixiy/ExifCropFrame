import React from 'react';

/**
 * モダンなセレクト（選択リスト）コンポーネント
 * @param {Object} props - props
 * @param {Array} props.options - オプションの配列 [{value, label}]
 * @param {string|number} props.value - 選択されている値
 * @param {Function} props.onChange - 変更ハンドラ
 * @param {string} props.label - セレクトのラベル（オプション）
 * @param {string} props.placeholder - プレースホルダー（オプション）
 * @returns {JSX.Element} - セレクトコンポーネント
 */
const Select = ({ options, value, onChange, label, placeholder }) => (
  <div className="select-wrapper">
    {label && <label className="select-label">{label}</label>}
    <div className="custom-select">
      <select value={value} onChange={onChange}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default Select;
