"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Code2,
  Loader2,
  Lock,
  Mail,
  Send,
  User,
  X,
} from "lucide-react";
import { problems } from "../data/problems";

interface InviteConfig {
  problem: string;
  difficulty: "easy" | "medium" | "hard" | "";
  inviteeEmail: string;
}

interface InviteSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSending: boolean;
  onSendInvite: (
    config: InviteConfig,
    options?: {
      onSuccess?: () => void;
    }
  ) => void;
}

const INITIAL_CONFIG: InviteConfig = {
  problem: "",
  difficulty: "",
  inviteeEmail: "",
};

export default function InviteSessionModal({
  isOpen,
  onClose,
  onSendInvite,
  isSending,
}: InviteSessionModalProps) {
  const problemsList = Object.values(problems);

  const [config, setConfig] =
    useState<InviteConfig>(INITIAL_CONFIG);

  const [inviteSent, setInviteSent] =
    useState(false);

  const [sentToEmail, setSentToEmail] =
    useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!config.problem || !config.inviteeEmail) return;

    onSendInvite(config, {
      onSuccess: () => {
        setSentToEmail(config.inviteeEmail);
        setInviteSent(true);
      },
    });
  };

  const handleClose = () => {
    if (isSending) return;

    setConfig(INITIAL_CONFIG);
    setInviteSent(false);
    setSentToEmail("");

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border bg-background shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {inviteSent ? (
          <>
            {/* Success */}
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-semibold">
                Invitation Sent
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Your private interview session has been created.
              </p>
            </div>

            <div className="space-y-6 p-6">
              <div className="flex flex-col items-center text-center">
                <CheckCircle2 className="mb-4 h-12 w-12 text-green-600" />

                <p className="font-medium">
                  Invitation sent to
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {sentToEmail}
                </p>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4">
                <h3 className="mb-3 font-medium">
                  Next Steps
                </h3>

                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    • The candidate must sign in using
                    the same email.
                  </li>

                  <li>
                    • They should open the invitation
                    link from their email.
                  </li>

                  <li>
                    • The invitation expires after the
                    session ends.
                  </li>

                  <li>
                    • The coding problem remains hidden
                    until they join.
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end border-t px-6 py-4">
              <button
                onClick={handleClose}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold">
                  Private Session
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Invite a candidate to a private coding
                  interview.
                </p>
              </div>

              <button
                onClick={handleClose}
                disabled={isSending}
                className="rounded-md p-2 hover:bg-muted disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-6 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Problem
                </label>

                <select
                  value={config.problem}
                  onChange={(e) => {
                    const selected =
                      problemsList.find(
                        (problem) =>
                          problem.title ===
                          e.target.value
                      );

                    if (!selected) return;

                    setConfig((prev) => ({
                      ...prev,
                      problem: selected.title,
                      difficulty:
                        selected.difficulty.toLowerCase() as
                          | "easy"
                          | "medium"
                          | "hard",
                    }));
                  }}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">
                    Select a coding problem
                  </option>

                  {problemsList.map((problem) => (
                    <option
                      key={problem.id}
                      value={problem.title}
                    >
                      {problem.title} •{" "}
                      {problem.difficulty}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Candidate Email
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    type="email"
                    placeholder="candidate@example.com"
                    value={config.inviteeEmail}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        inviteeEmail:
                          e.target.value,
                      }))
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      handleSubmit()
                    }
                    className="w-full rounded-lg border bg-background py-2 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {config.problem && (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-muted-foreground" />

                    <h3 className="font-medium">
                      Session Summary
                    </h3>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Problem
                      </span>

                      <span>{config.problem}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Difficulty
                      </span>

                      <span className="capitalize">
                        {config.difficulty}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Participants
                      </span>

                      <span>2</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Visibility
                      </span>

                      <span className="inline-flex items-center gap-1">
                        <Lock className="h-3.5 w-3.5" />
                        Private
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse gap-3 border-t px-6 py-4 sm:flex-row sm:justify-end">
              <button
                onClick={handleClose}
                disabled={isSending}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={
                  isSending ||
                  !config.problem ||
                  !config.inviteeEmail
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Create & Send Invite
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}