import { NextRequest, NextResponse } from "next/server";
import { env } from "@/src/lib/env";

const LANGUAGE_MAPPING = {
  cpp: { language: "cpp17", versionIndex: "1" },         // C++17
  javascript: { language: "nodejs", versionIndex: "4" }, // Node.js 17.x
  python: { language: "python3", versionIndex: "4" },    // Python 3.9
  java: { language: "java", versionIndex: "4" },         // JDK 17
} as const;

export async function POST(req: NextRequest) {
  try {
    const { language, code } = await req.json();

    const languageConfig =
      LANGUAGE_MAPPING[language as keyof typeof LANGUAGE_MAPPING];

    if (!languageConfig) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported language: ${language}`,
        },
        { status: 400 }
      );
    }

    const payload = {
      clientId: env.JDOODLE_CLIENT_ID,
      clientSecret: env.JDOODLE_CLIENT_SECRET,
      script: code,
      language: languageConfig.language,
      versionIndex: languageConfig.versionIndex,
    };

    const response = await fetch("https://api.jdoodle.com/v1/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `JDoodle API error: ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.error) {
      return NextResponse.json(
        {
          success: false,
          error: data.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        output: data.output || "No output",
        cpuTime: data.cpuTime,
        memory: data.memory,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Execution error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to execute code on server",
      },
      { status: 500 }
    );
  }
}