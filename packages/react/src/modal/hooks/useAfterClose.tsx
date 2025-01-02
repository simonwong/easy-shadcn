import { useEffect, useRef } from 'react';

const useAfterClose = (open: boolean | undefined, afterClose?: () => void) => {
  const animateOpenRef = useRef<boolean | undefined>(open);

  useEffect(() => {
    if (open) {
      animateOpenRef.current = true;
    } else {
      // The Modal from open to close.
      if (animateOpenRef.current) {
        setTimeout(() => {
          afterClose?.();
        }, 200);
      }
    }
  }, [open, afterClose]);
};

export default useAfterClose;
