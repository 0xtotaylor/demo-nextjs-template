import React, { createContext, useCallback, useContext, useState } from "react"

interface MediaContextType {
  urls: string[]
  addURL: (url: string) => void
  clearURLs: () => void
  extractURLs: (text: string) => void
  isExtracting: boolean
}

const MediaContext = createContext<MediaContextType | undefined>(undefined)

export function MediaProvider({ children }: { children: React.ReactNode }) {
  const [urls, setUrls] = useState<string[]>([])
  const [isExtracting, setIsExtracting] = useState(false)

  /**
   * Adds a new URL to the list if it doesn't already exist.
   * @param url - The URL to be added.
   */
  const addURL = useCallback((url: string) => {
    setUrls((prev) => {
      if (prev.includes(url)) return prev
      return [...prev, url]
    })
  }, [])

  /**
   * Clears all URLs from the list.
   */
  const clearURLs = useCallback(() => {
    setUrls([])
  }, [])

  /**
   * Extracts URLs from the given text using various patterns.
   * @param text - The input text to extract URLs from.
   */
  const extractURLs = useCallback((text: string) => {
    try {
      setIsExtracting(true)

      const patterns = {
        standardUrl:
          /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/gi,

        markdownUrl: /\[(?:[^\]]*)\]\((https?:\/\/[^)]+)\)/gi,

        srcUrl: /src=["'](https?:\/\/[^"']+)["']/gi,

        hrefUrl: /href=["'](https?:\/\/[^"']+)["']/gi,
      }

      const extractedUrls = new Set<string>()

      Object.values(patterns).forEach((pattern) => {
        const matches = text.matchAll(pattern)
        for (const match of matches) {
          const url = match[1] || match[0]
          const cleanUrl = url.replace(/[.,;:!?)]+$/, "")
          extractedUrls.add(cleanUrl)
        }
      })

      setUrls((prev) => {
        const newUrls = Array.from(extractedUrls).filter(
          (url) => !prev.includes(url)
        )
        return [...prev, ...newUrls]
      })
    } catch (error) {
      console.error("Error extracting URLs:", error)
    } finally {
      setIsExtracting(false)
    }
  }, [])

  return (
    <MediaContext.Provider
      value={{ urls, addURL, clearURLs, extractURLs, isExtracting }}
    >
      {children}
    </MediaContext.Provider>
  )
}

/**
 * Custom hook to access the URL context.
 * @returns The URL context containing urls, addURL, clearURLs, extractURLs, and isExtracting.
 * @throws Error if used outside of a MediaProvider.
 */
export function useMedia() {
  const context = useContext(MediaContext)
  if (context === undefined) {
    throw new Error("useMedia must be used within a MediaProvider")
  }
  return context
}
