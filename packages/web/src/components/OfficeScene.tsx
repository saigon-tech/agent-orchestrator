"use client";

/**
 * Renders a tiny pixel-art office scene using real NES-style spritesheets.
 *
 * Each 16×16 frame is scaled 3× (48×48 CSS px) with `image-rendering: pixelated`.
 * Sprite cycling uses CSS `steps()` animation on `background-position-x`.
 *
 * Worker sheets: 4 cols × 10 rows (64×160 px)
 *   Rows 0-1  walk-down    |  Rows 2-3  walk-up
 *   Rows 4-5  walk-left    |  Rows 6-7  walk-right
 *   Row 8     typing       |  Row 9     drinking
 *
 * Computer sheet: 5 cols × 10 rows (80×160 px)
 * Water cooler: 7 cols × 1 row (112×16 px)
 */

interface OfficeSceneProps {
  activity: string | null;
  sessionId: string;
}

const SCALE = 3;
const F = 16; // native frame size

// ── Worker variants ──────────────────────────────────────────────────────
const WORKER_SHEETS = [
  "/sprites/WorkerSheetBrownPurple.png",
  "/sprites/WorkerSheetBrownWhite.png",
  "/sprites/WorkerSheetYellowPurple.png",
  "/sprites/WorkerSheetYellowWhite.png",
];

// Row Y-offsets (native px) into the worker spritesheet
const WR = {
  walkDown: 0,
  walkUp: 32,
  walkLeft: 64,
  walkRight: 96,
  typing: 128,
  drinking: 144,
};

// ── Scene configs per activity ───────────────────────────────────────────

interface SceneConfig {
  furniture: "computer" | "cooler";
  computerRow: number;
  workerRow: number;
  workerAnim: boolean;
  workerSpeed: string;
  computerAnim: boolean;
  computerSpeed: string;
  showWorker: boolean;
  bubble?: { text: string; color: string };
}

function getConfig(activity: string): SceneConfig {
  switch (activity) {
    case "active":
      return {
        furniture: "computer",
        computerRow: 0,
        workerRow: WR.typing,
        workerAnim: true,
        workerSpeed: "0.8s",
        computerAnim: true,
        computerSpeed: "1s",
        showWorker: true,
      };
    case "ready":
      return {
        furniture: "computer",
        computerRow: 2,
        workerRow: WR.walkDown,
        workerAnim: true,
        workerSpeed: "1s",
        computerAnim: true,
        computerSpeed: "2s",
        showWorker: true,
        bubble: { text: "\u2713", color: "#00ff88" },
      };
    case "idle":
      return {
        furniture: "cooler",
        computerRow: 0,
        workerRow: WR.drinking,
        workerAnim: true,
        workerSpeed: "1.5s",
        computerAnim: false,
        computerSpeed: "",
        showWorker: true,
      };
    case "waiting_input":
      return {
        furniture: "computer",
        computerRow: 0,
        workerRow: WR.walkDown,
        workerAnim: true,
        workerSpeed: "1s",
        computerAnim: true,
        computerSpeed: "1.5s",
        showWorker: true,
        bubble: { text: "?", color: "#ffb800" },
      };
    case "blocked":
      return {
        furniture: "computer",
        computerRow: 6,
        workerRow: WR.walkDown,
        workerAnim: false,
        workerSpeed: "",
        computerAnim: true,
        computerSpeed: "0.6s",
        showWorker: true,
        bubble: { text: "!", color: "#ff4757" },
      };
    case "exited":
      return {
        furniture: "computer",
        computerRow: 0,
        workerRow: 0,
        workerAnim: false,
        workerSpeed: "",
        computerAnim: false,
        computerSpeed: "",
        showWorker: false,
      };
    default:
      return {
        furniture: "computer",
        computerRow: 0,
        workerRow: WR.walkDown,
        workerAnim: false,
        workerSpeed: "",
        computerAnim: false,
        computerSpeed: "",
        showWorker: true,
      };
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────

function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// ── Component ────────────────────────────────────────────────────────────

export function OfficeScene({ activity, sessionId }: OfficeSceneProps) {
  const state = activity ?? "idle";
  const cfg = getConfig(state);
  const sheet = WORKER_SHEETS[simpleHash(sessionId) % WORKER_SHEETS.length];

  // Fixed scene height so all cards align (furniture + overlapping worker)
  const nativeH = 26;

  return (
    <div className="shrink-0" style={{ width: F * SCALE, height: nativeH * SCALE }}>
      {/* Scaled pixel-art container — all children use native 16px coords */}
      <div
        style={{
          width: F,
          height: nativeH,
          position: "relative",
          transform: `scale(${SCALE})`,
          transformOrigin: "top left",
          imageRendering: "pixelated",
        }}
      >
        {/* ── Furniture: Computer or Water Cooler ── */}
        {cfg.furniture === "cooler" ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: F,
              height: F,
              backgroundImage: "url(/sprites/WatercoolerSheet.png)",
              backgroundPosition: "0 0",
              backgroundRepeat: "no-repeat",
              animation: "sprite-cooler 2s steps(7) infinite",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: F,
              height: F,
              backgroundImage: "url(/sprites/ComputerSheet.png)",
              backgroundPosition: `0 -${cfg.computerRow * F}px`,
              backgroundRepeat: "no-repeat",
              animation: cfg.computerAnim
                ? `sprite-computer ${cfg.computerSpeed} steps(5) infinite`
                : undefined,
            }}
          />
        )}

        {/* ── Worker character ── */}
        {cfg.showWorker && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 10,
              width: F,
              height: F,
              backgroundImage: `url(${sheet})`,
              backgroundPosition: `0 -${cfg.workerRow}px`,
              backgroundRepeat: "no-repeat",
              animation: cfg.workerAnim
                ? `sprite-walk ${cfg.workerSpeed} steps(4) infinite`
                : undefined,
            }}
          />
        )}

        {/* ── Status bubble ── */}
        {cfg.bubble && (
          <div
            style={{
              position: "absolute",
              right: -1,
              top: 4,
              fontSize: "8px",
              fontWeight: "bold",
              lineHeight: 1,
              color: cfg.bubble.color,
              textShadow: `0 0 3px ${cfg.bubble.color}80`,
              animation: "float-bubble 2s steps(3) infinite",
              zIndex: 10,
            }}
          >
            {cfg.bubble.text}
          </div>
        )}
      </div>
    </div>
  );
}
