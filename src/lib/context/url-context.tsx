import React, { createContext, useContext, useState, useCallback } from "react";

interface URLContextType {
  urls: string[];
  addURL: (url: string) => void;
  clearURLs: () => void;
  extractURLs: (text: string) => void;
  isExtracting: boolean;
}

const URLContext = createContext<URLContextType | undefined>(undefined);

export function URLProvider({ children }: { children: React.ReactNode }) {
  const [urls, setUrls] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);

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
    try {
      setIsExtracting(true);

      const patterns = {
        standardUrl:
          /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/gi,

        markdownUrl: /\[(?:[^\]]*)\]\((https?:\/\/[^)]+)\)/gi,

        srcUrl: /src=["'](https?:\/\/[^"']+)["']/gi,

        hrefUrl: /href=["'](https?:\/\/[^"']+)["']/gi,
      };

      const extractedUrls = new Set<string>();

      Object.values(patterns).forEach((pattern) => {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
          const url = match[1] || match[0];
          const cleanUrl = url.replace(/[.,;:!?)]+$/, "");
          extractedUrls.add(cleanUrl);
        }
      });

      setUrls((prev) => {
        const newUrls = Array.from(extractedUrls).filter(
          (url) => !prev.includes(url)
        );
        return [...prev, ...newUrls];
      });
    } catch (error) {
      console.error("Error extracting URLs:", error);
    } finally {
      setIsExtracting(false);
    }
  }, []);

  return (
    <URLContext.Provider
      value={{ urls, addURL, clearURLs, extractURLs, isExtracting }}
    >
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
