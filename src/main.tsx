import { Buffer } from 'buffer';
import process from 'process';

// Set globals before anything else
window.global = window;
window.Buffer = Buffer;
window.process = process;

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
