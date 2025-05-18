import React from 'react';
import './App.css';
import MainLayout from './components/templates/MainLayout';
import ExifEditor from './components/pages/ExifEditor';
import { ExifProvider } from './contexts/ExifContext';

function App() {
  return (
    <MainLayout>
      <ExifProvider>
        <ExifEditor />
      </ExifProvider>
    </MainLayout>
  );
}

export default App;
