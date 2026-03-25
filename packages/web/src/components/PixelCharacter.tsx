"use client";

import { useMemo } from "react";

interface PixelCharacterProps {
  activity: string | null;
}

const PX = 4;

// Static colors shared across all states
const COLORS: Record<string, string> = {
  M: "#2a2a3a", // monitor frame
  H: "#443322", // hair
  S: "#ffcc88", // skin
  K: "#333344", // keyboard
  D: "#7a5a3a", // desk top
  d: "#5a3a1a", // desk front
};

interface CharState {
  sprite: string[];
  screen: string;
  body: string;
  bubble?: { text: string; color: string };
  anim?: string;
}

const STATES: Record<string, CharState> = {
  active: {
    sprite: [
      "....MMMM....",
      "....MGGG....",
      "....MGGG....",
      "....MMMM....",
      ".....MM.....",
      "...HHH......",
      "...SSS..KK..",
      "..BBBBB.KK..",
      "DDDDDDDDDDDD",
      "dd........dd",
    ],
    screen: "#00d4ff",
    body: "#3388dd",
    anim: "typing-bob 0.6s steps(1) infinite",
  },
  ready: {
    sprite: [
      "....MMMM....",
      "....MGGG....",
      "....MGGG....",
      "....MMMM....",
      ".....MM.....",
      "...HHH......",
      "...SSS......",
      "...BBB......",
      "..BBBBB.....",
      "DDDDDDDDDDDD",
    ],
    screen: "#00ff88",
    body: "#338855",
    bubble: { text: "\u2713", color: "#00ff88" },
  },
  idle: {
    sprite: [
      "....MMMM....",
      "....M..M....",
      "....M..M....",
      "....MMMM....",
      ".....MM.....",
      "............",
      "....HHH.....",
      "...SSSSSS...",
      "..BBBBBBBB..",
      "DDDDDDDDDDDD",
    ],
    screen: "#0f1520",
    body: "#445566",
    bubble: { text: "z", color: "#3d5570" },
    anim: "idle-breathe 3s steps(1) infinite",
  },
  waiting_input: {
    sprite: [
      "....MMMM....",
      "....MGGG....",
      "....MGGG....",
      "....MMMM....",
      ".....MM.....",
      "...HHH......",
      "...SSS......",
      "...BBB......",
      "..BBBBB.....",
      "DDDDDDDDDDDD",
    ],
    screen: "#ffb800",
    body: "#997733",
    bubble: { text: "?", color: "#ffb800" },
    anim: "float-bubble 2s steps(3) infinite",
  },
  blocked: {
    sprite: [
      "....MMMM....",
      "....MGGG....",
      "....MGGG....",
      "....MMMM....",
      ".....MM.....",
      "...HHH......",
      "...SSS......",
      "...BBB......",
      "..BBBBB.....",
      "DDDDDDDDDDDD",
    ],
    screen: "#ff4757",
    body: "#993333",
    bubble: { text: "!", color: "#ff4757" },
    anim: "alert-blink 1s steps(1) infinite",
  },
  exited: {
    sprite: [
      "....MMMM....",
      "....M..M....",
      "....M..M....",
      "....MMMM....",
      ".....MM.....",
      "............",
      "............",
      "............",
      "............",
      "DDDDDDDDDDDD",
    ],
    screen: "#0a0e14",
    body: "#334455",
  },
};

function buildBoxShadow(state: CharState): string {
  const map: Record<string, string> = { ...COLORS, G: state.screen, B: state.body };
  const shadows: string[] = [];
  for (let y = 0; y < state.sprite.length; y++) {
    const row = state.sprite[y];
    for (let x = 0; x < row.length; x++) {
      const c = map[row[x]];
      if (c) shadows.push(`${x * PX}px ${y * PX}px 0 ${c}`);
    }
  }
  return shadows.join(",");
}

export function PixelCharacter({ activity }: PixelCharacterProps) {
  const state = STATES[activity ?? "idle"] ?? STATES.idle;
  const shadow = useMemo(() => buildBoxShadow(state), [state]);

  const w = 12 * PX + PX;
  const h = state.sprite.length * PX + PX;

  return (
    <div className="relative shrink-0" style={{ width: w, height: h }}>
      {/* Sprite via box-shadow pixel art */}
      <div
        style={{
          width: PX,
          height: PX,
          boxShadow: shadow,
          animation: state.anim,
        }}
      />
      {/* Status bubble */}
      {state.bubble && (
        <div
          style={{
            position: "absolute",
            left: PX * 0.5,
            top: PX * 2.5,
            fontSize: "14px",
            fontWeight: "bold",
            color: state.bubble.color,
            textShadow: `0 0 8px ${state.bubble.color}50`,
            animation: "float-bubble 2s steps(3) infinite",
            lineHeight: 1,
          }}
        >
          {state.bubble.text}
        </div>
      )}
    </div>
  );
}
