import { authenticatedRequest } from "../lib/frontend/authenticated-request";

export interface CreateSessionData {
  problem: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface CreatePrivateSessionData extends CreateSessionData {
  inviteeEmail: string;
}

export interface FeedbackRatings {
  problemSolving: number;
  communication: number;
  codeQuality: number;
  timeManagement: number;
  overallImpression: number;
}

export interface StreamTokenResponse {
  token: string;
  userId: string;
  userName: string;
  userImage?: string;
}

export const sessionApi = {
  createSession: (token: string, data: CreateSessionData) =>
    authenticatedRequest(token, {
      url: "/api/sessions",
      method: "POST",
      data,
    }),

  getActiveSessions: (token: string) =>
    authenticatedRequest(token, {
      url: "/api/sessions/active",
      method: "GET",
    }),

  getMyRecentSessions: (token: string) =>
    authenticatedRequest(token, {
      url: "/api/sessions/my-recent",
      method: "GET",
    }),

  getSessionById: (token: string, id: string) =>
    authenticatedRequest(token, {
      url: `/api/sessions/${id}`,
      method: "GET",
    }),

  joinSession: (token: string, id: string) =>
    authenticatedRequest(token, {
      url: `/api/sessions/${id}/join`,
      method: "POST",
    }),

  endSession: (token: string, id: string) =>
    authenticatedRequest(token, {
      url: `/api/sessions/${id}/end`,
      method: "POST",
    }),

  getStreamToken: (token: string) =>
    authenticatedRequest<StreamTokenResponse>(token, {
      url: "/api/chat/token",
      method: "GET",
    }),

  createPrivateSession: (
    token: string,
    data: CreatePrivateSessionData
  ) =>
    authenticatedRequest(token, {
      url: "/api/sessions/invite",
      method: "POST",
      data,
    }),

  joinByToken: (token: string, inviteToken: string) =>
    authenticatedRequest(token, {
      url: `/api/sessions/join-token/${inviteToken}`,
      method: "GET",
    }),

  submitFeedback: (
    token: string,
    sessionId: string,
    ratings: FeedbackRatings
  ) =>
    authenticatedRequest(token, {
      url: `/api/sessions/${sessionId}/feedback`,
      method: "POST",
      data: ratings,
    }),
};