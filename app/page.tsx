// app/page.tsx
"use client"

import { useState } from "react"

import { useSkyfireAPIKey } from "@/lib/skyfire-sdk/context/context"
import { ChatLayout } from "@/components/chat/chat-layout"

interface Message {
  id: number
  content: string
  role: "user" | "ai"
}

export default function IndexPage() {
  const { localAPIKey } = useSkyfireAPIKey()
  if (!localAPIKey) return null

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, content: "Hello! How can I assist you today?", role: "ai" },
  ])
  const [input, setInput] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, content: input, role: "user" },
      ])
      setInput("")
      // Simulate AI response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            content: "I'm processing your request. Please wait a moment.",
            role: "ai",
          },
        ])
      }, 1000)
    }
  }

  return (
    <ChatLayout
      messages={messages}
      input={input}
      handleInputChange={handleInputChange}
      handleSendMessage={handleSendMessage}
    />
  )
}
