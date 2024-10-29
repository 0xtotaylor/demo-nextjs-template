import React, { createContext, useContext, useState, useCallback } from "react";
import { generateObject } from "ai";
import { z } from "zod";

interface URLContextType {
  urls: string[];
  addURL: (url: string) => void;
  clearURLs: () => void;
  extractURLs: (text: string) => Promise<void>;
  isExtracting: boolean;
}

const urlExtractionSchema = z.object({
  urls: z.array(
    z.object({
      url: z.string().url(),
      context: z.string().optional(),
    })
  ),
});

const URLContext = createContext<URLContextType | undefined>(undefined);

export function URLProvider({
  children,
  model,
}: {
  children: React.ReactNode;
  model: any;
}) {
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

        const { object } = await generateObject({
          model,
          schema: urlExtractionSchema,
          prompt: `Extract all URLs from the following text. Include both regular URLs and URLs from markdown links. For each URL, provide some brief context about what it links to based on the surrounding text: ${text}`,
        });

        setUrls((prev) => {
          const newUrls = object.urls
            .map((item) => item.url)
            .filter((url) => !prev.includes(url));
          return [...prev, ...newUrls];
        });
      } catch (error) {
        console.error("Error extracting URLs:", error);

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
          const newUrls = [...extractedUrls].filter(
            (url) => !prev.includes(url)
          );
          return [...prev, ...newUrls];
        });
      } finally {
        setIsExtracting(false);
      }
    },
    [model]
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
