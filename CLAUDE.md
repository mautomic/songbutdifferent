# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start backend (port 3001) + Vite frontend concurrently
npm run dev:frontend # Frontend only (Vite dev server)
npm run dev:backend  # Backend proxy only (Express on port 3001)
npm run build        # tsc + vite build
npm test             # Run full test suite (Vitest, one-shot)
npm run test:watch   # Vitest in watch mode
```

To run a single test file:
```bash
npx vitest run src/lib/audioAnalysis.test.ts
```

## Architecture

**Full-stack TypeScript app** — React/Vite frontend + Express backend proxy. Users upload a song, the browser analyzes its audio characteristics, Claude generates a creative ElevenLabs music prompt, and ElevenLabs regenerates the song in a different genre.

### Backend (`server.ts`)
Express proxy on port 3001 with three endpoints:
- `POST /api/openai` → OpenAI API (Claude uses the OpenAI-compatible endpoint)
- `POST /api/elevenlabs` → ElevenLabs sound generation API
- `GET /api/lyrics` → lyrics.ovh public API

All API keys are forwarded by the backend so they never appear in frontend network calls. CORS is open to all origins.

### Frontend (`src/`)
All state lives in `App.tsx` with a phase-based workflow: `idle → analyzing → generating-prompt → generating-music → done`. Components receive props and callbacks — no context or external state library.

**`src/lib/`** contains the core logic:
- `audioAnalysis.ts` — Client-side audio feature extraction via **Meyda.js** (BPM, key, energy, timbre). Uses Web Audio API to decode the file, then processes 512-sample frames to extract RMS, chroma, and spectral centroid.
- `claudeApi.ts` — Builds a prompt from audio analysis + selected genre + lyrics, calls the backend proxy, parses the two-part response (detection blurb + `PROMPT:` line). **Hard 450-character limit** on ElevenLabs prompt; vocals must start within 10 seconds.
- `elevenLabsApi.ts` — Calls backend, returns audio blob. Duration = original duration ÷ 4, capped at **10–30 seconds**.
- `lyricsApi.ts` — Fetches from lyrics.ovh; included in Claude's prompt to enable actual sung lyrics in generated output.

### Testing
25 tests via **Vitest + jsdom + @testing-library/react**. Tests live alongside source files as `*.test.ts` / `*.test.tsx`. Test setup is in `src/test-setup.ts`.

### Environment
Copy `.env.example` to `.env`. Keys are also stored in `localStorage` (via the API key settings UI) and forwarded through the backend proxy.
