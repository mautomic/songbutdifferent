# Genre-Swap Music Tool

## Concept

Upload a song → analyze it → extract characteristics → use prompt engineering to ask ElevenLabs to create a variation in a different genre.

**Flow:** Upload song → analyze → extract characteristics → rephrase as ElevenLabs prompt → generate genre-swapped version

---

## The Core Technical Problem

ElevenLabs music API **cannot take audio as input** — it's text-to-music only, no audio-to-audio or style transfer. So you can't feed it your song and say "make this but jazz."

What you *can* do is analyze the song yourself, extract meaningful characteristics, then craft a prompt that describes those characteristics in the target genre. The quality of the output depends entirely on how well you bridge that gap.

---

## What You Can Actually Extract (Client-Side)

Using the **Web Audio API** in the browser — no backend needed:

- **Tempo/BPM** — fairly reliable
- **Key/scale** — rough estimate using chroma features
- **Energy level** — RMS amplitude over time
- **Rough structure** — detect beats, identify loud vs quiet sections
- **Timbre** — spectral centroid gives you "bright vs dark/warm"

Libraries like **Essentia.js** or **Meyda** run entirely in the browser and give you these features without a server.

---

## The Prompt Engineering Bridge

Take the extracted features and map them to genre-appropriate ElevenLabs prompt language.

**Example:**

```
Original analysis:
- BPM: 87
- Key: A minor
- Energy: medium-low
- Timbre: warm, low spectral centroid
- Structure: slow build, sustained sections

Target genre: Jazz

Generated prompt:
"Slow jazz ballad, 87 BPM, A minor, warm upright bass,
brushed snare, melancholic piano melody, smoky late-night
club atmosphere, medium-low energy, sustained chord voicings,
gradual build"
```

The genre swap is a lookup/mapping layer — each genre has characteristic instrument vocabulary, energy descriptors, and structural language that ElevenLabs responds well to.

---

## The Joke Layer

Since this is a joke project, lean into the absurdity of the transformation. The UI shows:

- What the AI "heard" in the original (often confidently wrong)
- The ridiculous prompt it generated
- The resulting chaotic genre swap

> *"We detected: mid-tempo corporate sadness in D minor. Here's your song reimagined as Norwegian Death Metal."*

The gap between input and output is the comedy.

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Audio analysis | Meyda.js (browser, no backend needed) |
| Prompt generation | Claude API (interprets features, writes ElevenLabs prompt creatively) |
| Music generation | ElevenLabs API |
| Auth | User brings their own API keys for both |

The **Claude step is key** — rather than hardcoding the feature-to-prompt mapping, Claude does the creative interpretation. Feed it the raw analysis numbers and say:

> *"Write an ElevenLabs music prompt that captures this song's essence but reimagined as [genre]."*

That's where the personality and humor comes from.

---

## Why Claude as the Bridge

- Hardcoded mappings are brittle and boring
- Claude can add flavor, humor, and genre-specific nuance
- The prompt Claude writes becomes part of the UI output — showing users the "translation" is part of the joke
- Easy to swap in different tones (serious, unhinged, overly academic)
