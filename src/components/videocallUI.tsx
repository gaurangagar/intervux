"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  CallControls,
  CallingState,
  SpeakerLayout,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import {
  Channel,
  Chat,
  MessageComposer,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";

import {
  Loader2,
  MessageSquare,
  Users,
  X,
} from "lucide-react";

interface VideoCallUIProps {
  chatClient: any;
  channel: any;
}

export default function VideoCallUI({
  chatClient,
  channel,
}: VideoCallUIProps) {
  const router = useRouter();

  const {
    useCallCallingState,
    useParticipantCount,
  } = useCallStateHooks();

  const callingState = useCallCallingState();

  const participantCount =
    useParticipantCount();

  const [isChatOpen, setIsChatOpen] =
    useState(false);

  if (callingState === CallingState.JOINING) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Joining call...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full gap-4">
      {/* VIDEO */}

      <div className="flex flex-1 flex-col gap-4">

        <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">

          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />

            <span className="text-sm font-medium">
              {participantCount}{" "}
              {participantCount === 1
                ? "participant"
                : "participants"}
            </span>
          </div>

          {chatClient && channel && (
            <button
              onClick={() =>
                setIsChatOpen((prev) => !prev)
              }
              className="btn btn-outline btn-sm gap-2"
            >
              <MessageSquare className="h-4 w-4" />

              {isChatOpen
                ? "Hide Chat"
                : "Show Chat"}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-hidden rounded-lg border bg-muted">
          <SpeakerLayout />
        </div>

        <div className="rounded-lg border bg-card p-3">
          <CallControls
            onLeave={() =>
              router.push("/dashboard")
            }
          />
        </div>
      </div>

            {/* CHAT */}

      {chatClient && channel && (
        <div
          className={`overflow-hidden rounded-lg border bg-card transition-all duration-200 ${
            isChatOpen
              ? "w-80 opacity-100"
              : "w-0 opacity-0 border-0"
          }`}
        >
          {isChatOpen && (
            <Chat
              client={chatClient}
              theme="str-chat__theme-light"
            >
              <Channel channel={channel}>
                <div className="flex h-full flex-col">

                  {/* Header */}

                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <h3 className="font-semibold">
                      Session Chat
                    </h3>

                    <button
                      onClick={() =>
                        setIsChatOpen(false)
                      }
                      className="rounded-md p-2 hover:bg-muted"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Messages */}

                  <div className="flex-1 overflow-hidden">
                    <Window>
                      <MessageList />
                      <MessageComposer />
                    </Window>

                    <Thread />
                  </div>

                </div>
              </Channel>
            </Chat>
          )}
        </div>
      )}
    </div>
  );
}