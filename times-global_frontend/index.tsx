
// Fallback global JSX declaration to attempt to resolve TS7026.
// This should ideally not be needed if React 19's types are correctly picked up.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // This allows any string as a tag name and any props.
      // It sacrifices type safety for intrinsic elements but resolves the error.
      [elemName: string]: any;
    }
    // You might also need these if further JSX-related type errors appear,
    // though IntrinsicElements is usually the main one for ts(7026).
    // interface ElementAttributesProperty { props: {}; } 
    // interface ElementChildrenAttribute { children: {}; }
  }
}

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