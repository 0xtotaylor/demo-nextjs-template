// Create a new file: lib/context/url-context.tsx

import React, { createContext, useContext, useState, useCallback } from "react";

interface URLContextType {
  urls: string[];
  addURL: (url: string) => void;
  clearURLs: () => void;
}

const URLContext = createContext<URLContextType | undefined>(undefined);

export function URLProvider({ children }: { children: React.ReactNode }) {
  const [urls, setUrls] = useState<string[]>([]);

  const addURL = useCallback((url: string) => {
    setUrls((prev) => {
      if (prev.includes(url)) return prev;
      return [...prev, url];
    });
  }, []);

  const clearURLs = useCallback(() => {
    setUrls([]);
  }, []);

  return (
    <URLContext.Provider value={{ urls, addURL, clearURLs }}>
      {children}
    </URLContext.Provider>
  );
}

export function useURLs() {
  const context = useContext(URLContext);
  if (context === undefined) {
    throw new Error("useURLs must be used within a URLProvider");
  }
  return context;
}
