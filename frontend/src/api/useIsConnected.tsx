import { useState, useEffect } from 'react';
import { getTelegramUserId } from '../utils/telegramUser';

export function useIsConnected() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkTelegramConnection = () => {
      const userId = getTelegramUserId();
      setIsConnected(userId !== null);
    };

    checkTelegramConnection();
    
    // Re-check when Telegram WebApp data might change
    window.addEventListener('tgWebAppReady', checkTelegramConnection);
    
    return () => {
      window.removeEventListener('tgWebAppReady', checkTelegramConnection);
    };
  }, []);

  return { isConnected };
}
