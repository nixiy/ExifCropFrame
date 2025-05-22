import React from 'react';
import Header from '../molecules/Header';

/**
 * メインレイアウトテンプレート
 * @param {Object} props - props
 * @param {React.ReactNode} props.children - 子要素
 * @returns {JSX.Element} - メインレイアウトコンポーネント
 */
const MainLayout = ({ children }) => (
  <div className="container">
    <Header />
    {children}
  </div>
);

export default MainLayout;
