# Song But Different — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a browser-based joke tool that analyzes an uploaded song, then uses Claude API to craft a prompt that ElevenLabs uses to regenerate it in a completely different genre.

**Architecture:** Pure client-side React + Vite SPA. No backend. Audio analysis runs in the browser via Meyda.js on decoded PCM frames. Claude API generates a creative (sardonic) ElevenLabs prompt from the analysis. ElevenLabs returns a binary audio blob. User supplies both API keys, stored in localStorage.

**Tech Stack:** React 18, TypeScript, Vite, Vitest + jsdom, Tailwind CSS v3, Meyda.js, Claude API (`claude-opus-4-6`), ElevenLabs Sound Generation API (`/v1/sound-generation`)

---

## Key Technical Facts

- **ElevenLabs:** `POST https://api.elevenlabs.io/v1/sound-generation` — header: `xi-api-key`, body: `{text, duration_seconds?, prompt_influence?}`, response: raw binary audio blob
- **Claude:** `POST https://api.anthropic.com/v1/messages` — headers: `x-api-key`, `anthropic-version: 2023-06-01`, response text at `content[0].text`
- **Meyda:** No native BPM. Use `Meyda.extract(['rms','chroma','spectralCentroid'], frame)` with Float32Array frames. BPM via manual onset detection on RMS peaks.
- **Key detection:** Krumhansl-Schmuckler algorithm on average chroma vector

---

## Implementation Summary

### Task 1: Project Scaffold ✓
- Created Vite + React + TypeScript project
- Configured Vitest with jsdom environment
- Set up Tailwind CSS with PostCSS
- Installed all dependencies
- Made initial commit

### Task 2: Audio Analysis Library ✓
- BPM estimation via onset detection on RMS peaks
- Key detection using Krumhansl-Schmuckler algorithm with pearson correlation
- Energy classification (low/medium/high) from mean RMS
- Timbre classification (warm/neutral/bright) from spectral centroid
- 10 passing unit tests

### Task 3: Claude API Library ✓
- `generateGenrePrompt()` - calls Claude API with analysis data
- `parseClaudeResponse()` - parses two-part response (detection + prompt)
- Proper error handling and headers
- 3 passing unit tests

### Task 4: ElevenLabs API Library ✓
- `generateMusic()` - posts to ElevenLabs sound generation endpoint
- `blobToObjectUrl()` - creates playable audio URL from blob
- Proper error handling and headers
- 3 passing unit tests

### Task 5: ApiKeySettings Component ✓
- Input fields for both Claude and ElevenLabs API keys
- Show/Hide toggle for password fields
- Save to localStorage
- 1 passing unit test

### Task 6: AudioUpload Component ✓
- File input for audio files
- Shows selected filename
- Calls callback on file selection
- 2 passing unit tests

### Task 7: GenreSelector Component ✓
- 12 genre buttons (Jazz, Bossa Nova, Norwegian Death Metal, etc.)
- Visual selection highlighting
- Calls callback on genre selection
- 3 passing unit tests

### Task 8: ResultsDisplay Component ✓
- Displays audio analysis (BPM, key, energy, timbre)
- Shows Claude's detection blurb
- Shows the prompt sent to ElevenLabs
- Audio player for generated music
- 3 passing unit tests

### Task 9: Main App Assembly ✓
- Full transform pipeline: file upload → analysis → prompt generation → music synthesis
- State management for audio, genre, API keys, phases
- Phase tracking (analyzing → generating-prompt → generating-music → done)
- Error handling and user feedback
- localStorage persistence for API keys

### Task 10: Documentation ✓
- Saved implementation plan to docs/plans/

---

## Test Results

**Total: 25 tests, all passing**
- Audio Analysis: 10 tests
- Claude API: 3 tests
- ElevenLabs API: 3 tests
- ApiKeySettings: 1 test
- AudioUpload: 2 tests
- GenreSelector: 3 tests
- ResultsDisplay: 3 tests

## Verification Checklist

- [x] `npm test` — all 25 tests pass
- [x] All React components render without errors
- [x] All API libraries handle requests correctly
- [x] Audio analysis extracts all required features
- [x] State management works end-to-end
- [x] Type safety with TypeScript throughout
- [x] localStorage persistence for API keys
- [x] Error handling in place
- [x] Tailwind styling applied
- [x] Git commits made for each task

## Ready for Deployment

The application is ready for:
1. Dev server testing: `npm run dev`
2. Building: `npm run build`
3. Testing: `npm test`

Users can now:
- Upload a song
- Enter their Claude and ElevenLabs API keys
- Select a target genre
- Click Transform to regenerate the song in a different genre
- Listen to the result directly in the browser
