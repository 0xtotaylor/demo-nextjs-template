"use client"

import * as React from "react"
import Image from "next/image"
import { useMedia } from "@/context/media-context"
import { useChat } from "ai/react"
import { Loader2, Mic, MicOff } from "lucide-react"
import ReactMarkdown from "react-markdown"

import { useSkyfireAPIKey } from "@/lib/skyfire-sdk/context/context"
import { useVoice } from "@/hooks/use-voice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { extractURLs } = useMedia()
  const { localAPIKey } = useSkyfireAPIKey()
  const { status, startRecording, stopRecording, error } = useVoice()
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const [isTranscribing, setIsTranscribing] = React.useState(false)

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setInput,
  } = useChat({
    api: "/api/chat",
    headers: {
      "skyfire-api-key": localAPIKey || "",
    },
    initialMessages: [
      {
        id: "1",
        role: "assistant",
        content: "Hello! How can I assist you today?",
      },
    ],
    onFinish: (message) => {
      extractURLs(message.content)
    },
  })

  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleRecordingStart = async (
    e: React.MouseEvent | React.TouchEvent
  ) => {
    e.preventDefault()
    try {
      await startRecording()
    } catch (err) {
      console.error("Failed to start recording:", err)
    }
  }

  const handleRecordingStop = async (
    e: React.MouseEvent | React.TouchEvent
  ) => {
    e.preventDefault()
    try {
      setIsTranscribing(true)
      const audioBlob = await stopRecording()

      if (audioBlob) {
        const response = await fetch("/api/transcribe", {
          method: "POST",
          body: audioBlob,
        })

        if (response.ok) {
          const { text } = await response.json()
          setInput(text)
        } else {
          console.error("Transcription failed")
        }
      }
    } catch (err) {
      console.error("Failed to stop recording:", err)
    } finally {
      setIsTranscribing(false)
    }
  }

  if (!localAPIKey) return null

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a
                href="https://docs.skyfire.xyz"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                  <Image
                    src="/skyfire.svg"
                    alt="Skyfire Logo"
                    width={24}
                    height={24}
                    className="size-6 rounded-full"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Skyfire</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="flex flex-col overflow-y-auto p-4">
        <div className="flex-1 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-full p-3 ${
                message.role === "assistant"
                  ? "text-black"
                  : "bg-[#0472fe] text-white"
              }`}
            >
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <form
          onSubmit={handleSubmit}
          className="flex w-full items-center space-x-2"
        >
          <Input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={handleInputChange}
            disabled={isLoading || status === "recording"}
            className="rounded-full"
          />
          <Button
            type="submit"
            disabled={isLoading || status === "recording"}
            className="rounded-full bg-[#0C0D12] hover:bg-[#0C0D12]/90 text-white"
          >
            Send
          </Button>
          <Button
            type="button"
            size="icon"
            onMouseDown={handleRecordingStart}
            onMouseUp={handleRecordingStop}
            onTouchStart={handleRecordingStart}
            onTouchEnd={handleRecordingStop}
            disabled={isLoading || error !== null || isTranscribing}
            className={`rounded-full w-10 h-10 flex items-center justify-center bg-[#0C0D12] hover:bg-[#0C0D12]/90 text-white ${
              status === "recording" ? "bg-red-500 hover:bg-red-600" : ""
            }`}
            title={error ? error.message : "Record audio"}
          >
            {isTranscribing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : status === "recording" ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        </form>
      </SidebarFooter>
    </Sidebar>
  )
}
