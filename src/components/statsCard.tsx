"use client";

import { Trophy, Users } from "lucide-react";

interface StatsCardsProps {
  activeSessionsCount: number;
  recentSessionsCount: number;
}

export default function StatsCards({
  activeSessionsCount,
  recentSessionsCount,
}: StatsCardsProps) {
  const stats = [
    {
      title: "Active Sessions",
      value: activeSessionsCount,
      icon: Users,
    },
    {
      title: "Total Sessions",
      value: recentSessionsCount,
      icon: Trophy,
    },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
      {stats.map(({ title, value, icon: Icon }) => (
        <div
          key={title}
          className="rounded-xl border bg-background p-6"
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border bg-muted">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          <h2 className="text-3xl font-semibold tracking-tight">
            {value}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {title}
          </p>
        </div>
      ))}
    </div>
  );
}