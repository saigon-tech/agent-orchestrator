# New Project Setup

## Steps

### 1. Clone the repo
```bash
git clone https://github.com/org/repo-name ~/path/to/repo
cd ~/path/to/repo
```

### 2. Copy template files into the repo root
```bash
cp /path/to/agent-orchestrator/default_settings_template/agent-orchestrator.yaml .
cp /path/to/agent-orchestrator/default_settings_template/.agent-rules.md .
```

### 3. Edit `agent-orchestrator.yaml`
Update these fields:

| Field | What to change |
|---|---|
| `projects` key | Short slug for your project (e.g. `my-app`) |
| `name` | Human-readable project name |
| `sessionPrefix` | Short prefix for tmux sessions (2–4 chars, e.g. `ma`) |
| `repo` | GitHub repo in `owner/repo` format |
| `path` | Absolute path to the cloned repo |
| `defaultBranch` | Usually `main` or `master` |

### 4. Edit `.agent-rules.md` (optional)
Customize the coding rules for this project — injected into every agent prompt (both orchestrator and workers).
Add project-specific conventions: framework patterns, testing setup, deployment steps, etc.

### 5. Start the orchestrator
```bash
ao start
```

The web dashboard will be available at `http://localhost:3000`.

---

## Agent Profiles (model + settings files)

The system supports different "profiles" — a combination of a model and a settings file (`.claude/settings.<profile>.json`). This is how you run workers with different models or configurations (e.g. Opus for hard tasks, Sonnet for fast tasks, Qwen via custom API).

### How profiles work

A settings file controls:
- Which Claude model to use (`model` field in agentConfig)
- Environment variables passed to the agent (e.g. `ANTHROPIC_BASE_URL`, `ANTHROPIC_MODEL` for custom/proxy models)
- Claude Code internal config (permissions, hooks, etc.)

Example `.claude/settings.qwen.json`:
```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "your-api-key",
    "ANTHROPIC_BASE_URL": "https://your-proxy-url",
    "ANTHROPIC_MODEL": "qwen3.5-plus"
  }
}
```

### Configuring profiles in `agent-orchestrator.yaml`

Set the default profile for orchestrator and worker roles separately:

```yaml
projects:
  my-app:
    orchestrator:
      agentConfig:
        model: claude-opus-4-6
        settings: .claude/settings.opus.json   # heavy planning model

    worker:
      agentConfig:
        model: claude-sonnet-4-6
        settings: .claude/settings.sonnet.json  # fast execution model
```

### Spawning with a specific profile at runtime

Override the profile for a single spawn without changing the config:

```bash
# Spawn an issue with a specific settings file
ao spawn ISSUE-123 --settings .claude/settings.opus.json

# Spawn with a different agent entirely
ao spawn ISSUE-123 --agent codex

# Batch spawn multiple issues with the same profile override
ao batch-spawn ISSUE-1 ISSUE-2 ISSUE-3 --settings .claude/settings.sonnet.json
```

### Via API (programmatic spawn)

```bash
POST /api/spawn
{
  "projectId": "my-app",
  "issueId": "ISSUE-123",
  "settings": ".claude/settings.opus.json"
}
```

### Profile priority (highest wins)

1. `--settings` CLI flag or API `settings` field
2. Role config in yaml (`orchestrator.agentConfig.settings` / `worker.agentConfig.settings`)
3. Project-level `agentConfig.settings`
4. No settings file (model flag only)

Settings files are resolved relative to the project `path` in the config.

---

## Config reference

### Reactions (auto-responses to events)
| Key | Default | What it does |
|---|---|---|
| `ci-failed` | off | Send to agent to fix CI failures |
| `changes-requested` | on | Send to agent when reviewer requests changes |
| `bugbot-comments` | off | Send to agent on Sentry BugBot comments (Sentry only) |
| `merge-conflicts` | on | Send to agent to resolve merge conflicts |
| `approved-and-green` | off | Auto-merge when PR approved + CI green |

### Models
- **Orchestrator**: `claude-opus-4-6` — handles planning, issue decomposition, spawning workers
- **Worker**: `claude-sonnet-4-6` — handles execution of individual tasks

### Permissions
Set via `agentConfig.permissions`:
- `permissionless` — no interactive prompts, agent runs freely (recommended for automation)
- `default` — Claude Code's normal permission model
- `auto-edit` — auto-approves file edits
- `suggest` — conservative, asks on higher-risk actions

### Workspace
- Each issue gets its own **git worktree** (isolated branch, shared node_modules)
- Worktrees are stored in `~/.worktrees`
- Session metadata is stored in `~/.agent-orchestrator`
