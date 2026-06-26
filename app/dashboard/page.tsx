"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";

import Navbar from "@/src/components/navbar";
import WelcomeSection from "@/src/components/welcomeSection";
import StatsCards from "@/src/components/statsCard";
import ActiveSessions from "@/src/components/activeSession";
import RecentSessions from "@/src/components/recentSession";
import CreateSessionModal from "@/src/components/createSessionModal";
import InviteSessionModal from "@/src/components/inviteSessionModal";

import {
  sessionApi,
  CreatePrivateSessionData,
  CreateSessionData,
  Session,
  CreatePrivateSessionResponse,
} from "@/src/services/session-api";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();

  /* ----------------------------- Modal State ----------------------------- */

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  /* ----------------------------- Form State ------------------------------ */

  const [roomConfig, setRoomConfig] = useState<CreateSessionData>({
    problem: "",
    difficulty: "",
  });

  /* ----------------------------- Data State ------------------------------ */

  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);

  /* ---------------------------- Loading State ---------------------------- */

  const [loadingActiveSessions, setLoadingActiveSessions] =
    useState(true);

  const [loadingRecentSessions, setLoadingRecentSessions] =
    useState(true);

  const [isCreating, setIsCreating] =
    useState(false);

  const [isSendingInvite, setIsSendingInvite] =
    useState(false);

  /* --------------------------- Pending Invite ---------------------------- */

  useEffect(() => {
    const pendingToken =
      localStorage.getItem("pendingInviteToken");

    if (!pendingToken) return;

    localStorage.removeItem("pendingInviteToken");

    router.replace(`/join/${pendingToken}`);
  }, [router]);

  /* ----------------------------- Load Data ------------------------------- */

  useEffect(() => {
    async function loadDashboard() {
      try {
        const token = await getToken();

        if (!token) return;

        setLoadingActiveSessions(true);
        setLoadingRecentSessions(true);

        const [activeData, recentData] =
          await Promise.all([
            sessionApi.getActiveSessions(token),
            sessionApi.getMyRecentSessions(token),
          ]);

        setActiveSessions(activeData.sessions);
        setRecentSessions(recentData.sessions);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load dashboard.");
      } finally {
        setLoadingActiveSessions(false);
        setLoadingRecentSessions(false);
      }
    }

    loadDashboard();
  }, [getToken]);

  /* ------------------------- Create Public Session ----------------------- */

  async function handleCreateRoom() {
    if (!roomConfig.problem || !roomConfig.difficulty)
      return;

    try {
      const token = await getToken();

      if (!token) return;

      setIsCreating(true);

      const data =
        await sessionApi.createSession(
          token,
          roomConfig
        );

      setShowCreateModal(false);

      router.push(`/session/${data.session.id}`);
    } catch (error:any) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ??
          "Failed to create session."
      );
    } finally {
      setIsCreating(false);
    }
  }

  /* ------------------------- Create Private Session ---------------------- */

  async function handleSendInvite(
    config: CreatePrivateSessionData,
    { onSuccess }: {
      onSuccess?: (data: CreatePrivateSessionResponse) => void;
    }
  ) {
    try {
      const token = await getToken();
      if (!token) return;

      setIsSendingInvite(true);

      const data =
        await sessionApi.createPrivateSession(
          token,
          config
        );

      onSuccess?.(data);

      router.push(`/session/${data.session.id}`);
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ??
          "Failed to send invitation."
      );
    } finally {
      setIsSendingInvite(false);
    }
  }

  /* ---------------------------- Helper ---------------------------------- */

  function isUserInSession(
    session: Session
  ) {
    if (!user) return false;

    return (
      session.host?.clerkId === user.id ||
      session.participant?.clerkId === user.id
    );
  }
    return (
    <>
      <div className="min-h-screen bg-background">
        <Navbar />

        <WelcomeSection
          onCreateSession={() =>
            setShowCreateModal(true)
          }
          onInviteSession={() =>
            setShowInviteModal(true)
          }
        />

        <main className="mx-auto max-w-7xl px-6 pb-12">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <StatsCards
              activeSessionsCount={
                activeSessions.length
              }
              recentSessionsCount={
                recentSessions.length
              }
            />

            <ActiveSessions
              sessions={activeSessions}
              isLoading={
                loadingActiveSessions
              }
              isUserInSession={
                isUserInSession
              }
            />
          </div>

          <div className="mt-8">
            <RecentSessions
              sessions={recentSessions}
              isLoading={
                loadingRecentSessions
              }
            />
          </div>
        </main>
      </div>

      {/* Create Session */}

      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() =>
          setShowCreateModal(false)
        }
        roomConfig={roomConfig}
        setRoomConfig={setRoomConfig}
        onCreateRoom={handleCreateRoom}
        isCreating={isCreating}
      />

      {/* Private Session */}

      <InviteSessionModal
        isOpen={showInviteModal}
        onClose={() =>
          setShowInviteModal(false)
        }
        onSendInvite={(config, options) =>
          handleSendInvite(config, {
            onSuccess: (data) => {
              options?.onSuccess?.();
            },
          })
        }
        isSending={isSendingInvite}
      />
    </>
  );
}