import React, { createContext, useContext, useState, useCallback } from "react";
import { useSkyfireAPIKey } from "@/lib/skyfire-sdk/context/context";

interface URLContextType {
  urls: string[];
  addURL: (url: string) => void;
  clearURLs: () => void;
  extractURLs: (text: string) => Promise<void>;
  isExtracting: boolean;
}

interface APIResponse {
  success: boolean;
  urls: string[];
  error?: string;
}

const URLContext = createContext<URLContextType | undefined>(undefined);

export function URLProvider({ children }: { children: React.ReactNode }) {
  const { localAPIKey } = useSkyfireAPIKey();
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

  const extractURLs = useCallback(
    async (text: string) => {
      try {
        setIsExtracting(true);

        const response = await fetch("/api/media", {
          method: "POST",
          headers: {
            "skyfire-api-key": localAPIKey || "",
          },
          body: JSON.stringify({ text }),
        });

        const data: APIResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Error: ${response.status}`);
        }

        if (!data.success) {
          throw new Error(data.error || "Failed to extract URLs");
        }

        setUrls((prev) => {
          const newUrls = data.urls.filter((url) => !prev.includes(url));
          return [...prev, ...newUrls];
        });
      } catch (error) {
        console.error("Error extracting URLs:", error);
      } finally {
        setIsExtracting(false);
      }
    },
    [localAPIKey]
  );

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
