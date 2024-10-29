import React, { createContext, useContext, useState, useCallback } from "react";

interface URLContextType {
  urls: string[];
  addURL: (url: string) => void;
  clearURLs: () => void;
  extractURLs: (text: string) => void;
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

  const extractURLs = useCallback((text: string) => {
    const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g;
    const urlRegex = /(https?:\/\/[^\s\)]+)/g;

    const extractedUrls = new Set<string>();

    let match;
    while ((match = markdownLinkRegex.exec(text)) !== null) {
      const url = match[2];
      extractedUrls.add(url);
    }

    const textWithoutMarkdownLinks = text.replace(markdownLinkRegex, "");
    while ((match = urlRegex.exec(textWithoutMarkdownLinks)) !== null) {
      extractedUrls.add(match[1]);
    }

    setUrls((prev) => {
      const newUrls = [...extractedUrls].filter((url) => !prev.includes(url));
      return [...prev, ...newUrls];
    });
  }, []);

  return (
    <URLContext.Provider value={{ urls, addURL, clearURLs, extractURLs }}>
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
