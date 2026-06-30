import { useEffect, useState } from "react";
import { StreamChat, Channel } from "stream-chat";
import {
  StreamVideoClient,
  Call,
} from "@stream-io/video-react-sdk";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { disconnectStreamClient, initializeStreamClient } from "../lib/frontend/stream-client";
import { sessionApi, type Session } from "@/src/services/session-api";

interface UseStreamClientProps {
  session: Session | null;
  loadingSession: boolean;
  isHost: boolean;
  isParticipant: boolean;
}

export function useStreamClient({
  session,
  loadingSession,
  isHost,
  isParticipant,
}: UseStreamClientProps) {
  const { getToken } = useAuth();

  const [streamClient, setStreamClient] =
    useState<StreamVideoClient | null>(null);

  const [call, setCall] = useState<Call | null>(null);

  const [chatClient, setChatClient] =
    useState<StreamChat | null>(null);

  const [channel, setChannel] =
    useState<Channel | null>(null);

  const [isInitializingCall, setIsInitializingCall] =
    useState(true);

  useEffect(() => {
    let videoCall: Call | null = null;
    let chatClientInstance: StreamChat | null = null;

    const initCall = async () => {
      if (!session?.callId) return;
      if (!isHost && !isParticipant) return;
      if (session.status === "completed") return;

      try {
        const clerkToken = await getToken();

        if (!clerkToken) {
          throw new Error("Failed to get Clerk token.");
        }

        const {
          token: streamToken,
          userId,
          userName,
          userImage,
        } = await sessionApi.getStreamToken(clerkToken);

        const client = await initializeStreamClient(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          streamToken
        );

        setStreamClient(client);

        videoCall = client.call("default", session.callId);

        await videoCall.join({
          create: true,
        });

        setCall(videoCall);

        const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

        chatClientInstance = StreamChat.getInstance(apiKey);

        await chatClientInstance.connectUser(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          streamToken
        );

        setChatClient(chatClientInstance);

        const chatChannel = chatClientInstance.channel(
          "messaging",
          session.callId
        );

        await chatChannel.watch();

        setChannel(chatChannel);
      } catch (error) {
        console.error(error);
        toast.error("Failed to join video call");
      } finally {
        setIsInitializingCall(false);
      }
    };

    if (session && !loadingSession) {
      initCall();
    }

    return () => {
      (async () => {
        try {
          await videoCall?.leave();
          await chatClientInstance?.disconnectUser();
          await disconnectStreamClient();
        } catch (error) {
          console.error("Cleanup error:", error);
        }
      })();
    };
  }, [
    session,
    loadingSession,
    isHost,
    isParticipant,
    getToken,
  ]);

  return {
    streamClient,
    call,
    chatClient,
    channel,
    isInitializingCall,
  };
}