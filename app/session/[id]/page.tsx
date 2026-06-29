"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

import ReactMarkdown from "react-markdown";
import Editor from "@monaco-editor/react";
import toast from "react-hot-toast";

import {
    AlertCircle,
    Bot,
    CheckCircle2,
    Loader2,
    Mic,
    MicOff,
    MonitorUp,
    Play,
    Send,
    User,
    Video,
    VideoOff,
    Volume2,
    VolumeX,
} from "lucide-react";

import Navbar from "@/src/components/navbar";

import {
    interviewApi as mockInterviewApi,
    Interview,
    InterviewMessage,
} from "@/src/services/mockInterview-api";
import { codeExecutionApi } from "@/src/services/execute-api";

const SpeechRecognition =
    typeof window !== "undefined"
        ? ((window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition)
        : null;

function InterviewSessionPage() {
    const { id } = useParams();
    const { getToken } = useAuth();

    const router = useRouter();

    const [interview, setInterview] =
        useState<Interview | null>(null);

    const [messages, setMessages] =
        useState<InterviewMessage[]>([]);

    const isTechnical =
        interview?.interviewType === "Technical";

    const [currentInput, setCurrentInput] =
        useState("");

    const [isLoading, setIsLoading] =
        useState(true);

    const [isTyping, setIsTyping] =
        useState(false);

    const [isEnding, setIsEnding] =
        useState(false);

    const [isCameraOn, setIsCameraOn] =
        useState(false);

    const [isScreenShared, setIsScreenShared] =
        useState(false);

    const [code, setCode] = useState(
        "// Write your code here...\n"
    );

    const [language, setLanguage] =
        useState("javascript");

    const [output, setOutput] =
        useState("");

    const [isRunning, setIsRunning] =
        useState(false);

    const [isListening, setIsListening] =
        useState(false);

    const [isAiVoiceMuted, setIsAiVoiceMuted] =
        useState(false);
    const videoRef =
        useRef<HTMLVideoElement>(null);

    const screenRef =
        useRef<HTMLVideoElement>(null);

    const cameraStreamRef =
        useRef<MediaStream | null>(null);

    const screenStreamRef =
        useRef<MediaStream | null>(null);

    const recognitionRef =
        useRef<any>(null);

    const messagesEndRef =
        useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        fetchInterviewData();

        if (SpeechRecognition) {
            const recognition =
                new SpeechRecognition();

            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = "en-US";

            recognition.onresult = (
                event: any
            ) => {
                let transcript = "";

                for (
                    let i = event.resultIndex;
                    i < event.results.length;
                    i++
                ) {
                    if (event.results[i].isFinal) {
                        transcript +=
                            event.results[i][0].transcript;
                    }
                }

                if (transcript) {
                    setCurrentInput((prev) =>
                        `${prev} ${transcript}`.trim()
                    );
                }
            };

            recognition.onerror = (
                event: any
            ) => {
                console.error(event);

                setIsListening(false);

                if (event.error !== "no-speech") {
                    toast.error(
                        `Microphone error: ${event.error}`
                    );
                }
            };

            recognition.onend = () =>
                setIsListening(false);

            recognitionRef.current =
                recognition;
        }

        return () => {
            recognitionRef.current?.stop();

            window.speechSynthesis.cancel();

            cameraStreamRef.current
                ?.getTracks()
                .forEach((track) =>
                    track.stop()
                );

            screenStreamRef.current
                ?.getTracks()
                .forEach((track) =>
                    track.stop()
                );
        };
    }, []);

    function speakText(text: string) {
        if (isAiVoiceMuted) return;

        window.speechSynthesis.cancel();

        const utterance =
            new SpeechSynthesisUtterance(
                text
                    .replace(/[*_#`]/g, "")
                    .trim()
            );

        const voices =
            window.speechSynthesis.getVoices();

        const englishVoice =
            voices.find(
                (voice) =>
                    voice.lang.startsWith("en") &&
                    (voice.name.includes("Google") ||
                        voice.name.includes("Samantha"))
            );

        if (englishVoice) {
            utterance.voice =
                englishVoice;
        }

        utterance.rate = 1;

        utterance.pitch = 1;

        window.speechSynthesis.speak(
            utterance
        );
    }

    function toggleListening() {
        if (!recognitionRef.current) {
            toast.error(
                "Speech Recognition is not supported."
            );

            return;
        }

        if (isListening) {
            recognitionRef.current.stop();

            setIsListening(false);

            return;
        }

        try {
            recognitionRef.current.start();

            setIsListening(true);
        } catch (err) {
            console.error(err);
        }
    }

    const toggleCamera = async () => {
        if (isCameraOn) {
            if (cameraStreamRef.current) {
                cameraStreamRef.current.getTracks().forEach(track => track.stop());
                cameraStreamRef.current = null;
            }
            if (videoRef.current) videoRef.current.srcObject = null;
            setIsCameraOn(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                cameraStreamRef.current = stream;
                if (videoRef.current) videoRef.current.srcObject = stream;
                setIsCameraOn(true);
            } catch {
                toast.error("Could not access camera");
            }
        }
    };

    const toggleScreenShare = async () => {
        if (isScreenShared) {
            if (screenStreamRef.current) {
                screenStreamRef.current.getTracks().forEach(track => track.stop());
                screenStreamRef.current = null;
            }
            if (screenRef.current) screenRef.current.srcObject = null;
            setIsScreenShared(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                screenStreamRef.current = stream;
                if (screenRef.current) screenRef.current.srcObject = stream;
                stream.getVideoTracks()[0].onended = () => {
                    setIsScreenShared(false);
                    screenStreamRef.current = null;
                    if (screenRef.current) screenRef.current.srcObject = null;
                };
                setIsScreenShared(true);
            } catch {
                toast.error("Could not access screen share");
            }
        }
    };

    async function runCode() {
        if (!code.trim()) return;

        try {
            setIsRunning(true);
            setOutput("Executing...");

            const result =
                await codeExecutionApi.execute({
                    language,
                    code,
                });

            if (result.success) {
                setOutput(result.output);
            } else {
                setOutput(
                    result.error ??
                    "Execution failed."
                );
            }
        } catch (error) {
            console.error(error);

            setOutput("Execution failed.");
        } finally {
            setIsRunning(false);
        }
    }

    async function fetchInterviewData() {
        try {
            const token =
                await getToken();

            if (!token) return;

            const data =
                await mockInterviewApi.getInterviewById(
                    token,
                    id as string
                );

            setInterview(data);

            setMessages(
                data.conversation ?? []
            );

            if (
                data.conversation?.length === 0 &&
                data.status !== "completed"
            ) {
                fetchNextQuestion();
            }
        } catch (error: any) {
            console.error(error);

            toast.error(
                error.response?.data?.error ??
                "Failed to load interview."
            );

            router.push(
                "/mock-interview"
            );
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchNextQuestion() {
        try {
            setIsTyping(true);

            const token =
                await getToken();

            if (!token) return;

            const data =
                await mockInterviewApi.getNextQuestion(
                    token,
                    id as string
                );

            setMessages((prev) => [
                ...prev,
                {
                    role: "interviewer",
                    content: data.message,
                },
            ]);

            speakText(data.message);
        } catch (error: any) {
            console.error(error);

            toast.error(
                error.response?.data?.error ??
                "Failed to fetch question."
            );
        } finally {
            setIsTyping(false);
        }
    }

    async function handleSendMessage(
        e: React.FormEvent
    ) {
        e.preventDefault();

        if (
            !currentInput.trim() &&
            !code.trim()
        )
            return;

        if (
            isListening &&
            recognitionRef.current
        ) {
            recognitionRef.current.stop();

            setIsListening(false);
        }

        const answer =
            currentInput.trim() ||
            "I have updated my code.";

        setCurrentInput("");

        setMessages((prev) => [
            ...prev,
            {
                role: "candidate",
                content: answer,
            },
        ]);

        try {
            setIsTyping(true);

            const token =
                await getToken();

            if (!token) return;

            await mockInterviewApi.submitAnswer(
                token,
                id as string,
                {
                    answer,
                    code: interview?.interviewType ===
                        "Technical"
                        ? code
                        : undefined,
                }
            );

            const next =
                await mockInterviewApi.getNextQuestion(
                    token,
                    id as string
                );

            setMessages((prev) => [
                ...prev,
                {
                    role: "interviewer",
                    content:
                        next.message,
                },
            ]);

            speakText(
                next.message
            );
        } catch (error: any) {
            console.error(error);

            toast.error(
                error.response?.data?.error ??
                "Failed to submit answer."
            );
        } finally {
            setIsTyping(false);
        }
    }

    async function handleEndInterview() {
        const confirmed =
            window.confirm(
                "End interview?"
            );

        if (!confirmed) return;

        try {
            setIsEnding(true);

            window.speechSynthesis.cancel();

            recognitionRef.current?.stop();

            const token =
                await getToken();

            if (!token) return;

            await mockInterviewApi.endInterview(
                token,
                id as string
            );

            toast.success(
                "Interview completed!"
            );

            router.push(
                `/mock-interview/report/${id}`
            );
        } catch (error: any) {
            console.error(error);

            toast.error(
                error.response?.data?.error ??
                "Failed to end interview."
            );

            setIsEnding(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (interview?.status === "completed") {
        return (
            <div className="flex min-h-screen flex-col bg-background">
                <Navbar />

                <main
                    className={`mx-auto flex h-[calc(100vh-72px)] w-full gap-6 p-6 ${isTechnical
                        ? "max-w-[1800px]"
                        : "max-w-5xl"
                        }`}
                >
                    {/* LEFT PANEL */}

                    <section
                        className={`flex flex-col gap-4 ${isTechnical
                            ? "w-[420px]"
                            : "flex-1"
                            }`}
                    >
                        {/* Video */}

                        <div
                            className={`grid gap-3 ${isTechnical
                                ? "grid-cols-2 h-36"
                                : "grid-cols-2 h-64"
                                }`}
                        >
                            {/* Camera */}

                            <div className="relative overflow-hidden rounded-xl border bg-black">
                                {isCameraOn ? (
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        muted
                                        className="h-full w-full scale-x-[-1] object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                                        <VideoOff className="mb-2 h-8 w-8" />
                                        <span className="text-xs">
                                            Camera Off
                                        </span>
                                    </div>
                                )}

                                <button
                                    onClick={toggleCamera}
                                    className="absolute bottom-2 left-2 rounded-lg bg-background/80 p-2"
                                >
                                    {isCameraOn ? (
                                        <VideoOff className="h-4 w-4" />
                                    ) : (
                                        <Video className="h-4 w-4" />
                                    )}
                                </button>

                                <div className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-[10px] text-white">
                                    You
                                </div>
                            </div>

                            {/* Screen */}

                            <div className="relative overflow-hidden rounded-xl border bg-black">
                                {isScreenShared ? (
                                    <video
                                        ref={screenRef}
                                        autoPlay
                                        muted
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                                        <MonitorUp className="mb-2 h-8 w-8" />
                                        <span className="text-xs">
                                            Screen
                                        </span>
                                    </div>
                                )}

                                <button
                                    onClick={
                                        toggleScreenShare
                                    }
                                    className="absolute bottom-2 right-2 rounded-lg bg-background/80 p-2"
                                >
                                    <MonitorUp className="h-4 w-4" />
                                </button>

                                <div className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-[10px] text-white">
                                    Screen
                                </div>
                            </div>
                        </div>

                        {/* Chat */}

                        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border bg-background">

                            {/* Header */}

                            <div className="flex items-center justify-between border-b px-4 py-3">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                        <Bot className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <p className="font-medium">
                                            {interview?.interviewerName ??
                                                "AI Interviewer"}
                                        </p>

                                        <p className="text-xs text-green-600">
                                            ● Online
                                        </p>
                                    </div>

                                </div>

                                <div className="flex gap-2">

                                    <button
                                        onClick={() => {
                                            setIsAiVoiceMuted(
                                                !isAiVoiceMuted
                                            );

                                            if (!isAiVoiceMuted) {
                                                window.speechSynthesis.cancel();
                                            }
                                        }}
                                        className="rounded-lg border p-2"
                                    >
                                        {isAiVoiceMuted ? (
                                            <VolumeX className="h-4 w-4" />
                                        ) : (
                                            <Volume2 className="h-4 w-4" />
                                        )}
                                    </button>

                                    <button
                                        onClick={
                                            handleEndInterview
                                        }
                                        disabled={
                                            isEnding ||
                                            isTyping
                                        }
                                        className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white"
                                    >
                                        {isEnding ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            "End"
                                        )}
                                    </button>

                                </div>
                            </div>

                            {/* Messages */}

                            <div className="flex-1 overflow-y-auto p-4">

                                {messages.length === 0 &&
                                    !isTyping && (
                                        <div className="mt-10 text-center text-muted-foreground">
                                            <AlertCircle className="mx-auto mb-3 h-8 w-8" />

                                            Connecting...
                                        </div>
                                    )}

                                <div className="space-y-4">

                                    {messages.map(
                                        (message, index) => (
                                            <div
                                                key={index}
                                                className={`flex ${message.role ===
                                                    "candidate"
                                                    ? "justify-end"
                                                    : "justify-start"
                                                    }`}
                                            >
                                                <div
                                                    className={`max-w-[80%] rounded-xl px-4 py-3 ${message.role ===
                                                        "candidate"
                                                        ? "bg-primary text-primary-foreground"
                                                        : "border bg-muted"
                                                        }`}
                                                >
                                                    <ReactMarkdown>
                                                        {message.content}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        )
                                    )}

                                    {isTyping && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            AI is typing...
                                        </div>
                                    )}

                                    <div
                                        ref={
                                            messagesEndRef
                                        }
                                    />
                                </div>

                            </div>

                            {/* Input */}

                            <form
                                onSubmit={
                                    handleSendMessage
                                }
                                className="flex gap-2 border-t p-4"
                            >

                                <button
                                    type="button"
                                    onClick={
                                        toggleListening
                                    }
                                    className="rounded-lg border p-2"
                                >
                                    {isListening ? (
                                        <MicOff className="h-5 w-5 text-red-600" />
                                    ) : (
                                        <Mic className="h-5 w-5" />
                                    )}
                                </button>

                                <input
                                    value={currentInput}
                                    onChange={(e) =>
                                        setCurrentInput(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Type your answer..."
                                    className="flex-1 rounded-lg border px-3 py-2 outline-none"
                                />

                                <button
                                    className="rounded-lg bg-primary p-3 text-primary-foreground"
                                >
                                    <Send className="h-4 w-4" />
                                </button>

                            </form>

                        </div>
                    </section>

                    {/* RIGHT PANEL */}

                    {isTechnical && (
                        <section className="flex flex-1 flex-col overflow-hidden rounded-xl border bg-background">

                            {/* Header */}

                            <div className="flex items-center justify-between border-b px-4 py-3">

                                <select
                                    value={language}
                                    onChange={(e) =>
                                        setLanguage(e.target.value)
                                    }
                                    className="rounded-lg border px-3 py-2 text-sm outline-none"
                                >
                                    <option value="javascript">
                                        JavaScript
                                    </option>

                                    <option value="python">
                                        Python
                                    </option>

                                    <option value="java">
                                        Java
                                    </option>

                                    <option value="cpp">
                                        C++
                                    </option>
                                </select>

                                <button
                                    onClick={runCode}
                                    disabled={
                                        isRunning ||
                                        !code.trim()
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                                >
                                    {isRunning ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Running...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="h-4 w-4" />
                                            Run Code
                                        </>
                                    )}
                                </button>

                            </div>

                            {/* Monaco */}

                            <div className="flex-1">

                                <Editor
                                    height="100%"
                                    language={language}
                                    theme="vs-dark"
                                    value={code}
                                    onChange={(value) =>
                                        setCode(value ?? "")
                                    }
                                    options={{
                                        minimap: {
                                            enabled: false,
                                        },
                                        fontSize: 14,
                                        automaticLayout: true,
                                        wordWrap: "on",
                                        scrollBeyondLastLine: false,
                                    }}
                                />

                            </div>

                            {/* Output */}

                            <div className="h-52 border-t bg-muted/30">

                                <div className="border-b px-4 py-2 text-sm font-semibold">
                                    Execution Output
                                </div>

                                <div className="h-full overflow-auto p-4">

                                    {output ? (
                                        <pre className="whitespace-pre-wrap font-mono text-sm">
                                            {output}
                                        </pre>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Run your code to see the output.
                                        </p>
                                    )}

                                </div>

                            </div>

                        </section>
                    )}

                </main>

            </div>
        );
    }
}

export default InterviewSessionPage;
