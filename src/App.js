import React, { useEffect } from 'react';
import './App.css';
import MainLayout from './components/templates/MainLayout';
import ExifEditor from './components/pages/ExifEditor';
import { ExifProvider } from './contexts/ExifContext';
import useGoogleAnalytics from './hooks/useGoogleAnalytics';

function App() {
  const { sendPageView } = useGoogleAnalytics();

  // アプリケーションロード時にPageViewイベントを送信
  useEffect(() => {
    sendPageView('/', 'ExifCropFrame');
  }, [sendPageView]);

  return (
    <MainLayout>
      <ExifProvider>
        <ExifEditor />
      </ExifProvider>
    </MainLayout>
  );
}

export default App;
