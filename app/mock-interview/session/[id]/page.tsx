'use client';

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";
import Navbar from "@/src/components/navbar";
import CodeEditorPanel from "@/src/components/codeEditorPanel";
import OutputPanel from "@/src/components/outputPanel";
import FeedbackModal from "@/src/components/feedbackModal";
import VideoCallUI from "@/src/components/videocallUI";

import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";

import {
  StreamCall,
  StreamVideo,
} from "@stream-io/video-react-sdk";

import {
  Loader2,
  LogOut,
  PhoneOff,
} from "lucide-react";

import { problems } from "@/src/data/problems";
import { getDifficultyBadgeClass } from "@/src/lib/frontend/getDifficultyBadgeClass";
import { useStreamClient } from "@/src/hooks/use-stream-client";
import { executeCode } from "@/src/lib/frontend/piston";
import ProblemDescription from "@/src/components/problemDescription";
import {
  sessionApi,
  type Session,
  type FeedbackRatings,
} from "@/src/services/session-api";

export default function SessionPage() {
  const router = useRouter();

  const params = useParams();

  const sessionId = params.id as string;

  const { user } = useUser();

  const { getToken } = useAuth();

  const socketRef = useRef<Socket | null>(null);

  const [session, setSession] =
    useState<Session | null>(null);

  const [loadingSession, setLoadingSession] =
    useState(true);

  const [output, setOutput] =
    useState<any>(null);

  const [isRunning, setIsRunning] =
    useState(false);

  const [showFeedbackModal, setShowFeedbackModal] =
    useState(false);

  const [isSubmittingFeedback, setIsSubmittingFeedback] =
    useState(false);

  const [selectedLanguage, setSelectedLanguage] =
    useState<"javascript" | "cpp" | "python" | "java">("javascript");

  const [code, setCode] =
    useState("");

  const [isFullscreen, setIsFullscreen] =
    useState(false);

  const isHost =
    session?.host?.clerkId === user?.id;

  const isParticipant =
    session?.participant?.clerkId ===
    user?.id;

  const problemData =
    session?.problem
      ? Object.values(problems).find(
        (problem) =>
          problem.title ===
          session.problem
      )
      : undefined;

  const {
    call,
    channel,
    chatClient,
    streamClient,
    isInitializingCall,
  } = useStreamClient({
    session,
    loadingSession,
    isHost,
    isParticipant,
  });

  const fetchSession = async () => {
    try {
      setLoadingSession(true);

      const token = await getToken();

      if (!token) {
        toast.error("Authentication required.");
        router.push("/");
        return;
      }

      const data = await sessionApi.getSessionById(
        token,
        sessionId
      );

      setSession(data);
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ??
        "Failed to load session."
      );

      router.push("/dashboard");
    } finally {
      setLoadingSession(false);
    }
  };

  useEffect(() => {
    if (!sessionId) return;

    fetchSession();
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL!,
      {
        transports: ["websocket"],
      }
    );

    socketRef.current = socket;

    socket.emit("join-session", sessionId);

    socket.on("session-updated", (updatedSession: Session) => {
      setSession(updatedSession);
    });

    socket.on("participant-joined", (updatedSession: Session) => {
      setSession(updatedSession);

      toast.success("Participant joined.");
    });

    socket.on("participant-left", (updatedSession: Session) => {
      setSession(updatedSession);

      toast("Participant left the session.");
    });

    socket.on("session-ended", () => {
      toast.success("Session ended.");

      router.push("/dashboard");
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionId, router]);

  useEffect(() => {
    if (!problemData) return;

    const starter =
      problemData.starterCode[
      selectedLanguage as keyof typeof problemData.starterCode
      ];

    if (starter) {
      setCode(starter);
      setOutput(null);
    }
  }, [problemData, selectedLanguage]);

  const handleLanguageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedLanguage(e.target.value as "javascript" | "cpp" | "python" | "java");
  };

  const handleCodeChange = (value?: string) => {
    setCode(value ?? "");
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error("Code cannot be empty.");
      return;
    }

    try {
      setIsRunning(true);
      setOutput(null);

      const result = await executeCode(
        selectedLanguage,
        code
      );

      setOutput(result);

      if (result.success) {
        toast.success("Code executed successfully.");
      } else {
        toast.error(result.error || "Execution failed.");
      }
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.message ?? "Failed to execute code."
      );
    } finally {
      setIsRunning(false);
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener(
      "fullscreenchange",
      handler
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handler
      );
    };
  }, []);

  const handleLeaveSession = async () => {
    try {
      const token = await getToken();

      if (!token || !session) return;

      await sessionApi.endSession(
        token,
        session.id
      );

      toast.success("Session ended.");

      router.push("/dashboard");
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ??
        "Failed to end session."
      );
    }
  };

  const handleSubmitFeedback = async (
    sessionId: string,
    ratings: FeedbackRatings
  ) => {
    try {
      setIsSubmittingFeedback(true);
      const token = await getToken();
      if (!token) {
        toast.error("Authentication required.");
        return;
      }
      await sessionApi.submitFeedback(token, sessionId, ratings);
      toast.success("Feedback submitted successfully.");
      setShowFeedbackModal(false);
      router.push("/dashboard");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ??
        "Failed to submit feedback."
      );
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (loadingSession || isInitializingCall) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session || !problemData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">
          Session not found.
        </p>
      </div>
    );
  }

  const mainContent = (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <div className="flex-1 overflow-hidden">
        <PanelGroup orientation="horizontal">

          {/* LEFT PANEL */}

          <Panel defaultSize={60} minSize={35}>
            <PanelGroup orientation="vertical">

              {/* Problem */}

              <Panel defaultSize={45}>
                <ProblemDescription
                  problem={problemData}
                  currentProblemId={problemData.id}
                  onProblemChange={() => { }}
                  allProblems={Object.values(problems)}
                />
              </Panel>

              <PanelResizeHandle className="h-2 bg-border" />

              {/* Editor + Output */}

              <Panel defaultSize={55}>
                <PanelGroup orientation="vertical">

                  <Panel defaultSize={70}>
                    <CodeEditorPanel
                      selectedLanguage={selectedLanguage}
                      code={code}
                      isRunning={isRunning}
                      onLanguageChange={handleLanguageChange}
                      onCodeChange={handleCodeChange}
                      onRunCode={handleRunCode}
                    />
                  </Panel>

                  <PanelResizeHandle className="h-2 bg-border" />

                  <Panel defaultSize={30}>
                    <OutputPanel output={output} />
                  </Panel>

                </PanelGroup>
              </Panel>

            </PanelGroup>
          </Panel>

          <PanelResizeHandle className="w-2 bg-border" />

          {/* RIGHT PANEL */}

          <Panel defaultSize={40} minSize={25}>
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div>
                  <h2 className="font-semibold text-lg">
                    Live Session
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    {session.problem}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`badge ${getDifficultyBadgeClass(
                      session.difficulty
                    )}`}
                  >
                    {session.difficulty}
                  </span>

                  <button
                    onClick={toggleFullscreen}
                    className="btn btn-outline btn-sm"
                  >
                    {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  </button>

                  {isHost && (
                    <button
                      onClick={handleLeaveSession}
                      className="btn btn-destructive btn-sm gap-2"
                    >
                      <PhoneOff className="h-4 w-4" />
                      End Session
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                <VideoCallUI
                  chatClient={chatClient}
                  channel={channel}
                />
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {showFeedbackModal && session && (
        <FeedbackModal
          isOpen={showFeedbackModal}
          sessionId={session.id}
          candidateName={
            session.participant?.name ??
            "Candidate"
          }
          isSubmitting={isSubmittingFeedback}
          onSubmitFeedback={handleSubmitFeedback}
          onFeedbackSubmitted={() => {
            setShowFeedbackModal(false);
            router.push("/dashboard");
          }}
        />
      )}
    </div>
  );

  if (streamClient && call) {
    return (
      <StreamVideo client={streamClient}>
        <StreamCall call={call}>
          {mainContent}
        </StreamCall>
      </StreamVideo>
    );
  }

  return mainContent;
}