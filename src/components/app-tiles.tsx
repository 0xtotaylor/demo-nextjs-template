"use client";

import React from "react";
import { ExternalLink, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

import { useURLs } from "@/lib/context/url-context";

export function AppTiles() {
  const { urls } = useURLs();

  const isImageURL = (url: string) => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    return imageExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };

  const renderURLTiles = () => {
    if (urls.length === 0) {
      return (
        <>
          <div className="aspect-video rounded-xl bg-muted/50 animate-pulse" />
          <div className="aspect-video rounded-xl bg-muted/50 animate-pulse" />
          <div className="aspect-video rounded-xl bg-muted/50 animate-pulse" />
        </>
      );
    }

    return urls.map((url) => (
      <a
        key={url}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative aspect-video overflow-hidden rounded-xl bg-muted/50 transition-all hover:bg-muted/70"
      >
        {isImageURL(url) ? (
          <Image
            src={url}
            alt="URL content"
            layout="fill"
            objectFit="cover"
            className="transition-opacity group-hover:opacity-80"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="flex items-center gap-2 text-sm font-medium opacity-70 transition-opacity group-hover:opacity-100">
              {isImageURL(url) ? (
                <ImageIcon className="h-4 w-4" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              {new URL(url).hostname}
            </div>
          </div>
        )}
      </a>
    ));
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        {renderURLTiles()}
      </div>
    </div>
  );
}
