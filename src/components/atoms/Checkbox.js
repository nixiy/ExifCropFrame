import React from 'react';

/**
 * チェックボックスコンポーネント
 * @param {Object} props - props
 * @param {string} props.id - 要素ID
 * @param {boolean} props.checked - チェック状態
 * @param {Function} props.onChange - 変更ハンドラ
 * @returns {JSX.Element} - チェックボックスコンポーネント
 */
const Checkbox = ({ id, checked, onChange }) => {
  return <input type="checkbox" id={id} checked={checked} onChange={onChange} />;
};

export default Checkbox;
