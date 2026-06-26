"use client";

import Link from "next/link";
import {
  Code2,
  Loader2,
  Users,
} from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/frontend/getDifficultyBadgeClass";

import { Session } from "@/src/services/session-api";

interface ActiveSessionsProps {
  sessions: Session[];
  isLoading: boolean;
  isUserInSession: (session: Session) => boolean;
}

export default function ActiveSessions({
  sessions,
  isLoading,
  isUserInSession,
}: ActiveSessionsProps) {
  return (
    <section className="rounded-xl border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold">
            Live Sessions
          </h2>

          <p className="text-sm text-muted-foreground">
            Join an active collaborative interview session.
          </p>
        </div>

        <div className="rounded-md border px-3 py-1 text-sm font-medium">
          {sessions.length} Active
        </div>
      </div>

      {/* Body */}
      <div className="max-h-[500px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading sessions...</span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Code2 className="mb-4 h-10 w-10 text-muted-foreground" />

            <h3 className="text-lg font-medium">
              No active sessions
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Create a new session to start collaborating.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {sessions.map((session) => {
              const isFull =
                !!session.participant &&
                !isUserInSession(session);

              return (
                <div
                  key={session.id}
                  className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between"
                >
                  {/* Left */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex items-center gap-3">
                      <h3 className="truncate text-lg font-semibold">
                        {session.problem}
                      </h3>

                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${getDifficultyBadgeClass(
                          session.difficulty
                        )}`}
                      >
                        {session.difficulty.charAt(0).toUpperCase() +
                          session.difficulty.slice(1)}
                      </span>
                    </div>

                    <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                      <div>
                        <span className="font-medium text-foreground">
                          Host
                        </span>

                        <p>{session.host?.name ?? "-"}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />

                        <span>
                          {session.participant ? "2 / 2" : "1 / 2"}{" "}
                          Participants
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                        isFull
                          ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"
                          : "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300"
                      }`}
                    >
                      {isFull ? "Full" : "Available"}
                    </span>

                    {isFull ? (
                      <button
                        disabled
                        className="rounded-lg border px-4 py-2 text-sm text-muted-foreground"
                      >
                        Full
                      </button>
                    ) : (
                      <Link
                        href={`/session/${session.id}`}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                      >
                        {isUserInSession(session)
                          ? "Rejoin"
                          : "Join"}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}