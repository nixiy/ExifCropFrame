import React from 'react';

/**
 * メインレイアウトテンプレート
 * @param {Object} props - props
 * @param {React.ReactNode} props.children - 子要素
 * @returns {JSX.Element} - メインレイアウトコンポーネント
 */
const MainLayout = ({ children }) => {
  return (
    <div className="container">
      <h1>ExifCropFrame</h1>
      {children}
    </div>
  );
};

export default MainLayout;
