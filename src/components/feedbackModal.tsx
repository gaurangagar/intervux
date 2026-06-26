"use client";

import { useState } from "react";
import {
  ClipboardCheck,
  Loader2,
  Send,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";

interface FeedbackRatings {
  problemSolving: number;
  communication: number;
  codeQuality: number;
  timeManagement: number;
  overallImpression: number;
}

interface FeedbackModalProps {
  isOpen: boolean;
  sessionId: string;
  candidateName?: string;
  isSubmitting: boolean;
  onSubmitFeedback: (
    sessionId: string,
    ratings: FeedbackRatings
  ) => Promise<void>;
  onFeedbackSubmitted: () => void;
}

const FEEDBACK_PARAMS = [
  {
    key: "problemSolving",
    label: "Problem Solving",
    description:
      "Understanding the problem and choosing an approach.",
  },
  {
    key: "communication",
    label: "Communication",
    description:
      "Explaining ideas and discussing the solution.",
  },
  {
    key: "codeQuality",
    label: "Code Quality",
    description:
      "Readability, correctness and maintainability.",
  },
  {
    key: "timeManagement",
    label: "Time Management",
    description:
      "Using the interview time effectively.",
  },
  {
    key: "overallImpression",
    label: "Overall Impression",
    description:
      "Overall interview performance.",
  },
] as const;

const LABELS = [
  "",
  "Poor",
  "Fair",
  "Good",
  "Very Good",
  "Excellent",
];

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const [hovered, setHovered] =
    useState(0);

  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => {
        const active =
          star <= (hovered || value);

        return (
          <button
            key={star}
            type="button"
            onMouseEnter={() =>
              setHovered(star)
            }
            onMouseLeave={() =>
              setHovered(0)
            }
            onClick={() =>
              onChange(star)
            }
          >
            <Star
              className={`h-6 w-6 ${
                active
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        );
      })}

      <span className="ml-2 text-sm text-muted-foreground">
        {value
          ? LABELS[value]
          : "Not rated"}
      </span>
    </div>
  );
}

export default function FeedbackModal({
  isOpen,
  sessionId,
  candidateName,
  isSubmitting,
  onSubmitFeedback,
  onFeedbackSubmitted,
}: FeedbackModalProps) {
  const [ratings, setRatings] =
    useState<FeedbackRatings>({
      problemSolving: 0,
      communication: 0,
      codeQuality: 0,
      timeManagement: 0,
      overallImpression: 0,
    });

  if (!isOpen) return null;

  const allRated = Object.values(
    ratings
  ).every((rating) => rating > 0);

  const average = allRated
    ? (
        Object.values(ratings).reduce(
          (a, b) => a + b,
          0
        ) / 5
      ).toFixed(1)
    : null;

  async function handleSubmit() {
    if (!allRated) {
      toast.error(
        "Please rate every category."
      );
      return;
    }

    try {
      await onSubmitFeedback(
        sessionId,
        ratings
      );

      toast.success(
        "Feedback submitted successfully."
      );

      onFeedbackSubmitted();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Failed to submit feedback."
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border bg-background shadow-lg">

        {/* Header */}

        <div className="border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="h-6 w-6" />

            <div>
              <h2 className="text-lg font-semibold">
                Interview Feedback
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Please rate{" "}
                <strong>
                  {candidateName ??
                    "the candidate"}
                </strong>{" "}
                before ending the
                interview.
              </p>
            </div>
          </div>
        </div>

        {/* Notice */}

        <div className="border-b bg-muted/30 px-6 py-4 text-sm text-muted-foreground">
          This step is mandatory. An AI
          performance report will be
          generated after submission.
        </div>

        {/* Ratings */}

        <div className="space-y-5 p-6">
          {FEEDBACK_PARAMS.map(
            (item) => (
              <div
                key={item.key}
                className="rounded-lg border p-4"
              >
                <h3 className="font-medium">
                  {item.label}
                </h3>

                <p className="mt-1 mb-4 text-sm text-muted-foreground">
                  {item.description}
                </p>

                <StarRating
                  value={
                    ratings[item.key]
                  }
                  onChange={(
                    value
                  ) =>
                    setRatings(
                      (
                        prev
                      ) => ({
                        ...prev,
                        [item.key]:
                          value,
                      })
                    )
                  }
                />
              </div>
            )
          )}

          {average && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">
                Average Rating
              </p>

              <p className="mt-1 text-3xl font-bold">
                {average}
                <span className="text-base font-medium text-muted-foreground">
                  /5
                </span>
              </p>

              <p className="mt-3 text-sm text-muted-foreground">
                An AI-generated report
                will be sent to{" "}
                {candidateName ??
                  "the candidate"}.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}

        <div className="border-t px-6 py-4">
          <button
            onClick={handleSubmit}
            disabled={
              !allRated ||
              isSubmitting
            }
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Feedback
              </>
            )}
          </button>

          {!allRated && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Complete all ratings to
              continue.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}