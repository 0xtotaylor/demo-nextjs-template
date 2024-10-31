import React from "react"
import { AlertCircle } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface VetricComponentProps {
  result: {
    success: boolean
    operation: string
    query: string
    result?: any
    error?: string
  }
}

export const Component: React.FC<VetricComponentProps> = ({ result }) => {
  if (!result) return null

  const { success, operation, query, result: data, error } = result

  if (!success) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to fetch data from Vetric: {error}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <CardTitle>
          {operation === "fetchTopTweets"
            ? "Top Tweets"
            : "LinkedIn People Search"}
          <span className="text-sm font-normal ml-2">for "{query}"</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] rounded-md border p-4">
          {operation === "fetchTopTweets" ? (
            <div className="space-y-4">
              {data?.map((tweet: any, index: number) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg bg-background"
                >
                  <div className="font-medium">{tweet.author}</div>
                  <div className="mt-2">{tweet.text}</div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {tweet.date} • {tweet.likes} likes • {tweet.retweets}{" "}
                    retweets
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {data?.map((profile: any, index: number) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg bg-background"
                >
                  <div className="font-medium">{profile.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {profile.title}
                  </div>
                  <div className="mt-2">{profile.summary}</div>
                  <div className="mt-2 text-sm text-primary">
                    {profile.location}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
