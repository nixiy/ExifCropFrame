import React from 'react';
import GithubIcon from '../atoms/GithubIcon';

/**
 * モダンなヘッダーコンポーネント
 * @param {Object} props - プロパティ
 * @param {string} props.logoSrc - ロゴ画像のソースパス
 * @param {string} props.logoAlt - ロゴ画像の代替テキスト
 * @param {string} props.title - アプリケーションのタイトル（オプション）
 * @returns {JSX.Element} - ヘッダーコンポーネント
 */
const Header = ({
  logoSrc = 'images/logo.png',
  logoAlt = 'ExifCropFrame ロゴ',
  title = 'ExifCropFrame',
}) => (
  <div className="header-bar">
    <div className="logo-container">
      <img src={logoSrc} alt={logoAlt} className="app-logo" />
    </div>
    <h1 className="app-title">{title}</h1>
    <div className="header-actions">
      <GithubIcon />
    </div>
  </div>
);

export default Header;
