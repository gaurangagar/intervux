'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
    FileTextIcon,
    Loader2Icon,
    StarIcon,
    ThumbsUpIcon,
    TrendingUpIcon,
    MessageSquareIcon,
    CheckCircleIcon,
    AlertTriangleIcon
} from "lucide-react";
import Navbar from "@/src/components/navbar";
import { Interview, interviewApi } from "@/src/services/mockInterview-api";
import toast from "react-hot-toast";

interface InterviewFeedback {
    score: number;

    communication: string;

    technicalKnowledge: string;

    confidence: string;

    problemSolving: string;

    strengths: string[];

    weaknesses: string[];

    suggestions: string[];
}

function ReportPage() {
    const { id } = useParams();
    const { getToken } = useAuth();
    const router = useRouter();

    const [interview, setInterview] = useState<Interview | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchInterviewData();
    }, [id]);

    const fetchInterviewData = async () => {
        try {
            const token = await getToken();
            if (!token) {
                toast.error("Authentication required");
                return;
            }
            const data =
                await interviewApi.getInterviewById(token, id as string);

            if (data.status !== "completed") {
                toast.error("Interview is not completed yet.");
                router.push(`/mock-interview/session/${id}`);
                return;
            }

            setInterview(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load interview report");
            router.push("/mock-interview/history");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <Loader2Icon className="size-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!interview) return null;

    const feedback = interview.feedback as InterviewFeedback | undefined;

    return (
        <div className="min-h-screen bg-base-200 pb-20">
            <Navbar />

            <div className="max-w-5xl mx-auto p-6 mt-10 space-y-8">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <FileTextIcon className="size-8 text-primary" />
                            <h1 className="text-4xl font-bold">Performance Report</h1>
                        </div>
                        <p className="text-base-content/60 text-lg">
                            {interview.role} ({interview.experience} Years) - {interview.interviewType} Interview
                        </p>
                    </div>
                    <Link href="/mock-interview/history" className="btn btn-outline">
                        Back to History
                    </Link>
                </div>

                {/* OVERALL SCORE */}
                <div className="card bg-base-100 shadow-xl border border-base-300">
                    <div className="card-body items-center text-center py-10">
                        <h2 className="text-2xl font-bold mb-6">Overall Score</h2>
                        <div className="relative size-48 flex items-center justify-center rounded-full bg-base-200 shadow-inner">
                            <div className="absolute inset-0 rounded-full border-[12px] border-primary/20"></div>
                            <div
                                className="absolute inset-0 rounded-full border-[12px] border-primary border-t-transparent border-r-transparent rotate-45"
                                style={{ transform: `rotate(${((feedback?.score ?? 0) / 10) * 360 - 90}deg)` }}
                            ></div>
                            <div className="text-center z-10">
                                <span className="text-6xl font-black text-primary">{feedback?.score || 0}</span>
                                <span className="text-2xl text-base-content/50">/10</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* METRICS GRID */}
                <div className="grid md:grid-cols-2 gap-6">
                    <MetricCard
                        icon={<MessageSquareIcon className="size-6 text-info" />}
                        title="Communication"
                        text={feedback?.communication}
                    />
                    <MetricCard
                        icon={<StarIcon className="size-6 text-warning" />}
                        title="Technical Knowledge"
                        text={feedback?.technicalKnowledge}
                    />
                    <MetricCard
                        icon={<ThumbsUpIcon className="size-6 text-success" />}
                        title="Confidence"
                        text={feedback?.confidence}
                    />
                    <MetricCard
                        icon={<TrendingUpIcon className="size-6 text-secondary" />}
                        title="Problem Solving"
                        text={feedback?.problemSolving}
                    />
                </div>

                {/* STRENGTHS AND WEAKNESSES */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="card bg-base-100 shadow-sm border border-base-300">
                        <div className="card-body">
                            <h3 className="text-xl font-bold text-success flex items-center gap-2 mb-4">
                                <CheckCircleIcon className="size-5" /> Strengths
                            </h3>
                            <ul className="space-y-3">
                                {feedback?.strengths?.map((item: string, idx: number) => (
                                    <li key={idx} className="flex gap-3">
                                        <span className="text-success mt-1">•</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="card bg-base-100 shadow-sm border border-base-300">
                        <div className="card-body">
                            <h3 className="text-xl font-bold text-error flex items-center gap-2 mb-4">
                                <AlertTriangleIcon className="size-5" /> Areas for Improvement
                            </h3>
                            <ul className="space-y-3">
                                {feedback?.weaknesses?.map((item: string, idx: number) => (
                                    <li key={idx} className="flex gap-3">
                                        <span className="text-error mt-1">•</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* SUGGESTIONS */}
                <div className="card bg-base-100 shadow-sm border border-base-300">
                    <div className="card-body">
                        <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                            <TrendingUpIcon className="size-5 text-primary" /> Actionable Suggestions
                        </h3>
                        <div className="grid gap-4">
                            {feedback?.suggestions?.map((item: string, idx: number) => (
                                <div key={idx} className="p-4 bg-base-200 rounded-lg">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

interface MetricCardProps {
    icon: React.ReactNode;
    title: string;
    text?: string;
}

function MetricCard({
    icon,
    title,
    text,
}: MetricCardProps) {
    return (
        <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-base-200 rounded-lg">{icon}</div>
                    <h3 className="font-bold text-lg">{title}</h3>
                </div>
                <p className="text-base-content/80 leading-relaxed">{text}</p>
            </div>
        </div>
    );
}

export default ReportPage;