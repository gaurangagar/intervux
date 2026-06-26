'use client';

import Link from "next/link";
import { ChevronRight, Code2 } from "lucide-react";

import Navbar from "@/src//components/navbar";
import { problems } from "@/src/data/problems";
import { getDifficultyBadgeClass } from "@/src/lib/frontend/getDifficultyBadgeClass";

export default function ProblemsPage() {
  const problemsList = Object.values(problems);

  const stats = problemsList.reduce(
    (acc, problem) => {
      switch (problem.difficulty.toLowerCase()) {
        case "easy":
          acc.easy++;
          break;
        case "medium":
          acc.medium++;
          break;
        case "hard":
          acc.hard++;
          break;
      }

      return acc;
    },
    {
      easy: 0,
      medium: 0,
      hard: 0,
    }
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold">
            Practice Problems
          </h1>

          <p className="mt-2 text-muted-foreground">
            Improve your problem-solving skills with
            curated interview questions.
          </p>
        </div>

        {/* Problems */}
        <div className="space-y-4">
          {problemsList.map((problem) => (
            <Link
              key={problem.id}
              href={`/problem/${problem.id}`}
              className="block rounded-xl border bg-background transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center justify-between gap-6 p-6">
                <div className="flex min-w-0 flex-1 gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border bg-muted">
                    <Code2 className="h-6 w-6" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-semibold">
                        {problem.title}
                      </h2>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${getDifficultyBadgeClass(
                          problem.difficulty
                        )}`}
                      >
                        {problem.difficulty}
                      </span>
                    </div>

                    <p className="mb-2 text-sm text-muted-foreground">
                      {problem.category}
                    </p>

                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {problem.description.text}
                    </p>
                  </div>
                </div>

                <div className="hidden items-center gap-2 text-sm font-medium text-primary md:flex">
                  Solve
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border bg-background p-5">
            <p className="text-sm text-muted-foreground">
              Total Problems
            </p>

            <h3 className="mt-2 text-3xl font-bold">
              {problemsList.length}
            </h3>
          </div>

          <div className="rounded-xl border bg-background p-5">
            <p className="text-sm text-muted-foreground">
              Easy
            </p>

            <h3 className="mt-2 text-3xl font-bold text-green-600">
              {stats.easy}
            </h3>
          </div>

          <div className="rounded-xl border bg-background p-5">
            <p className="text-sm text-muted-foreground">
              Medium
            </p>

            <h3 className="mt-2 text-3xl font-bold text-yellow-600">
              {stats.medium}
            </h3>
          </div>

          <div className="rounded-xl border bg-background p-5">
            <p className="text-sm text-muted-foreground">
              Hard
            </p>

            <h3 className="mt-2 text-3xl font-bold text-red-600">
              {stats.hard}
            </h3>
          </div>
        </div>
      </main>
    </div>
  );
}