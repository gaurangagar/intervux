"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import {
  ArrowRight,
  Lock,
  Plus,
} from "lucide-react";

interface WelcomeSectionProps {
  onCreateSession: () => void;
  onInviteSession: () => void;
}

export default function WelcomeSection({
  onCreateSession,
  onInviteSession,
}: WelcomeSectionProps) {
  const { user } = useUser();

  return (
    <section className="flex flex-col gap-8 rounded-xl border bg-background p-8 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm text-muted-foreground">
          Welcome back
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {user?.firstName ?? "Developer"}
        </h1>

        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Create a collaborative coding session or invite a
          candidate for a private technical interview.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onCreateSession}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          Create Session
        </button>

        <button
          onClick={onInviteSession}
          className="inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium"
        >
          <Lock className="h-4 w-4" />
          Private Session
        </button>
      </div>
    </section>
  );
}