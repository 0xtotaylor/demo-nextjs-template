"use client"

import { useChat } from "ai/react"

import { useSkyfireAPIKey } from "@/lib/skyfire-sdk/context/context"
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import { ChatSidebar } from "./chat-sidebar"
import { DisplaySection } from "./display-section"

export function ChatLayout() {
  const { localAPIKey } = useSkyfireAPIKey()

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat",
      headers: {
        "skyfire-api-key": localAPIKey || "",
      },
    })

  if (!localAPIKey) return null

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <SidebarProvider>
        <div className="flex h-screen">
          <Sidebar className="w-full max-w-xs flex-col">
            <SidebarContent className="flex flex-1 flex-col">
              <ChatSidebar
                messages={messages}
                input={input}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </SidebarContent>
          </Sidebar>
          <SidebarInset className="flex-1">
            <DisplaySection />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </section>
  )
}
