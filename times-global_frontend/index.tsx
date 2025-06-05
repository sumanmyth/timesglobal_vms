// THIS MUST BE AT THE VERY TOP
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Minimal module declarations to help TS recognize these modules from esm.sh
// This attempts to resolve TS7016.
declare module 'react';
declare module 'react-dom/client';
declare module 'react/jsx-runtime'; // If using automatic JSX runtime

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);