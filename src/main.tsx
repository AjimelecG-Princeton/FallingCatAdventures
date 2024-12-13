import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';

// Create root element
const root = createRoot(document.getElementById('app') as HTMLElement);

// Render app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
