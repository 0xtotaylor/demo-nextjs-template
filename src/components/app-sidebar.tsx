"use client";

import * as React from "react";
import Image from "next/image";
import { useChat } from "ai/react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSkyfireAPIKey } from "@/lib/skyfire-sdk/context/context";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { localAPIKey } = useSkyfireAPIKey();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
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
        console.log("Final message:", message.content);
      },
    });

  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!localAPIKey) return null;

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
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Image
                    src="/skyfire-logo.svg"
                    alt="Skyfire Logo"
                    width={24}
                    height={24}
                    className="size-6"
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
              className={`rounded-lg p-3 ${
                message.role === "assistant"
                  ? "text-black"
                  : "bg-[#0472fe] text-white"
              }`}
            >
              {message.content}
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
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            Send
          </Button>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}
