---
name: Pixel Office Style Dashboard Redesign
description: Redesign the web dashboard UI with a lightweight pixel-based office/retro terminal aesthetic while keeping the same structure and functionality
type: project
---

## Context

The user wants to redesign the web dashboard (running on port 3000) with a **pixel-based office style** aesthetic. This is inspired by retro terminal/monitor displays or pixel art office interfaces where each AI agent appears as a "workstation" with its task status.

The goal is to:
- Keep the current component structure and functionality
- Only change the visual styling to a pixel/retro theme
- Maintain the kanban board layout (zones: Merge, Respond, Review, Pending, Working, Done)
- Preserve all interactive elements (expand/collapse, terminal links, action buttons)

## Current Architecture

### Core Components to Redesign
| Component | File Path | Purpose |
|-----------|-----------|---------|
| `globals.css` | `packages/web/src/app/globals.css` | CSS custom properties, animations, base styles |
| `Dashboard.tsx` | `packages/web/src/components/Dashboard.tsx` | Main dashboard layout, kanban board, PR table |
| `SessionCard.tsx` | `packages/web/src/components/SessionCard.tsx` | Individual agent session cards |
| `AttentionZone.tsx` | `packages/web/src/components/AttentionZone.tsx` | Zone headers, collapsible sections |
| `PRStatus.tsx` | `packages/web/src/components/PRStatus.tsx` | PR status pills |
| `CIBadge.tsx` | `packages/web/src/components/CIBadge.tsx` | CI status badges |
| `ActivityDot.tsx` | `packages/web/src/components/ActivityDot.tsx` | Activity indicators |
| `ProjectSidebar.tsx` | `packages/web/src/components/ProjectSidebar.tsx` | Project navigation sidebar |
| `layout.tsx` | `packages/web/src/app/layout.tsx` | Root layout with IBM Plex fonts |

### Design Tokens Currently Used
- CSS custom properties for colors (status-working, status-ready, status-error, etc.)
- Rounded corners (4-12px radius)
- Smooth gradients and shadows
- Subtle hover animations
- IBM Plex Sans/Mono fonts

## Proposed Approach

### Phase 1: Create Pixel/Office Style Design System

Replace the current sleek GitHub-style design with a retro pixel aesthetic:

#### New Color Palette (Pixel/Retro Terminal)
- **Background**: Dark CRT-like colors (#0a0e14, #111820)
- **Surface**: Slightly lighter with subtle scanline effect
- **Accent colors**: Bright neon-like colors for status
  - Working: Cyan (#00d4ff)
  - Ready/Merge: Green (#00ff88)
  - Attention: Amber (#ffb800)
  - Error: Red (#ff4757)
  - Done: Muted gray (#6c7a89)

#### Visual Characteristics
1. **Pixel borders**: Use `image-rendering: pixelated` and box shadows instead of rounded borders
2. **No border-radius**: Replace rounded corners with sharp 90° angles
3. **Scanline effect**: Subtle horizontal line overlay
4. **CRT glow**: Text shadow for a subtle phosphor glow effect
5. **Pixel font**: Replace IBM Plex with a pixel/terminal font (e.g., "VT323", "Press Start 2P", or "Fira Code" for readability)
6. **Blocky UI elements**: Buttons, badges with hard edges
7. **Status indicators**: Pixel-style dots or blocks instead of smooth circles

#### Key CSS Changes
1. Remove all `border-radius` values
2. Replace `box-shadow` with pixel-style hard shadows
3. Add scanline overlay using `::before` pseudo-element
4. Add subtle CRT flicker animation
5. Update fonts to pixel/terminal style

### Phase 2: Component-by-Component Transformation

#### 1. globals.css
- Rewrite color palette
- Remove gradient backgrounds, replace with solid/scanline style
- Remove smooth animations, replace with discrete/pixel animations
- Add pixel utility classes

#### 2. SessionCard.tsx (Agent "Workstations")
- Transform cards to look like retro computer terminals
- Pixel borders instead of rounded
- Monospace session IDs
- Status indicators as colored blocks/pixels
- Keep expand functionality but with pixel-style panel

#### 3. AttentionZone.tsx
- Zone headers as "department labels" or "monitor labels"
- Pixel-style collapse arrows
- Maintain column/grid layouts

#### 4. PRStatus.tsx & CIBadge.tsx
- Blocky pixel badges
- Status as colored squares/rectangles
- Monospace numbers

#### 5. ProjectSidebar.tsx
- Pixel-style navigation buttons
- Block selection indicators

### Phase 3: Fonts and Icons
- Import Google Fonts: "VT323" for UI text, optionally "Press Start 2P" for headings
- Replace SVG icons with pixel-art style or keep minimal geometric SVGs
- Keep existing icon structure but simplify where possible

### Phase 4: Animations
Replace smooth animations with discrete/pixel-style:
- Blink animations for active sessions
- Discrete color transitions
- Optional CRT flicker effect (subtle)

## Critical Files to Modify

1. `packages/web/src/app/globals.css` - Primary styling
2. `packages/web/src/app/layout.tsx` - Font imports
3. `packages/web/src/components/Dashboard.tsx` - Layout adjustments
4. `packages/web/src/components/SessionCard.tsx` - Card styling
5. `packages/web/src/components/AttentionZone.tsx` - Zone headers
6. `packages/web/src/components/PRStatus.tsx` - Badge styling
7. `packages/web/src/components/CIBadge.tsx` - CI badge styling
8. `packages/web/src/components/ActivityDot.tsx` - Activity indicators
9. `packages/web/src/components/ProjectSidebar.tsx` - Sidebar styling

## Design References

The pixel office style should evoke:
- Retro terminal interfaces (1980s computers)
- Pixel art office simulators
- CRT monitor aesthetics
- Minimalist block-based UI

## Verification

After implementation:
1. Run `pnpm dev` to start the dashboard
2. Verify all components render correctly
3. Check responsive behavior
4. Test interactive elements (expand/collapse, buttons, links)
5. Verify dark mode works (primary mode)
6. Check terminal embedding still functions

## Notes

- **No functional changes**: All JavaScript/TypeScript logic remains unchanged
- **Accessibility**: Maintain readable contrast ratios
- **Performance**: Avoid heavy CSS effects that could slow rendering
- **Responsive**: Pixel style should scale appropriately
