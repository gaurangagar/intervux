import { authenticatedRequest } from "../lib/frontend/authenticated-request";

export interface CreateSessionData {
  problem: string;
  difficulty: "easy" | "medium" | "hard" | "";
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

export interface Session {
  id: string;

  problem: string;

  difficulty: "easy" | "medium" | "hard";

  status: "waiting" | "active" | "completed";

  callId: string;

  createdAt: string;

  updatedAt: string;

  host?: {
    clerkId: string;
    name: string;
    image?: string;
  };

  participant?: {
    clerkId: string;
    name: string;
    image?: string;
  };
}

export interface ActiveSessionsResponse {
  sessions: Session[];
}

export interface RecentSessionsResponse {
  sessions: Session[];
}

export interface CreateSessionResponse {
  session: Session;
}

export interface CreatePrivateSessionResponse {
  session: Session;
}

export interface JoinSessionResponse {
  session: Session;
}

export interface EndSessionResponse {
  session: Session;
}

export interface JoinByTokenResponse {
  sessionId: string;
}

export const sessionApi = {
  createSession: (token: string, data: CreateSessionData) =>
    authenticatedRequest<CreateSessionResponse>(token, {
      url: "/api/sessions",
      method: "POST",
      data,
    }),

  getActiveSessions: (token: string) =>
    authenticatedRequest<ActiveSessionsResponse>(token, {
      url: "/api/sessions/active",
      method: "GET",
    }),

  getMyRecentSessions: (token: string) =>
    authenticatedRequest<RecentSessionsResponse>(token, {
      url: "/api/sessions/my-recent",
      method: "GET",
    }),

  getSessionById: (token: string, id: string) =>
    authenticatedRequest<Session>(token, {
      url: `/api/sessions/${id}`,
      method: "GET",
    }),

  joinSession: (token: string, id: string) =>
    authenticatedRequest<JoinSessionResponse>(token, {
      url: `/api/sessions/${id}/join`,
      method: "POST",
    }),

  endSession: (token: string, id: string) =>
    authenticatedRequest<EndSessionResponse>(token, {
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
    authenticatedRequest<CreatePrivateSessionResponse>(token, {
      url: "/api/sessions/invite",
      method: "POST",
      data,
    }),

  joinByToken: (token: string, inviteToken: string) =>
    authenticatedRequest<JoinByTokenResponse>(token, {
      url: `/api/sessions/join-token/${inviteToken}`,
      method: "POST",
    }),

  submitFeedback: (
    token: string,
    sessionId: string,
    ratings: FeedbackRatings
  ) =>
    authenticatedRequest<{ message: string }>(token, {
      url: `/api/sessions/${sessionId}/feedback`,
      method: "POST",
      data: ratings,
    }),
};