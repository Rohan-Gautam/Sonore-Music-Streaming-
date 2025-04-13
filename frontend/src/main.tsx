import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

/**
 * Main entry point
 * Renders the App component into the DOM
 * Applies global CSS styles
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

/**
 * How to extend:
 * 1. **Providers**: Wrap App with Redux Provider or Context for state.
 * 2. **Error Boundary**: Add a global error boundary component.
 * 3. **Analytics**: Initialize analytics (e.g., Google Analytics).
 */