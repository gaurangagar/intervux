"use client";

import { getDifficultyBadgeClass } from "../lib/frontend/getDifficultyBadgeClass";

interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface Problem {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  description: {
    text: string;
    notes: string[];
  };
  examples: Example[];
  constraints: string[];
}

interface ProblemDescriptionProps {
  problem: Problem;
  currentProblemId: string;
  onProblemChange: (id: string) => void;
  allProblems: Problem[];
}

export default function ProblemDescription({
  problem,
  currentProblemId,
  onProblemChange,
  allProblems,
}: ProblemDescriptionProps) {
  return (
    <div className="h-full overflow-y-auto border-r bg-background">
      {/* Header */}
      <div className="border-b px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">
              {problem.title}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              {problem.category}
            </p>
          </div>

          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${getDifficultyBadgeClass(
              problem.difficulty
            )}`}
          >
            {problem.difficulty.charAt(0).toUpperCase() +
              problem.difficulty.slice(1)}
          </span>
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium">
            Change Problem
          </label>

          <select
            value={currentProblemId}
            onChange={(e) =>
              onProblemChange(e.target.value)
            }
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {allProblems.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.title} •{" "}
                {item.difficulty.charAt(0).toUpperCase() +
                  item.difficulty.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-8 p-6">
        {/* Description */}
        <section>
          <h2 className="mb-3 text-lg font-semibold">
            Description
          </h2>

          <div className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>{problem.description.text}</p>

            {problem.description.notes.map(
              (note, index) => (
                <p key={index}>{note}</p>
              )
            )}
          </div>
        </section>

        {/* Examples */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">
            Examples
          </h2>

          <div className="space-y-5">
            {problem.examples.map(
              (example, index) => (
                <div
                  key={index}
                  className="rounded-lg border p-4"
                >
                  <p className="mb-3 text-sm font-medium">
                    Example {index + 1}
                  </p>

                  <div className="space-y-3 font-mono text-sm">
                    <div>
                      <span className="font-semibold">
                        Input:
                      </span>

                      <pre className="mt-1 overflow-x-auto rounded bg-muted p-3">
                        {example.input}
                      </pre>
                    </div>

                    <div>
                      <span className="font-semibold">
                        Output:
                      </span>

                      <pre className="mt-1 overflow-x-auto rounded bg-muted p-3">
                        {example.output}
                      </pre>
                    </div>

                    {example.explanation && (
                      <div>
                        <span className="font-semibold">
                          Explanation:
                        </span>

                        <p className="mt-1 font-sans text-muted-foreground">
                          {example.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* Constraints */}
        <section>
          <h2 className="mb-3 text-lg font-semibold">
            Constraints
          </h2>

          <div className="rounded-lg border p-4">
            <ul className="space-y-2 text-sm">
              {problem.constraints.map(
                (constraint, index) => (
                  <li
                    key={index}
                    className="font-mono text-muted-foreground"
                  >
                    • {constraint}
                  </li>
                )
              )}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}