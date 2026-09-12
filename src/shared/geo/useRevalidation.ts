import { useEffect, useRef } from 'react';
// No background polling: revisit an active tab and revalidate only when stale.
export default function useRevalidation(refresh: () => void, age = 120000) {
  const callback = useRef(refresh),
    last = useRef(Date.now());
  callback.current = refresh;
  useEffect(() => {
    const revisit = () => {
      if (
        document.visibilityState !== 'visible' ||
        Date.now() - last.current < age
      )
        return;
      last.current = Date.now();
      callback.current();
    };
    document.addEventListener('visibilitychange', revisit);
    window.addEventListener('focus', revisit);
    return () => {
      document.removeEventListener('visibilitychange', revisit);
      window.removeEventListener('focus', revisit);
    };
  }, [age]);
}
