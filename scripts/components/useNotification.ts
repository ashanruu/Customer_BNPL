import { useState } from 'react';

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  visible: boolean;
  duration?: number;
}

export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState>({
    message: '',
    type: 'info',
    visible: false,
    duration: 3000,
  });

  const showNotification = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration: number = 3000
  ) => {
    setNotification({
      message,
      type,
      visible: true,
      duration,
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      visible: false,
    }));
  };

  const showSuccess = (message: string, duration?: number) => {
    showNotification(message, 'success', duration);
  };

  const showError = (message: string, duration?: number) => {
    showNotification(message, 'error', duration);
  };

  const showWarning = (message: string, duration?: number) => {
    showNotification(message, 'warning', duration);
  };

  const showInfo = (message: string, duration?: number) => {
    showNotification(message, 'info', duration);
  };

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
