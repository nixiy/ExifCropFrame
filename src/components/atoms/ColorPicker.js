import React from 'react';

/**
 * カラーピッカーコンポーネント
 * @param {Object} props - props
 * @param {string} props.value - 選択されている色のHEX値
 * @param {Function} props.onChange - 変更ハンドラ
 * @param {Array} props.presets - カラープリセットの配列 [{ value: '#HEX', label: '名前' }]
 * @returns {JSX.Element} - カラーピッカーコンポーネント
 */
const ColorPicker = ({ value, onChange, presets = [] }) => {
  const handleSelectChange = e => {
    if (e.target.value !== '') {
      onChange({ target: { value: e.target.value } });
    }
  };

  return (
    <div className="color-picker-container">
      <input type="color" value={value} onChange={onChange} />

      {presets.length > 0 && (
        <select className="color-preset-select" onChange={handleSelectChange} value="">
          <option value="">プリセットから選択</option>
          {presets.map((preset, index) => (
            <option key={index} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default ColorPicker;
