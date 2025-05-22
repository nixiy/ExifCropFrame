import React, { useState } from 'react';

/**
 * モダンなカラーピッカーコンポーネント
 * @param {Object} props - props
 * @param {string} props.value - 選択されている色のHEX値
 * @param {Function} props.onChange - 変更ハンドラ
 * @param {Array} props.presets - カラープリセットの配列 [{ value: '#HEX', label: '名前' }]
 * @returns {JSX.Element} - カラーピッカーコンポーネント
 */
const ColorPicker = ({ value, onChange, presets = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectChange = e => {
    if (e.target.value !== '') {
      onChange({ target: { value: e.target.value } });
    }
  };

  // カラーの名前を取得
  const getColorName = () => {
    const preset = presets.find(p => p.value.toLowerCase() === value.toLowerCase());
    return preset ? preset.label : value;
  };
  return (
    <div className="color-picker-container">
      <div className="color-picker-main">
        <div className="color-swatch-wrapper" onClick={() => setIsOpen(!isOpen)}>
          <div className="color-swatch" style={{ backgroundColor: value }}></div>
        </div>{' '}
        <input
          type="color"
          value={value}
          onChange={onChange}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
          title={getColorName()}
        />
      </div>

      {presets.length > 0 && (
        <select className="color-preset-select" onChange={handleSelectChange} value="">
          <option value="">選択</option>
          {presets.map((preset, index) => (
            <option key={index} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </select>
      )}

      {isOpen && (
        <div className="color-presets-panel">
          <div className="color-presets-grid">
            {presets.map((preset, index) => (
              <button
                key={index}
                className="color-preset-item"
                style={{ backgroundColor: preset.value }}
                title={preset.label}
                onClick={() => {
                  onChange({ target: { value: preset.value } });
                  setIsOpen(false);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
