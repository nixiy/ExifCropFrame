import React, { useState, useRef, useEffect } from 'react';

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
  const pickerRef = useRef(null);
  const selectRef = useRef(null);

  // 外側クリックでカラーピッカーを閉じる
  useEffect(() => {
    const handleOutsideClick = e => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target) &&
        selectRef.current &&
        !selectRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleSelectChange = e => {
    e.stopPropagation(); // イベント伝播を停止
    if (e.target.value !== '') {
      onChange({ target: { value: e.target.value } });
      // 選択後にプルダウンをリセット
      setTimeout(() => {
        e.target.value = '';
      }, 100);
    }
  };

  // カラーの名前を取得
  const getColorName = () => {
    const preset = presets.find(p => p.value.toLowerCase() === value.toLowerCase());
    return preset ? preset.label : value;
  };
  return (
    <div className="color-picker-container" ref={pickerRef}>
      <div className="color-picker-main">
        <div
          className="color-swatch-wrapper"
          onClick={e => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          <div className="color-swatch" style={{ backgroundColor: value }}></div>
        </div>
        <input
          type="color"
          value={value}
          onChange={e => {
            e.stopPropagation();
            onChange(e);
          }}
          onFocus={e => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          title={getColorName()}
        />
      </div>
      {presets.length > 0 && (
        <select
          className="color-preset-select"
          onChange={handleSelectChange}
          value=""
          ref={selectRef}
          onClick={e => e.stopPropagation()}
          onFocus={e => e.stopPropagation()}
        >
          <option value="">選択</option>
          {presets.map((preset, index) => (
            <option key={index} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </select>
      )}
      {isOpen && (
        <div className="color-presets-panel" onClick={e => e.stopPropagation()}>
          <div className="color-presets-grid">
            {presets.map((preset, index) => (
              <button
                key={index}
                className="color-preset-item"
                style={{ backgroundColor: preset.value }}
                title={preset.label}
                onClick={e => {
                  e.stopPropagation();
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
