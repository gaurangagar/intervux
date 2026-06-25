import { authenticatedRequest } from "../lib/frontend/authenticated-request";

export interface StartInterviewData {
  role: string;
  experience: number;
  interviewType: string;
  resume?: File;
}

export interface SubmitAnswerData {
  answer: string;
  code: string;
}

export const interviewApi = {
  startMockInterview: (
    token: string,
    formData: FormData
  ) =>
    authenticatedRequest(token, {
      url: "/api/mock-interview/start",
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
    authenticatedRequest(token, {
      url: `/api/mock-interview/${interviewId}/next`,
      method: "POST",
    }),

  submitAnswer: (
    token: string,
    interviewId: string,
    data: SubmitAnswerData
  ) =>
    authenticatedRequest(token, {
      url: `/api/mock-interview/${interviewId}/answer`,
      method: "POST",
      data,
    }),

  endInterview: (
    token: string,
    interviewId: string
  ) =>
    authenticatedRequest(token, {
      url: `/api/mock-interview/${interviewId}/end`,
      method: "POST",
    }),

  getInterviewHistory: (token: string) =>
    authenticatedRequest(token, {
      url: "/api/mock-interview/history",
      method: "GET",
    }),

  getInterviewById: (
    token: string,
    interviewId: string
  ) =>
    authenticatedRequest(token, {
      url: `/api/mock-interview/${interviewId}`,
      method: "GET",
    }),
};