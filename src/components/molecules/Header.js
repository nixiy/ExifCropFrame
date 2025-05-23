import React from 'react';
import GithubIcon from '../atoms/GithubIcon';

/**
 * モダンなヘッダーコンポーネント
 * @param {Object} props - プロパティ
 * @param {string} props.logoSrc - ロゴ画像のソースパス
 * @param {string} props.logoAlt - ロゴ画像の代替テキスト
 * @returns {JSX.Element} - ヘッダーコンポーネント
 */
const Header = ({ logoSrc = 'images/logo.png', logoAlt = 'ExifCropFrame ロゴ' }) => (
  <div className="header-bar">
    <div className="header-actions left"></div>
    <div className="logo-container">
      <img src={logoSrc} alt={logoAlt} className="app-logo" />
    </div>
    <div className="header-actions">
      <GithubIcon />
    </div>
  </div>
);

export default Header;
