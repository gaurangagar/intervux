'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { sessionApi } from "@/src/services/session-api";
import { LockIcon, Loader2Icon, XCircleIcon, ShieldCheckIcon, LogInIcon } from "lucide-react";

function JoinByTokenPage() {
  const { token } = useParams();
  const router = useRouter();
  const { isSignedIn, isLoaded, user } = useUser();
  const { getToken } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const inviteToken = (Array.isArray(token) ? token[0] : token) || "";

  useEffect(() => {
    // Only attempt join once Clerk has resolved the auth state
    if (!isLoaded) return;
    // Not signed in — the JSX below will show login prompt
    if (!isSignedIn) return;
    // Avoid re-triggering if already in progress or done
    if (joining || error) return;

    const performJoin = async () => {
      setJoining(true);
      try {
        const authToken = await getToken();
        if (!authToken) {
          setError("You must be logged in to join.");
          setJoining(false);
          return;
        }

        if (!inviteToken) {
          setError("No invite token provided.");
          setJoining(false);
          return;
        }

        const data = await sessionApi.joinByToken(authToken, inviteToken);
        router.replace(`/session/${data.sessionId}`);
      } catch (err: any) {
        setError(err.response?.data?.message || "Invalid or expired invite link.");
        setJoining(false);
      }
    };

    performJoin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, inviteToken]);

  // ── Loading clerk ────────────────────────────────────────────────────────────
  if (!isLoaded) {
    return <LoadingScreen message="Loading..." />;
  }

  // ── Not signed in → show a friendly prompt to go to homepage for login/signup ─
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-base-300 flex flex-col items-center justify-center px-4">
        <div className="card bg-base-100 shadow-2xl max-w-lg w-full">
          <div className="card-body items-center text-center">
            {/* Icon */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4">
              <LockIcon className="w-10 h-10 text-white" />
            </div>

            <h1 className="card-title text-2xl mb-2">
              Private Interview Invitation
            </h1>

            <p className="text-base-content/60 mb-6 leading-relaxed">
              You've been invited to a <strong className="text-base-content">private coding interview</strong> on Intervux.
              To join, you need to <strong className="text-base-content">log in or create an account</strong> with the
              email address that received this invitation.
            </p>

            {/* Info box */}
            <div className="alert text-sm text-left mb-6">
              <div>
                <p className="font-semibold mb-1">📌 Important:</p>
                <ul className="list-disc list-inside space-y-1 text-base-content/70">
                  <li>You must sign in with the <strong>same email</strong> that received the invite</li>
                  <li>If you're new to Intervux, you can create a free account</li>
                  <li>After signing in, you'll be redirected back here automatically</li>
                </ul>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 w-full">
              <button
                className="btn btn-primary gap-2 w-full text-base"
                onClick={() => {
                  // Save the invite token in sessionStorage so we can redirect back
                  localStorage.setItem("pendingInviteToken", inviteToken);
                  router.push("/");
                }}
              >
                <LogInIcon className="w-5 h-5" />
                Go to Login / Sign Up
              </button>

              <p className="text-xs text-base-content/40 text-center">
                You'll be redirected back to this invite after signing in
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-base-300 flex items-center justify-center px-4">
        <div className="card bg-base-100 shadow-2xl max-w-md w-full">
          <div className="card-body items-center text-center">
            <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center mb-4">
              <XCircleIcon className="w-10 h-10 text-error" />
            </div>
            <h2 className="card-title text-2xl mb-2">Cannot Join Session</h2>
            <p className="text-base-content/70 mb-2">{error}</p>
            {user?.primaryEmailAddress?.emailAddress && (
              <p className="text-xs text-base-content/40 mb-4">
                You are currently logged in as: <strong>{user.primaryEmailAddress.emailAddress}</strong>
              </p>
            )}
            <button
              className="btn btn-primary w-full"
              onClick={() => router.push("/dashboard")}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Joining in progress ──────────────────────────────────────────────────────
  return <LoadingScreen message="Verifying your invitation and joining the session..." />;
}

function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-base-300 flex flex-col items-center justify-center gap-6">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl">
        <ShieldCheckIcon className="w-10 h-10 text-white" />
      </div>
      <div className="text-center">
        <Loader2Icon className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
        <p className="text-base-content/70 text-lg font-medium">{message}</p>
        <p className="text-base-content/40 text-sm mt-1">Intervux Private Interview</p>
      </div>
    </div>
  );
}

export default JoinByTokenPage;