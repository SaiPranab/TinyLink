// src/router.js
import { useState, useEffect, useCallback } from 'react';

export const useClientRouter = () => {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((newPath) => {
    const absoluteUrl = `${window.location.origin}${newPath}`;
    try {
      window.history.pushState({}, '', absoluteUrl);
      setPath(newPath);
    } catch (e) {
      console.error("Navigation Error (PushState failed):", e);
      setPath(newPath);
    }
  }, []);

  return { path, navigate };
};
