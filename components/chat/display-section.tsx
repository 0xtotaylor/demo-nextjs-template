import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DisplaySection() {
  return (
    <div className="flex h-full flex-col">
      <main className="flex-1 overflow-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Section 1</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Lorem ipsum dolor sit amet, putant tamquam delectus ne eos. Pri
              feugait molestiae constituam te, dignissim incorrupte ad eam, cum
              agam accusam patrioque ut. Vocibus intellegat voluptatum pri ex.
              Vitae blandit sea an, his et suas noluisse, ancillae recusabo nam
              in. Te molestie neglegentur eam, quo decore ocurreret scribentur
              an.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Section 2</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-1 flex-col gap-4 p-4">
              <div className="grid auto-rows-min gap-4 md:grid-cols-5">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl bg-muted/50"
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
