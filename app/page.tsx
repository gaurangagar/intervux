"use client";

import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  Layers,
  Sparkles,
  Video,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function HomePage() {

  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);
  return (
    <div className="min-h-screen bg-background">

      {/* NAVBAR */}

      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>

            <div>
              <p className="font-mono text-lg font-bold">
                Intervux
              </p>

              <p className="text-xs text-muted-foreground">
                Where Coding Meets Symbiosis
              </p>
            </div>
          </Link>

          <SignInButton mode="modal">
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">
              Get Started

              <ArrowRight className="h-4 w-4" />
            </button>
          </SignInButton>

        </div>
      </header>

      {/* HERO */}

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">

        <div>

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
            <Zap className="h-4 w-4 text-primary" />
            Real-time Collaboration
          </div>

          <h1 className="text-5xl font-bold leading-tight lg:text-7xl">

            <span className="text-primary">
              Code Together,
            </span>

            <br />

            Where Coding Meets Symbiosis

          </h1>

          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Collaborate on coding interviews,
            practice DSA, communicate over
            live video and solve problems
            together in real time.
          </p>

          {/* Feature Pills */}

          <div className="mt-8 flex flex-wrap gap-3">

            <div className="rounded-full border px-4 py-2 text-sm">
              <Check className="mr-2 inline h-4 w-4 text-green-600" />
              Live Video
            </div>

            <div className="rounded-full border px-4 py-2 text-sm">
              <Check className="mr-2 inline h-4 w-4 text-green-600" />
              Collaborative Editor
            </div>

            <div className="rounded-full border px-4 py-2 text-sm">
              <Check className="mr-2 inline h-4 w-4 text-green-600" />
              Multi Language
            </div>

          </div>

          {/* CTA */}

          <div className="mt-10 flex flex-wrap gap-4">

            <SignInButton mode="modal">
              <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground">

                Start Coding

                <ArrowRight className="h-5 w-5" />

              </button>
            </SignInButton>

            {/* <button className="inline-flex items-center gap-2 rounded-lg border px-6 py-3 font-medium">

              <Video className="h-5 w-5" />

              Watch Demo

            </button> */}

          </div>

          {/* Stats */}

          <div className="mt-12 grid grid-cols-3 gap-6 rounded-xl border p-6">

            <div>
              <p className="text-3xl font-bold text-primary">
                10K+
              </p>

              <p className="text-sm text-muted-foreground">
                Active Users
              </p>
            </div>

            <div>
              <p className="text-3xl font-bold">
                50K+
              </p>

              <p className="text-sm text-muted-foreground">
                Sessions
              </p>
            </div>

            <div>
              <p className="text-3xl font-bold">
                99.9%
              </p>

              <p className="text-sm text-muted-foreground">
                Uptime
              </p>
            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_220px]">

          {/* HERO IMAGE */}

          <div className="overflow-hidden rounded-2xl border bg-card">

            <img
              src="/hero.png"
              alt="Intervux Platform"
              className="h-auto w-full object-cover"
            />

          </div>

          {/* SIDE CARDS */}

          <div className="hidden flex-col gap-4 lg:flex">

            {/* AI Interview */}

            <SignInButton mode="modal">
              <button className="rounded-xl border bg-card p-5 text-left transition-colors hover:border-primary">

                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <BrainCircuit className="h-6 w-6 text-primary" />
                </div>

                <h3 className="font-semibold">
                  AI Mock Interview
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  Practice interviews with AI and
                  receive detailed feedback.
                </p>

                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
                  Try Now

                  <ArrowRight className="h-4 w-4" />
                </div>

              </button>
            </SignInButton>

            {/* DSA */}

            <SignInButton mode="modal">
              <button className="rounded-xl border bg-card p-5 text-left transition-colors hover:border-primary">

                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Layers className="h-6 w-6 text-primary" />
                </div>

                <h3 className="font-semibold">
                  Practice DSA
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  Solve curated coding problems with
                  live execution and multiple
                  languages.
                </p>

                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
                  Solve Now

                  <ArrowRight className="h-4 w-4" />
                </div>

              </button>
            </SignInButton>

          </div>

        </div>

      </section>

      {/* FEATURES */}

      <section className="mx-auto max-w-7xl px-6 py-20">

        <div className="mx-auto mb-16 max-w-2xl text-center">

          <h2 className="text-4xl font-bold">
            Everything You Need to{" "}
            <span className="text-primary">
              Succeed
            </span>
          </h2>

          <p className="mt-4 text-lg text-muted-foreground">
            Everything required for coding interviews,
            collaborative programming and AI-powered
            practice in one place.
          </p>

        </div>

        <div className="grid gap-8 md:grid-cols-3">

          {/* Card 1 */}

          <div className="rounded-2xl border bg-card p-8">

            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">

              <Video className="h-7 w-7 text-primary" />

            </div>

            <h3 className="text-xl font-semibold">
              HD Video Calls
            </h3>

            <p className="mt-3 text-muted-foreground leading-relaxed">
              Collaborate face-to-face with crystal
              clear audio and video during coding
              interviews.
            </p>

          </div>

          {/* Card 2 */}

          <div className="rounded-2xl border bg-card p-8">

            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">

              <Layers className="h-7 w-7 text-primary" />

            </div>

            <h3 className="text-xl font-semibold">
              Collaborative Editor
            </h3>

            <p className="mt-3 text-muted-foreground leading-relaxed">
              Solve coding problems together using a
              synchronized editor with support for
              multiple languages.
            </p>

          </div>

          {/* Card 3 */}

          <div className="rounded-2xl border bg-card p-8">

            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">

              <BrainCircuit className="h-7 w-7 text-primary" />

            </div>

            <h3 className="text-xl font-semibold">
              AI Mock Interviews
            </h3>

            <p className="mt-3 text-muted-foreground leading-relaxed">
              Practice with an AI interviewer,
              receive personalized feedback and
              improve before real interviews.
            </p>

          </div>

          {/* Card 4 */}

          <div className="rounded-2xl border bg-card p-8">

            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">

              <Sparkles className="h-7 w-7 text-primary" />

            </div>

            <h3 className="text-xl font-semibold">
              Private Sessions
            </h3>

            <p className="mt-3 text-muted-foreground leading-relaxed">
              Invite candidates securely using
              private interview links and conduct
              one-on-one sessions.
            </p>

          </div>

          {/* Card 5 */}

          <div className="rounded-2xl border bg-card p-8">

            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">

              <Zap className="h-7 w-7 text-primary" />

            </div>

            <h3 className="text-xl font-semibold">
              Instant Code Execution
            </h3>

            <p className="mt-3 text-muted-foreground leading-relaxed">
              Execute solutions instantly and verify
              outputs while collaborating with your
              teammate.
            </p>

          </div>

          {/* Card 6 */}

          <div className="rounded-2xl border bg-card p-8">

            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">

              <Check className="h-7 w-7 text-primary" />

            </div>

            <h3 className="text-xl font-semibold">
              Performance Reports
            </h3>

            <p className="mt-3 text-muted-foreground leading-relaxed">
              Receive detailed interview reports,
              AI feedback and actionable suggestions
              after every session.
            </p>

          </div>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="border-t bg-card">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">

          {/* Logo */}

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>

            <div>
              <p className="font-mono text-lg font-bold">
                CodeX
              </p>

              <p className="text-xs text-muted-foreground">
                Where Coding Meets Symbiosis
              </p>
            </div>
          </Link>

          {/* Navigation */}

          <div className="flex flex-wrap items-center gap-6 text-sm">

            <SignInButton mode="modal">
              <button className="hover:text-primary transition-colors">
                Get Started
              </button>
            </SignInButton>

            <SignInButton mode="modal">
              <button className="hover:text-primary transition-colors">
                Practice DSA
              </button>
            </SignInButton>

            <SignInButton mode="modal">
              <button className="hover:text-primary transition-colors">
                AI Interview
              </button>
            </SignInButton>

          </div>

          {/* Copyright */}

          <div className="text-center md:text-right">

            <p className="text-sm text-muted-foreground">
              Built for collaborative coding interviews.
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              © {new Date().getFullYear()} Intervux.
              All rights reserved.
            </p>

          </div>

        </div>

      </footer>

    </div>
  );
}