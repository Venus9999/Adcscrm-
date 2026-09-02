import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './registerServiceWorker';
import { initFirebaseAppCheck } from './services/firebaseAppCheck';

// Initialize Firebase App Check with reCAPTCHA Enterprise
initFirebaseAppCheck();

// Initialize PWA Service Worker for Android / Mobile offline and caching
registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
