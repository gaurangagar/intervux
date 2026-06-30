"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import {
  Briefcase,
  History,
  Loader2,
  Play,
  Upload,
} from "lucide-react";

import Navbar from "@/src/components/navbar";
import { interviewApi } from "@/src/services/mockInterview-api";

type InterviewType = "Technical" | "HR";

const EXPERIENCE_OPTIONS = Array.from(
  { length: 11 },
  (_, i) => i
);

export default function MockInterviewPage() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [role, setRole] =
    useState("Backend Developer");

  const [experience, setExperience] =
    useState(1);

  const [interviewType, setInterviewType] =
    useState<InterviewType>("Technical");

  const [resume, setResume] =
    useState<File | null>(null);

  const [isLoading, setIsLoading] =
    useState(false);

  async function handleStart(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!resume) {
      toast.error(
        "Please upload your resume."
      );
      return;
    }

    try {
      setIsLoading(true);

      const token = await getToken();

      if (!token) {
        toast.error(
          "Authentication required."
        );
        return;
      }

      const formData = new FormData();

      formData.append("role", role);
      formData.append(
        "experience",
        experience.toString()
      );
      formData.append(
        "interviewType",
        interviewType
      );
      formData.append(
        "resume",
        resume
      );

      const data =
        await interviewApi.startMockInterview(
          token,
          formData
        );

      toast.success(
        "Interview started!"
      );

      router.push(
        `/mock-interview/session/${data.id}`
      );
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.response?.data?.error ??
        "Failed to start interview."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleResumeChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) return;

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      toast.error(
        "Maximum file size is 5MB."
      );
      return;
    }

    setResume(file);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-4xl px-6 py-10">

        {/* Header */}

        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Briefcase className="h-8 w-8 text-primary" />

              <h1 className="text-3xl font-bold">
                Mock Interview
              </h1>
            </div>

            <p className="mt-2 text-muted-foreground">
              Practice AI-powered interviews
              tailored to your resume.
            </p>
          </div>

          <Link
            href="/mock-interview/history"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <History className="h-4 w-4" />
            History
          </Link>
        </div>

        {/* Form */}

        <div className="rounded-xl border bg-background">

          <form
            onSubmit={handleStart}
            className="space-y-8 p-6"
          >

            <div className="grid gap-6 md:grid-cols-2">

              {/* Role */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Target Role
                </label>

                <input
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value)
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Backend Developer"
                />
              </div>

              {/* Experience */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Experience
                </label>

                <select
                  value={experience}
                  onChange={(e) =>
                    setExperience(
                      Number(e.target.value)
                    )
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  {EXPERIENCE_OPTIONS.map(
                    (year) => (
                      <option
                        key={year}
                        value={year}
                      >
                        {year}{" "}
                        {year === 1
                          ? "Year"
                          : "Years"}
                      </option>
                    )
                  )}
                </select>
              </div>

            </div>

            {/* Interview Type */}

            <div>
              <label className="mb-3 block text-sm font-medium">
                Interview Type
              </label>

              <div className="flex gap-6">

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={
                      interviewType ===
                      "Technical"
                    }
                    onChange={() =>
                      setInterviewType(
                        "Technical"
                      )
                    }
                  />

                  Technical
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={
                      interviewType ===
                      "HR"
                    }
                    onChange={() =>
                      setInterviewType(
                        "HR"
                      )
                    }
                  />

                  HR / Behavioral
                </label>

              </div>
            </div>

            {/* Resume */}

            <div>

              <label className="mb-2 block text-sm font-medium">
                Resume
              </label>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-8 hover:bg-muted/40">

                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  hidden
                  onChange={
                    handleResumeChange
                  }
                />

                <Upload className="mb-3 h-8 w-8 text-primary" />

                {resume ? (
                  <>
                    <p className="font-medium">
                      {resume.name}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {(
                        resume.size /
                        1024
                      ).toFixed(1)}
                      KB
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">
                      Click to upload your
                      resume
                    </p>

                    <p className="text-sm text-muted-foreground">
                      PDF, DOC or DOCX
                    </p>
                  </>
                )}

              </label>

            </div>

            {/* Footer */}

            <div className="flex justify-end">

              <button
                type="submit"
                disabled={
                  isLoading
                }
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >

                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Preparing...
                  </>
                ) : (
                  <>
                    Start Interview
                    <Play className="h-4 w-4" />
                  </>
                )}

              </button>

            </div>

          </form>

        </div>
      </main>
    </div>
  );
}