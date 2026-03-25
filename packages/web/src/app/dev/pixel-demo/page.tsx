"use client";

import { SessionCard } from "@/components/SessionCard";
import { OfficeScene } from "@/components/OfficeScene";
import type { DashboardSession, DashboardPR } from "@/lib/types";

function makeSession(overrides: Partial<DashboardSession> = {}): DashboardSession {
  return {
    id: "test-1",
    projectId: "my-app",
    status: "working",
    activity: "active",
    branch: "feat/test",
    issueId: "https://linear.app/test/issue/INT-100",
    issueUrl: "https://linear.app/test/issue/INT-100",
    issueLabel: "INT-100",
    issueTitle: null,
    summary: "Test session",
    summaryIsFallback: false,
    createdAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
    pr: null,
    metadata: {},
    ...overrides,
  };
}

function makePR(overrides: Partial<DashboardPR> = {}): DashboardPR {
  return {
    number: 100,
    url: "https://github.com/acme/app/pull/100",
    title: "feat: test PR",
    owner: "acme",
    repo: "app",
    branch: "feat/test",
    baseBranch: "main",
    isDraft: false,
    state: "open",
    additions: 50,
    deletions: 10,
    ciStatus: "passing",
    ciChecks: [
      { name: "build", status: "passed" },
      { name: "test", status: "passed" },
    ],
    reviewDecision: "approved",
    mergeability: {
      mergeable: true,
      ciPassing: true,
      approved: true,
      noConflicts: true,
      blockers: [],
    },
    unresolvedThreads: 0,
    unresolvedComments: [],
    ...overrides,
  };
}

const DEMO_SESSIONS: DashboardSession[] = [
  makeSession({
    id: "agent-alpha",
    activity: "active",
    status: "working",
    branch: "feat/auth-flow",
    summary: "Implementing OAuth2 authentication with Google provider",
    pr: makePR({
      number: 42,
      title: "feat: add OAuth2 authentication flow",
      additions: 320,
      deletions: 45,
      ciStatus: "passing",
      reviewDecision: "pending",
    }),
  }),
  makeSession({
    id: "agent-bravo",
    activity: "ready",
    status: "done",
    branch: "fix/memory-leak",
    summary: "Fixed WebSocket connection pool memory leak in production",
    pr: makePR({
      number: 38,
      title: "fix: resolve WS connection pool memory leak",
      additions: 28,
      deletions: 12,
      state: "open",
      reviewDecision: "approved",
      mergeability: {
        mergeable: true,
        ciPassing: true,
        approved: true,
        noConflicts: true,
        blockers: [],
      },
    }),
  }),
  makeSession({
    id: "agent-charlie",
    activity: "idle",
    status: "idle",
    branch: "refactor/db-layer",
    summary: "Refactoring database abstraction layer to support PostgreSQL",
    pr: makePR({
      number: 35,
      title: "refactor: database abstraction for multi-driver support",
      additions: 580,
      deletions: 210,
      ciStatus: "pending",
      reviewDecision: "pending",
    }),
  }),
  makeSession({
    id: "agent-delta",
    activity: "waiting_input",
    status: "working",
    branch: "feat/dark-mode",
    summary: "Need clarification on color palette for dark mode theme",
    pr: makePR({
      number: 41,
      title: "feat: dark mode theme support",
      additions: 145,
      deletions: 30,
      ciStatus: "passing",
      reviewDecision: "changes_requested",
    }),
  }),
  makeSession({
    id: "agent-echo",
    activity: "blocked",
    status: "errored",
    branch: "fix/ci-pipeline",
    summary: "CI pipeline failing due to missing env variables in staging",
    pr: makePR({
      number: 39,
      title: "fix: CI pipeline environment configuration",
      additions: 15,
      deletions: 8,
      ciStatus: "failing",
      ciChecks: [
        { name: "build", status: "passed" },
        { name: "test", status: "failed", url: "https://github.com/acme/app/actions/runs/123" },
        { name: "lint", status: "passed" },
      ],
      reviewDecision: "pending",
    }),
  }),
  makeSession({
    id: "agent-foxtrot",
    activity: "exited",
    status: "done",
    branch: "feat/api-docs",
    summary: "Generated OpenAPI documentation for all REST endpoints",
    pr: makePR({
      number: 36,
      title: "docs: auto-generated OpenAPI spec",
      additions: 890,
      deletions: 5,
      state: "merged",
      reviewDecision: "approved",
    }),
  }),
];

const ACTIVITIES = ["active", "ready", "idle", "waiting_input", "blocked", "exited"] as const;

export default function PixelDemoPage() {
  return (
    <div className="min-h-screen p-8" style={{ background: "var(--color-bg-base)" }}>
      <h1 className="mb-2 text-2xl text-[var(--color-text-primary)]">
        Pixel Office Dashboard Demo
      </h1>
      <p className="mb-8 text-sm text-[var(--color-text-secondary)]">
        Each agent is a pixel character at their workstation. Activity state controls their pose.
      </p>

      {/* Character gallery */}
      <div className="mb-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">
          Character States
        </h2>
        <div className="flex flex-wrap gap-6">
          {ACTIVITIES.map((act, i) => (
            <div
              key={act}
              className="flex flex-col items-center gap-2 border border-[var(--color-border-default)] p-4"
              style={{ background: "var(--color-bg-surface)" }}
            >
              <OfficeScene activity={act} sessionId={`agent-${i}`} />
              <span className="text-xs text-[var(--color-text-secondary)]">{act}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Session cards */}
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">
        Session Cards
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DEMO_SESSIONS.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onSend={() => {}}
            onKill={() => {}}
            onMerge={() => {}}
            onRestore={() => {}}
          />
        ))}
      </div>
    </div>
  );
}
