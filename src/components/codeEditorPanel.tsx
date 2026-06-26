"use client";

import Editor from "@monaco-editor/react";
import { Loader2, Play } from "lucide-react";
import { language_config } from "../data/problems";

interface LanguageConfig {
  name: string;
  icon: string;
  monacoLang: string;
}

interface CodeEditorPanelProps {
  selectedLanguage: keyof typeof language_config;
  code: string;
  isRunning: boolean;
  onLanguageChange: (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => void;
  onCodeChange: (value: string | undefined) => void;
  onRunCode: () => void;
}

export default function CodeEditorPanel({
  selectedLanguage,
  code,
  isRunning,
  onLanguageChange,
  onCodeChange,
  onRunCode,
}: CodeEditorPanelProps) {
  const language =
    language_config[selectedLanguage];

  return (
    <div className="flex h-full flex-col rounded-xl border bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b px-5 py-3">
        <div className="flex items-center gap-3">
          <img
            src={language.icon}
            alt={language.name}
            className="h-5 w-5"
          />

          <select
            value={selectedLanguage}
            onChange={onLanguageChange}
            className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {(Object.entries(language_config) as [string, LanguageConfig][]).map(([key, lang]) => (
              <option
                key={key}
                value={key}
              >
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onRunCode}
          disabled={isRunning}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run Code
            </>
          )}
        </button>
      </div>

      {/* Monaco */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language.monacoLang}
          value={code}
          onChange={onCodeChange}
          theme="vs-dark"
          options={{
            fontSize: 15,
            fontFamily:
              "'JetBrains Mono', 'Fira Code', monospace",

            automaticLayout: true,
            scrollBeyondLastLine: false,

            minimap: {
              enabled: false,
            },

            lineNumbers: "on",

            roundedSelection: false,

            renderLineHighlight: "line",

            scrollbar: {
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },

            padding: {
              top: 16,
            },
          }}
        />
      </div>
    </div>
  );
}