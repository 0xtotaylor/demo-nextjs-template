import { useMedia } from "@/context/media-context"

export function AppMedia() {
  const { urls } = useMedia()

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-muted/50" />
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="aspect-video h-12 w-full rounded-lg bg-muted/50"
          />
        ))}
      </div>
    </>
  )
}
