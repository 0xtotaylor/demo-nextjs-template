import { Message } from "ai"

import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import { ChatSidebar } from "./chat-sidebar"
import { DisplaySection } from "./display-section"

interface ChatLayoutProps {
  messages: Message[]
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSendMessage: (e: React.FormEvent) => void
}

export function ChatLayout({
  messages,
  input,
  handleInputChange,
  handleSendMessage,
}: ChatLayoutProps) {
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
                handleSendMessage={handleSendMessage}
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
