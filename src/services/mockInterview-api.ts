import { authenticatedRequest } from "../lib/frontend/authenticated-request";

export interface StartInterviewData {
  role: string;
  experience: number;
  interviewType: string;
  resume?: File;
}

export interface SubmitAnswerData {
  answer: string;
  code?: string;
}

export interface MockInterview {
  id: string;
  userId: string;
  interviewerName: string | null;
  role: string;
  experience: number;
  interviewType: string;
  resumeData?: any;
  conversation?: any;
  feedback?: any;
  status: "in_progress" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface InterviewMessage {
  role: "interviewer" | "candidate";
  content: string;
}

export type Interview = MockInterview;

export const interviewApi = {
  startMockInterview: (
    token: string,
    formData: FormData
  ) =>
    authenticatedRequest<MockInterview>(token, {
      url: "/api/interviews/start",
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  getNextQuestion: (
    token: string,
    interviewId: string
  ) =>
    authenticatedRequest<{ message: string }>(token, {
      url: `/api/interviews/${interviewId}/next`,
      method: "POST",
    }),

  submitAnswer: (
    token: string,
    interviewId: string,
    data: SubmitAnswerData
  ) =>
    authenticatedRequest<{ success: boolean }>(token, {
      url: `/api/interviews/${interviewId}/answer`,
      method: "POST",
      data,
    }),

  endInterview: (
    token: string,
    interviewId: string
  ) =>
    authenticatedRequest<MockInterview>(token, {
      url: `/api/interviews/${interviewId}/end`,
      method: "POST",
    }),

  getInterviewHistory: (token: string) =>
    authenticatedRequest<MockInterview[]>(token, {
      url: "/api/interviews/history",
      method: "GET",
    }),

  getInterviewById: (
    token: string,
    interviewId: string
  ) =>
    authenticatedRequest<MockInterview>(token, {
      url: `/api/interviews/${interviewId}`,
      method: "GET",
    }),
};