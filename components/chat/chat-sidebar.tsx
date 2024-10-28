import React, { useEffect, useRef } from "react"
import { Message } from "ai"
import { Send } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ChatSidebarProps {
  messages: Message[]
  input: string
  isLoading?: boolean
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: React.FormEvent) => void
}

export function ChatSidebar({
  messages,
  input,
  isLoading,
  handleInputChange,
  handleSubmit,
}: ChatSidebarProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex h-full flex-col">
      <ScrollArea
        className="flex-1 p-4"
        ref={scrollAreaRef}
        viewportRef={scrollAreaRef}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "mb-4 flex",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "rounded-lg p-2 max-w-[80%] break-words",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              <p>{message.content}</p>
            </div>
          </div>
        ))}
      </ScrollArea>
      <div className="border-t p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit(e)
          }}
          className="flex items-center space-x-2"
        >
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
