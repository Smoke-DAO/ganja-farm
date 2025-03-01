import { useEffect, useState } from 'react';
import { getTelegramUserId } from '../utils/telegramUser';

export function useWallet() {
    const [isUserId, setIsUserId] = useState<string | null>(null);
    
    useEffect(() => {
      const checkTelegramConnection = () => {
        const userId = getTelegramUserId();
        setIsUserId(userId);
      };
  
      checkTelegramConnection();
      
      // Re-check when Telegram WebApp data might change
      window.addEventListener('tgWebAppReady', checkTelegramConnection);
      
      return () => {
        window.removeEventListener('tgWebAppReady', checkTelegramConnection);
      };
    }, []);
  
    return { wallet: isUserId };
  }

