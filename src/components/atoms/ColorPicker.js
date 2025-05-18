import React from 'react';

/**
 * カラーピッカーコンポーネント
 * @param {Object} props - props
 * @param {string} props.value - 選択されている色のHEX値
 * @param {Function} props.onChange - 変更ハンドラ
 * @returns {JSX.Element} - カラーピッカーコンポーネント
 */
const ColorPicker = ({ value, onChange }) => {
  return <input type="color" value={value} onChange={onChange} />;
};

export default ColorPicker;
