"use client";

import "./skyfire-theme.css";
import React, { useEffect, useState } from "react";
import { useChat } from "ai/react";
import { AnimatePresence, motion } from "framer-motion";

import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  useLoadingState,
  useSkyfire,
  useSkyfireAPIKey,
  useSkyfireState,
  useSkyfireTOSAgreement,
} from "../context/context";
import { Toaster } from "../custom-shadcn/ui/toaster";
import { usdAmount } from "../util";
import { ApiKeyConfig } from "./api-key-config";
import { APIKeyConfigWithTOS } from "./api-key-config-with-tos";
import LoadingImageWidget from "./loadingImage";
import { WalletInterface } from "./wallet";

interface TOSObject {
  name: string;
  tos?: string;
  link?: string;
}

interface SkyfireWidgetProps {
  tos: TOSObject;
}

export default function SkyfireWidget({ tos }: SkyfireWidgetProps) {
  const { localAPIKey, isReady } = useSkyfireAPIKey();
  const { tosAgreed } = useSkyfireTOSAgreement();
  const { getClaimByReferenceID } = useSkyfire();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const aiChatProps = useChat({
    headers: {
      "skyfire-api-key": localAPIKey || "",
    },
    onResponse: (response: Response) => {
      const paymentReferenceId = response.headers.get(
        "skyfire-payment-reference-id"
      );
      getClaimByReferenceID(paymentReferenceId);
    },
    onError: (error: Error) => {
      console.error("Chat Error:", error);
      setErrorMessage(error.message || "An error occurred during the chat.");
    },
  });

  const { error } = useSkyfireState();
  const loading = useLoadingState();
  const { balance } = useSkyfireState();

  const [isDialogOpen, setIsDialogOpen] = useState(
    isReady && (!localAPIKey || (tos && !tosAgreed))
  );
  const [showWidget, setShowWidget] = useState(
    isReady && !!localAPIKey && (!tos || tosAgreed)
  );

  useEffect(() => {
    if (isReady) {
      const shouldShowDialog = !localAPIKey || (tos && !tosAgreed);
      const shouldShowWidget = !!localAPIKey && (!tos || tosAgreed);

      setIsDialogOpen(shouldShowDialog);
      setShowWidget(shouldShowWidget);
    }
  }, [localAPIKey, tosAgreed, isReady, tos]);

  // Force widget visibility for debugging
  const forceShow = true;

  return (
    <div className="skyfire-theme">
      <Dialog open={isDialogOpen || !!error}>
        <DialogOverlay />
        <DialogContent className="skyfire-theme sm:max-w-[425px]">
          {tos ? (
            <APIKeyConfigWithTOS error={error} tos={tos} />
          ) : (
            <ApiKeyConfig error={error} />
          )}
        </DialogContent>
      </Dialog>
      {(showWidget || forceShow) && (
        <Popover>
          <PopoverTrigger asChild>
            <div className="fixed bottom-4 right-4 z-50 rounded-full bg-primary p-2 text-primary-foreground shadow-lg cursor-pointer">
              <div className="flex items-center space-x-2">
                <LoadingImageWidget
                  src="https://imagedelivery.net/WemO4_3zZlyNq-8IGpxrAQ/9b7b7f1c-a4b7-4777-c7ff-c92b50865600/public"
                  alt="Skyfire Logo"
                  size={50}
                  loading={!!loading}
                />
                <span className="hidden md:inline text-xl font-semibold">
                  {usdAmount(balance?.escrow.available || "0")}
                </span>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="w-full md:max-w-[800px] md:w-[800px] bg-transparent border-none p-0"
            align="end"
            side="top"
          >
            <WalletInterface
              aiChatProps={aiChatProps}
              errorMessage={errorMessage}
            />
          </PopoverContent>
        </Popover>
      )}
      <Toaster />
    </div>
  );
}
