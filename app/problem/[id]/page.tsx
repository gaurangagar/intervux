"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";

import Navbar from "@/src/components/navbar";
import ProblemDescription from "@/src/components/problemDescription";
import CodeEditorPanel from "@/src/components/codeEditorPanel";
import OutputPanel from "@/src/components/outputPanel";

import { problems } from "@/src/data/problems";
import { codeExecutionApi } from "@/src/services/execute-api";
import { language_config } from "@/src/data/problems";

interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
}

export default function ProblemPage() {
  const router = useRouter();
  const params = useParams();

  const problemId = params.id as string;

  const currentProblem = problems[problemId];

  const [selectedLanguage, setSelectedLanguage] =
    useState<keyof typeof language_config>("cpp");

  const [code, setCode] = useState("");

  const [output, setOutput] =
    useState<ExecutionResult | null>(null);

  const [isRunning, setIsRunning] =
    useState(false);

  /* ---------------------------- Load Problem ---------------------------- */

  useEffect(() => {
    if (!currentProblem) return;

    setCode(
      currentProblem.starterCode[selectedLanguage]
    );

    setOutput(null);
  }, [problemId]);

  /* --------------------------- Invalid Problem -------------------------- */

  if (!currentProblem) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">
          Problem not found.
        </p>
      </div>
    );
  }

  /* -------------------------- Language Change --------------------------- */

  function handleLanguageChange(
    e: React.ChangeEvent<HTMLSelectElement>
  ) {
    const language = e.target.value as keyof typeof language_config;

    setSelectedLanguage(language);

    setCode(
      currentProblem.starterCode[language]
    );

    setOutput(null);
  }

  /* --------------------------- Problem Change --------------------------- */

  function handleProblemChange(
    id: string
  ) {
    router.push(`/problem/${id}`);
  }

  /* ------------------------------ Helpers ------------------------------- */

  function celebrate() {
    confetti({
      particleCount: 80,
      spread: 220,
      origin: {
        x: 0.2,
        y: 0.6,
      },
    });

    confetti({
      particleCount: 80,
      spread: 220,
      origin: {
        x: 0.8,
        y: 0.6,
      },
    });
  }

  function normalizeOutput(
    output: string
  ) {
    return output
      .trim()
      .split("\n")
      .map((line) =>
        line
          .trim()
          .replace(/\[\s+/g, "[")
          .replace(/\s+\]/g, "]")
          .replace(/\s*,\s*/g, ",")
      )
      .filter(Boolean)
      .join("\n");
  }

  function testsPassed(
    actual: string,
    expected: string
  ) {
    return (
      normalizeOutput(actual) ===
      normalizeOutput(expected)
    );
  }

  /* ----------------------------- Run Code ------------------------------- */

  async function handleRunCode() {
    try {
      setIsRunning(true);
      setOutput(null);

      const result =
        await codeExecutionApi.execute({
          language: selectedLanguage,
          code,
        });

      setOutput(result);

      if (!result.success) {
        toast.error(
          "Code execution failed."
        );
        return;
      }

      const expectedOutput =
        currentProblem.expectedOutput[
          selectedLanguage
        ];

      if (!expectedOutput) {
        toast.error(
          "Expected output unavailable."
        );
        return;
      }

      if (
        testsPassed(
          result.output ?? "",
          expectedOutput
        )
      ) {
        celebrate();
        toast.success(
          "All tests passed!"
        );
      } else {
        toast.error(
          "Tests failed."
        );
      }
    } catch (error) {
      console.error(error);

      toast.error(
        "Something went wrong."
      );
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <Navbar />

      <div className="flex-1 overflow-hidden">
        <PanelGroup orientation="horizontal">

          {/* Problem */}

          <Panel
            defaultSize={35}
            minSize={25}
          >
            <ProblemDescription
              problem={currentProblem}
              currentProblemId={problemId}
              onProblemChange={
                handleProblemChange
              }
              allProblems={Object.values(
                problems
              )}
            />
          </Panel>

          <PanelResizeHandle className="w-1 bg-border" />

          {/* Editor */}

          <Panel
            defaultSize={65}
            minSize={35}
          >
            <PanelGroup orientation="vertical">

              <Panel
                defaultSize={70}
                minSize={40}
              >
                <CodeEditorPanel
                  selectedLanguage={
                    selectedLanguage
                  }
                  code={code}
                  isRunning={
                    isRunning
                  }
                  onLanguageChange={
                    handleLanguageChange
                  }
                  onCodeChange={
                    (val) => setCode(val ?? "")
                  }
                  onRunCode={
                    handleRunCode
                  }
                />
              </Panel>

              <PanelResizeHandle className="h-1 bg-border" />

              <Panel
                defaultSize={30}
                minSize={20}
              >
                <OutputPanel
                  output={output}
                />
              </Panel>

            </PanelGroup>
          </Panel>

        </PanelGroup>
      </div>
    </div>
  );
}