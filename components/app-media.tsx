import { useState } from "react"
import Image from "next/image"
import { useMedia } from "@/context/media-context"

function isImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const pathname = parsed.pathname.toLowerCase()
    return [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".avif"].some(
      (ext) => pathname.endsWith(ext)
    )
  } catch {
    return false
  }
}

export function AppMedia() {
  const { urls } = useMedia()
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  const categorizeMedia = (urls: string[] = []) => {
    return urls.reduce(
      (acc: { images: string[]; other: string[] }, url) => {
        if (isImageUrl(url) && !imageErrors.has(url)) {
          acc.images.push(url)
        } else {
          acc.other.push(url)
        }
        return acc
      },
      { images: [], other: [] }
    )
  }

  const { images, other } = categorizeMedia(urls)
  const remainingImages = Math.max(0, 10 - images.length)
  const remainingOther = Math.max(0, 6 - other.length)

  const handleImageError = (url: string) => {
    setImageErrors((prev) => new Set([...prev, url]))
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-5">
          {images.map((url, i) => (
            <a
              key={`image-${i}`}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-square rounded-xl overflow-hidden relative block"
            >
              <Image
                src={url}
                alt={`Media ${i + 1}`}
                fill
                className="object-cover"
                onError={() => handleImageError(url)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </a>
          ))}
          {Array.from({ length: remainingImages }).map((_, i) => (
            <div
              key={`placeholder-${i}`}
              className="aspect-square rounded-xl bg-muted/50"
            />
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-4">
        {other.map((url, i) => (
          <a
            key={`other-${i}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="aspect-video h-12 w-full rounded-lg overflow-hidden block"
          >
            <div className="flex items-center justify-center h-full bg-muted">
              <span className="text-sm text-muted-foreground">{url}</span>
            </div>
          </a>
        ))}
        {Array.from({ length: remainingOther }).map((_, i) => (
          <div
            key={`other-placeholder-${i}`}
            className="aspect-video h-12 w-full rounded-lg bg-muted/50"
          />
        ))}
      </div>
    </>
  )
}
