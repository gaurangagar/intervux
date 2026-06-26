"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  BriefcaseBusiness,
  Code2,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/problems",
    label: "Problems",
    icon: BookOpen,
  },
  {
    href: "/mock-interview",
    label: "Mock Interview",
    icon: BriefcaseBusiness,
  },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-muted">
            <Code2 className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Intervux
            </h1>

            <p className="text-xs text-muted-foreground">
              AI Interview Platform
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {label}
                </span>
              </Link>
            );
          })}

          <div className="ml-4">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9",
                },
              }}
            />
          </div>
        </nav>
      </div>
    </header>
  );
}