import { type NextRequest } from "next/server";
import { validateIdentifier } from "@/lib/validation";
import { getServices } from "@/lib/services";
import { type Agent, type Session, SessionNotFoundError } from "@composio/ao-core";
import {
  getCorrelationId,
  jsonWithCorrelation,
  recordApiObservation,
  resolveProjectIdForSessionId,
} from "@/lib/observability";

/**
 * GET /api/sessions/:id/output — Get the agent's last structured response.
 *
 * Reads the agent's conversation history (JSONL) and returns the last
 * assistant message — the actual text response, not raw terminal output.
 *
 * Returns:
 *   {
 *     sessionId: string,
 *     response: string | null,    // Agent's last text response (null if none yet)
 *     respondedAt: string | null, // ISO timestamp of when the response was generated
 *     activity: string | null,    // Current activity state (active, ready, idle, etc.)
 *     status: string,             // Session lifecycle status
 *   }
 *
 * Usage pattern for Telegram bot (or any external client):
 *   1. POST /api/sessions/{id}/send  — send a message
 *   2. Poll  GET /api/sessions/{id}/output
 *      - activity === "active" → agent still working, keep polling
 *      - activity === "ready"  → agent done, read `response`
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const correlationId = getCorrelationId(request);
  const startedAt = Date.now();
  const { id } = await params;

  const idErr = validateIdentifier(id, "id");
  if (idErr) {
    return jsonWithCorrelation({ error: idErr }, { status: 400 }, correlationId);
  }

  try {
    const { config, registry, sessionManager } = await getServices();
    const session: Session | null = await sessionManager.get(id);
    if (!session) {
      throw new SessionNotFoundError(id);
    }

    // Resolve the agent plugin to read conversation history.
    // Agent name is persisted in session metadata; fall back to project/global defaults.
    const project = config.projects[session.projectId];
    const resolvedAgentName =
      session.metadata?.["agent"] ??
      project?.agent ??
      config.defaults.agent;
    const agentPlugin = registry.get<Agent>("agent", resolvedAgentName);

    let response: string | null = null;
    let respondedAt: string | null = null;

    if (agentPlugin?.getLastResponse) {
      const lastResponse = await agentPlugin.getLastResponse(session);
      if (lastResponse) {
        response = lastResponse.message;
        respondedAt = lastResponse.timestamp.toISOString();
      }
    }

    const projectId = resolveProjectIdForSessionId(config, id);
    recordApiObservation({
      config,
      method: "GET",
      path: "/api/sessions/[id]/output",
      correlationId,
      startedAt,
      outcome: "success",
      statusCode: 200,
      projectId,
      sessionId: id,
      data: { hasResponse: response !== null, responseLength: response?.length ?? 0 },
    });

    return jsonWithCorrelation(
      {
        sessionId: id,
        response,
        respondedAt,
        activity: session.activity,
        status: session.status,
      },
      { status: 200 },
      correlationId,
    );
  } catch (err) {
    if (err instanceof SessionNotFoundError) {
      return jsonWithCorrelation({ error: err.message }, { status: 404 }, correlationId);
    }
    const { config } = await getServices().catch(() => ({ config: undefined }));
    if (config) {
      recordApiObservation({
        config,
        method: "GET",
        path: "/api/sessions/[id]/output",
        correlationId,
        startedAt,
        outcome: "failure",
        statusCode: 500,
        projectId: resolveProjectIdForSessionId(config, id),
        sessionId: id,
        reason: err instanceof Error ? err.message : "Failed to get response",
      });
    }
    const msg = err instanceof Error ? err.message : "Failed to get response";
    return jsonWithCorrelation({ error: msg }, { status: 500 }, correlationId);
  }
}
