"use client";

import {
  Code2,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import  { problems } from "../data/problems";

interface RoomConfig {
  problem: string;
  difficulty: "easy" | "medium" | "hard" | "";
}

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomConfig: RoomConfig;
  setRoomConfig: React.Dispatch<React.SetStateAction<RoomConfig>>;
  onCreateRoom: () => void;
  isCreating: boolean;
}

export default function CreateSessionModal({
  isOpen,
  onClose,
  roomConfig,
  setRoomConfig,
  onCreateRoom,
  isCreating,
}: CreateSessionModalProps) {
  const problemsList = Object.values(problems);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-xl rounded-xl border bg-background shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">
              Create Session
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Select a coding problem to start a collaborative
              interview session.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-md p-2 hover:bg-muted"
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
              value={roomConfig.problem}
              onChange={(e) => {
                const selectedProblem = problemsList.find(
                  (problem) =>
                    problem.title === e.target.value
                );

                if (!selectedProblem) return;

                setRoomConfig({
                  problem: selectedProblem.title,
                  difficulty: selectedProblem.difficulty.toLowerCase() as "easy" | "medium" | "hard",
                });
              }}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
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
                  {problem.difficulty.charAt(0).toUpperCase() +
                    problem.difficulty.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {roomConfig.problem && (
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

                  <span>{roomConfig.problem}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Difficulty
                  </span>

                  <span className="capitalize">
                    {roomConfig.difficulty}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Participants
                  </span>

                  <span>2</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm font-medium"
          >
            Cancel
          </button>

          <button
            onClick={onCreateRoom}
            disabled={
              isCreating || !roomConfig.problem
            }
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Session
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}