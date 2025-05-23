import React from 'react';

/**
 * セグメンテッドコントロールコンポーネント
 * @param {Object} props - props
 * @param {Array} props.options - オプションの配列 [{value, label}]
 * @param {string|number} props.value - 選択されている値
 * @param {Function} props.onChange - 変更ハンドラ
 * @returns {JSX.Element} - セグメンテッドコントロールコンポーネント
 */
const SegmentedControl = ({ options, value, onChange }) => {
  const handleChange = optionValue => {
    onChange({ target: { value: optionValue } });
  };

  return (
    <div className="segmented-control">
      {options.map(option => (
        <button
          key={option.value}
          className={`segment ${value === option.value ? 'active' : ''}`}
          onClick={() => handleChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default SegmentedControl;
