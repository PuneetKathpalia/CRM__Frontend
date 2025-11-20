import { Toaster } from 'react-hot-toast';

/**
 * Toast Notification Provider
 * Provides toast notifications with custom styling matching the app theme
 */
const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#000000',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
          style: {
            border: '1px solid rgba(16, 185, 129, 0.3)',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
          style: {
            border: '1px solid rgba(239, 68, 68, 0.3)',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
          },
        },
      }}
    />
  );
};

export default ToastProvider;







