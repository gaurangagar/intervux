"use client";

interface ExecutionOutput {
  success: boolean;
  output?: string;
  error?: string;
}

interface OutputPanelProps {
  output: ExecutionOutput | null;
}

export default function OutputPanel({
  output,
}: OutputPanelProps) {
  return (
    <div className="flex h-full flex-col rounded-xl border bg-background">
      {/* Header */}
      <div className="border-b px-5 py-3">
        <h2 className="text-sm font-semibold">
          Output
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-5">
        {!output ? (
          <p className="text-sm text-muted-foreground">
            Run your code to view the output.
          </p>
        ) : output.success ? (
          <pre className="whitespace-pre-wrap break-words rounded-lg bg-muted p-4 font-mono text-sm text-green-700 dark:text-green-300">
            {output.output || "Program executed successfully."}
          </pre>
        ) : (
          <div className="space-y-4">
            {output.output && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Output
                </p>

                <pre className="whitespace-pre-wrap break-words rounded-lg bg-muted p-4 font-mono text-sm">
                  {output.output}
                </pre>
              </div>
            )}

            {output.error && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-red-600 dark:text-red-400">
                  Error
                </p>

                <pre className="whitespace-pre-wrap break-words rounded-lg border border-red-200 bg-red-50 p-4 font-mono text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                  {output.error}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}