"use client";

import {
  Clock,
  Loader2,
  Users,
  History,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getDifficultyBadgeClass } from "../lib/frontend/getDifficultyBadgeClass";

import { Session } from "@/src/services/session-api";

interface RecentSessionsProps {
  sessions: Session[];
  isLoading: boolean;
}

export default function RecentSessions({
  sessions,
  isLoading,
}: RecentSessionsProps) {
  return (
    <section className="mt-8 rounded-xl border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold">
            Recent Sessions
          </h2>

          <p className="text-sm text-muted-foreground">
            Sessions you've participated in recently.
          </p>
        </div>

        <div className="rounded-md border px-3 py-1 text-sm font-medium">
          {sessions.length} Total
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading sessions...</span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <History className="mb-4 h-10 w-10 text-muted-foreground" />

          <h3 className="text-lg font-medium">
            No sessions yet
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            Your completed sessions will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="rounded-xl border bg-background p-5"
            >
              {/* Top */}
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h3 className="line-clamp-1 text-lg font-semibold">
                    {session.problem}
                  </h3>

                  <span
                    className={`mt-2 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${getDifficultyBadgeClass(
                      session.difficulty
                    )}`}
                  >
                    {session.difficulty.charAt(0).toUpperCase() +
                      session.difficulty.slice(1)}
                  </span>
                </div>

                <span
                  className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                    session.status === "active"
                      ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {session.status === "active"
                    ? "Active"
                    : "Completed"}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Started
                  </span>

                  <span>
                    {formatDistanceToNow(
                      new Date(session.createdAt),
                      {
                        addSuffix: true,
                      }
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Participants
                  </span>

                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {session.participant ? "2 / 2" : "1 / 2"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Finished
                  </span>

                  <span>
                    {new Date(
                      session.updatedAt
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}