import React from 'react';

/**
 * ラベルコンポーネント
 * @param {Object} props - props
 * @param {string} props.htmlFor - 関連付けるフォーム要素のID
 * @param {React.ReactNode} props.children - 子要素
 * @returns {JSX.Element} - ラベルコンポーネント
 */
const Label = ({ htmlFor, children }) => {
  return <label htmlFor={htmlFor}>{children}</label>;
};

export default Label;
