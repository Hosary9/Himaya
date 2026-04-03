import { useState, useContext, useCallback } from 'react';
import { AuthContext } from '../App';

export function useGuestRestriction() {
  const { isGuest } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const checkRestriction = useCallback((action: () => void) => {
    if (isGuest) {
      setIsModalOpen(true);
      return false;
    }
    action();
    return true;
  }, [isGuest]);

  const closeRestrictionModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return {
    isGuest,
    isModalOpen,
    checkRestriction,
    closeRestrictionModal
  };
}
