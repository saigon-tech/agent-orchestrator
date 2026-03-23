# Agent Orchestrator (`ao`) — CLI & REST API Reference

## CLI Commands

The CLI uses **Commander.js** and is invoked via `ao`.
Entry point: `packages/cli/src/index.ts`

---

### Core Commands

| Command | Description |
|---|---|
| `ao start [project]` | Start orchestrator agent and dashboard |
| `ao stop [project]` | Stop orchestrator agent and dashboard |
| `ao status` | Show all sessions with branch, activity, PR, CI status |
| `ao spawn [issue]` | Spawn a single agent session |
| `ao batch-spawn <issues...>` | Spawn sessions for multiple issues |
| `ao send <session> [message...]` | Send a message to a session |
| `ao review-check [project]` | Check PRs for review comments, trigger agents |
| `ao dashboard` | Start the web dashboard |
| `ao open [target]` | Open session(s) in terminal tabs |
| `ao verify [issue]` | Mark issue as verified/failed |
| `ao doctor` | Run health checks |
| `ao update` | Pull latest, rebuild, run smoke tests |
| `ao config-help` | Show config schema guide |
| `ao init` | *(deprecated — use `ao start`)* |
| `ao lifecycle-worker <project>` | *(internal)* Lifecycle polling worker |

---

### `ao start [project]`

Start orchestrator agent and dashboard. Auto-creates config on first run, adds projects by path/URL.

**Arguments:**
- `[project]` — Optional project ID, path, or repository URL

**Options:**
- `--no-dashboard` — Skip starting the dashboard server
- `--no-orchestrator` — Skip starting the orchestrator agent
- `--rebuild` — Clean and rebuild dashboard before starting

---

### `ao stop [project]`

Stop orchestrator agent and dashboard.

**Arguments:**
- `[project]` — Optional project ID (default: resolve from config)

**Options:**
- `--keep-session` — Keep mapped OpenCode session after stopping
- `--purge-session` — Delete mapped OpenCode session when stopping
- `--all` — Stop all running AO instances

---

### `ao status`

Show all sessions with branch, activity, PR, and CI status.

**Options:**
- `-p, --project <id>` — Filter by project ID
- `--json` — Output as JSON

---

### `ao spawn [issue]`

Spawn a single agent session.

**Arguments:**
- `[issue]` — Issue identifier (project is auto-detected)

**Options:**
- `--open` — Open session in terminal tab
- `--agent <name>` — Override the agent plugin (e.g. `codex`, `claude-code`)
- `--claim-pr <pr>` — Immediately claim an existing PR for the spawned session
- `--assign-on-github` — Assign the claimed PR to the authenticated GitHub user
- `--decompose` — Decompose issue into subtasks before spawning
- `--max-depth <n>` — Max decomposition depth (default: 3)

---

### `ao batch-spawn <issues...>`

Spawn sessions for multiple issues with duplicate detection.

**Arguments:**
- `<issues...>` — Issue identifiers (project is auto-detected)

**Options:**
- `--open` — Open sessions in terminal tabs

---

### `ao session` (Command Group)

Session management subcommands.

#### `ao session ls`

List all sessions.

**Options:**
- `-p, --project <id>` — Filter by project ID

#### `ao session attach <session>`

Attach to a session's tmux window.

**Arguments:**
- `<session>` — Session name to attach

#### `ao session kill <session>`

Kill a session and remove its worktree.

**Arguments:**
- `<session>` — Session name to kill

**Options:**
- `--keep-session` — Keep mapped OpenCode session after kill
- `--purge-session` — Delete mapped OpenCode session during kill

#### `ao session cleanup`

Kill sessions where PR is merged or issue is closed.

**Options:**
- `-p, --project <id>` — Filter by project ID
- `--dry-run` — Show what would be cleaned up without doing it

#### `ao session claim-pr <pr> [session]`

Attach an existing PR to a session.

**Arguments:**
- `<pr>` — Pull request number or URL
- `[session]` — Session name (defaults to `AO_SESSION_NAME`/`AO_SESSION` env var)

**Options:**
- `--assign-on-github` — Assign the PR to the authenticated GitHub user

#### `ao session restore <session>`

Restore a terminated/crashed session in-place.

**Arguments:**
- `<session>` — Session name to restore

#### `ao session remap <session>`

Re-discover and persist OpenCode session mapping for an AO session.

**Arguments:**
- `<session>` — Session name to remap

**Options:**
- `-f, --force` — Force fresh remap by re-discovering the OpenCode session

---

### `ao send <session> [message...]`

Send a message to a session with busy detection and retry.

**Arguments:**
- `<session>` — Session name
- `[message...]` — Message to send

**Options:**
- `-f, --file <path>` — Send contents of a file instead
- `--no-wait` — Don't wait for session to become idle before sending
- `--timeout <seconds>` — Max seconds to wait for idle (default: 600)

---

### `ao review-check [project]`

Check PRs for review comments and trigger agents to address them.

**Arguments:**
- `[project]` — Project ID (checks all if omitted)

**Options:**
- `--dry-run` — Show what would be done without sending messages

---

### `ao dashboard`

Start the web dashboard.

**Options:**
- `-p, --port <port>` — Port to listen on
- `--no-open` — Don't open browser automatically
- `--rebuild` — Clean stale build artifacts and rebuild before starting

---

### `ao open [target]`

Open session(s) in terminal tabs.

**Arguments:**
- `[target]` — Session name, project ID, or `"all"` to open everything

**Options:**
- `-w, --new-window` — Open in a new terminal window

---

### `ao verify [issue]`

Mark an issue as verified (or failed) after checking the fix on staging.

**Arguments:**
- `[issue]` — Issue number or identifier to verify

**Options:**
- `-p, --project <id>` — Project ID (required if multiple projects)
- `--fail` — Mark verification as failed instead of passing
- `-c, --comment <msg>` — Custom comment to add
- `-l, --list` — List all issues with merged-unverified label

---

### `ao doctor`

Run install, environment, and runtime health checks.

**Options:**
- `--fix` — Apply safe fixes for launcher and stale temp issues

---

### `ao update`

Fast-forward the local install repo, rebuild critical packages, and run smoke tests.

**Options:**
- `--skip-smoke` — Skip smoke tests after rebuilding
- `--smoke-only` — Run smoke tests without fetching or rebuilding

---

### `ao config-help`

Show config schema and guide for creating `agent-orchestrator.yaml`. No options.

---

## REST API Endpoints

The web dashboard runs a **Next.js App Router** on port **3000** (default).
All routes are under `/api/`.
Source: `packages/web/src/app/api/`

---

### Projects

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/projects` | List all configured projects |

**Response:**
```json
{ "projects": [...] }
```

---

### Sessions

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/sessions` | List sessions |
| `GET` | `/api/sessions/{id}` | Get single session detail |
| `POST` | `/api/sessions/{id}/kill` | Kill/terminate a session |
| `POST` | `/api/sessions/{id}/send` | Send message to a session |
| `POST` | `/api/sessions/{id}/message` | Alternative send message endpoint |
| `POST` | `/api/sessions/{id}/restore` | Restore terminated session |
| `POST` | `/api/sessions/{id}/remap` | Remap OpenCode session ID |

#### `GET /api/sessions`

**Query parameters:**
- `project` — Filter by project ID
- `active` — `true` or `false`

**Response:**
```json
{
  "sessions": [...],
  "stats": {...},
  "orchestratorId": "...",
  "orchestrators": [...],
  "globalPause": false
}
```

#### `GET /api/sessions/{id}`

Returns a single dashboard session with metadata and PR enrichment.

#### `POST /api/sessions/{id}/kill`

**Response:**
```json
{ "ok": true, "sessionId": "..." }
```

#### `POST /api/sessions/{id}/send`

**Request body:**
```json
{ "message": "string (max 10,000 chars)" }
```

**Response:**
```json
{ "ok": true, "sessionId": "...", "message": "..." }
```

#### `POST /api/sessions/{id}/message`

**Request body:**
```json
{ "message": "string (max 10,000 chars)" }
```

**Response:**
```json
{ "success": true }
```

#### `POST /api/sessions/{id}/restore`

**Response:**
```json
{ "ok": true, "sessionId": "...", "session": {...} }
```

#### `POST /api/sessions/{id}/remap`

**Response:**
```json
{ "ok": true, "sessionId": "...", "opencodeSessionId": "..." }
```

---

### Spawn & Orchestrators

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/spawn` | Spawn new worker session |
| `POST` | `/api/orchestrators` | Spawn orchestrator session |

#### `POST /api/spawn`

**Request body:**
```json
{ "projectId": "string", "issueId": "string (optional)", "settings": "string (optional, path to settings file)" }
```

**Response (201):**
```json
{ "session": {...} }
```

#### `POST /api/orchestrators`

**Request body:**
```json
{ "projectId": "string" }
```

**Response (201):**
```json
{ "orchestrator": { "id": "...", "projectId": "...", "projectName": "..." } }
```

---

### Issues & Backlog

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/issues` | List issues from configured trackers |
| `POST` | `/api/issues` | Create a new issue |
| `GET` | `/api/backlog` | List backlog issues (labeled `agent:backlog`) |

#### `GET /api/issues`

**Query parameters:**
- `state` — `open`, `closed`, or `all`
- `label` — Filter by label name
- `project` — Filter by project ID

**Response:**
```json
{
  "issues": [
    { "projectId": "...", "id": "...", "title": "...", "url": "...", "state": "...", "labels": [...] }
  ]
}
```

#### `POST /api/issues`

**Request body:**
```json
{
  "projectId": "string",
  "title": "string",
  "description": "string (optional)",
  "addToBacklog": "boolean (optional)"
}
```

**Response (201):**
```json
{ "issue": { "projectId": "...", "...": "..." } }
```

#### `GET /api/backlog`

Starts backlog auto-claim poller on first call.

**Response:**
```json
{ "issues": [...] }
```

---

### Pull Requests

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/prs/{id}/merge` | Squash-merge a PR |

#### `POST /api/prs/{id}/merge`

`{id}` is the numeric PR number.

**Response:**
```json
{ "ok": true, "prNumber": 123, "method": "squash" }
```

---

### Verification

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/verify` | List issues with `merged-unverified` label |
| `POST` | `/api/verify` | Verify or fail an issue |

#### `GET /api/verify`

**Response:**
```json
{ "issues": [...] }
```

#### `POST /api/verify`

**Request body:**
```json
{
  "issueId": "string",
  "projectId": "string",
  "action": "verify | fail",
  "comment": "string (optional)"
}
```

**Response:**
```json
{ "ok": true }
```

---

### Setup Labels

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/setup-labels` | Create agent labels on all configured repos (idempotent) |

Creates labels: `agent:backlog`, `agent:in-progress`, `agent:blocked`, `agent:done`

**Response:**
```json
{ "results": [{ "repo": "...", "label": "...", "status": "..." }] }
```

---

### Observability

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/observability` | Project health summary |

**Response:**
```json
{ "projects": [...], "overallStatus": "...", "correlationId": "..." }
```

---

### Events (Server-Sent Events)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/events` | Real-time SSE stream for lifecycle events |

**Query parameters:**
- `project` — Project ID or `"all"`

**Content-Type:** `text/event-stream`
**Polling interval:** 5 seconds
**Heartbeat:** 15 seconds

**Event shape:**
```json
{ "type": "snapshot", "sessions": [...], "correlationId": "...", "emittedAt": "..." }
```

---

### Webhooks

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/webhooks/{...slug}` | Receive SCM webhooks (e.g. GitHub) |

Verifies webhook signature, parses event, triggers lifecycle checks.

**Response (202):**
```json
{
  "ok": true,
  "projectIds": [...],
  "sessionIds": [...],
  "matchedSessions": 1,
  "parseErrors": [],
  "lifecycleErrors": []
}
```

**Error (401):**
```json
{ "error": "...", "ok": false }
```

---

## Auxiliary Servers

Beyond the Next.js API, two additional servers run for terminal access:

| Server | Default Port | Env Var | Source |
|---|---|---|---|
| Terminal WebSocket (ttyd) | `14800` | `TERMINAL_PORT` | `packages/web/server/terminal-websocket.ts` |
| Direct Terminal WS (node-pty) | `14801` | `DIRECT_TERMINAL_PORT` | `packages/web/server/direct-terminal-ws.ts` |

### Terminal WebSocket Server (port 14800)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/terminal?session=<sessionId>` | Spawns a ttyd instance, returns connection info |
| `GET` | `/health` | Returns `{ instances, metrics }` |
| `OPTIONS` | `/terminal` | CORS preflight |

**`GET /terminal` response:**
```json
{ "url": "...", "port": 7801, "sessionId": "..." }
```

ttyd instances are allocated on ports **7800–7900**.

### Direct Terminal WebSocket Server (port 14801)

| Protocol | Endpoint | Description |
|---|---|---|
| WebSocket | `/ws?session=<sessionId>` | Direct WebSocket connection to tmux via node-pty |
| `GET` | `/health` | Returns `{ active, sessions, metrics }` |

---

## Error Handling

All API endpoints return JSON errors with appropriate HTTP status codes:

| Status | Meaning |
|---|---|
| `400` | Bad request / missing required fields |
| `404` | Resource not found |
| `409` | Conflict (e.g. duplicate session) |
| `422` | Unprocessable entity |
| `500` | Internal server error |
