import React from 'react';

/**
 * セグメンテッドコントロールコンポーネント
 * @param {Object} props - props
 * @param {Array} props.options - オプションの配列 [{value, label, icon}]
 * @param {string|number} props.value - 選択されている値
 * @param {Function} props.onChange - 変更ハンドラ
 * @param {boolean} props.showIcons - アイコンを表示するかどうか
 * @returns {JSX.Element} - セグメンテッドコントロールコンポーネント
 */
const SegmentedControl = ({ options, value, onChange, showIcons = false }) => {
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
          {showIcons && option.icon && (
            <span className="segment-icon" aria-hidden="true">
              {option.icon}
            </span>
          )}
          <span className="segment-label">{option.label}</span>
        </button>
      ))}
    </div>
  );
};

export default SegmentedControl;
