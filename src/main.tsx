import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18.ts';
import App from './App.tsx';
import './index.css';

// Check if root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found. Ensure index.html has <div id="root">');
} else {
  ReactDOM.createRoot(rootElement).render(
    // Comment out StrictMode for production debugging if needed
    <React.StrictMode>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </I18nextProvider>
    </React.StrictMode>
  );
}