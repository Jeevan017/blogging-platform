import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import './index.css';
import './styles/theme.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '0.9rem',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)',
              },
              success: {
                iconTheme: { primary: '#16a34a', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#dc2626', secondary: '#fff' },
              },
            }}
          />
        </AuthProvider>
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>
);
