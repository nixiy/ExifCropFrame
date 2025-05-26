import { useEffect } from 'react';

/**
 * Google Analytics（GA4）のイベント送信を行うカスタムフック
 * @returns {Object} - Google Analyticsの関数群
 */
export const useGoogleAnalytics = () => {
  /**
   * イベントを送信する関数
   * @param {string} eventName - イベント名
   * @param {Object} [eventParams={}] - イベントパラメータ
   */
  const sendEvent = (eventName, eventParams = {}) => {
    if (window.gtag) {
      window.gtag('event', eventName, eventParams);
    }
  };

  /**
   * ページビューを送信する関数
   * @param {string} pagePath - ページパス
   * @param {string} pageTitle - ページタイトル
   */
  const sendPageView = (pagePath, pageTitle) => {
    if (window.gtag) {
      window.gtag('config', 'G-C2BTRHPXPH', {
        page_path: pagePath,
        page_title: pageTitle,
      });
    }
  };

  return {
    sendEvent,
    sendPageView,
  };
};

export default useGoogleAnalytics;
