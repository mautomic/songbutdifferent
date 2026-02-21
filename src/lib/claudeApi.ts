import type { AudioAnalysis } from './audioAnalysis'

const SYSTEM_PROMPT = `You are a sardonic music analyst and creative prompt engineer.
You describe songs with deadpan confidence, even when your analysis is obviously absurd.
You write prompts for ElevenLabs music generation that capture a song's essence reimagined in a new genre.
Keep prompts under 300 characters: specific, evocative, instrument-forward.`

function buildUserMessage(analysis: AudioAnalysis, genre: string): string {
  const { bpm, key, energy, timbre, durationSeconds } = analysis
  return `Audio analysis of an uploaded song:
- BPM: ${bpm}
- Key: ${key.note} ${key.scale}
- Energy: ${energy}
- Timbre: ${timbre}
- Duration: ${Math.round(durationSeconds)}s

Target genre: ${genre}

First, write one sentence describing what you "detected" in the original song (be confidently absurd).
Then on a new line starting with "PROMPT:", write an ElevenLabs music generation prompt that captures this song's essence reimagined as ${genre}. Be specific about tempo, instruments, mood, and atmosphere.`
}

export async function generateGenrePrompt(
  analysis: AudioAnalysis,
  genre: string,
  apiKey: string
): Promise<string> {
  const response = await fetch('http://localhost:3001/api/openai', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 512,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserMessage(analysis, genre) },
      ],
      apiKey,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content as string
}

// Parse OpenAI's two-part response into detection blurb + ElevenLabs prompt
export function parseClaudeResponse(raw: string): { detection: string; elevenLabsPrompt: string } {
  const lines = raw.split('\n').filter(l => l.trim())
  const promptIdx = lines.findIndex(l => l.startsWith('PROMPT:'))
  if (promptIdx === -1) return { detection: raw, elevenLabsPrompt: raw }
  const detection = lines.slice(0, promptIdx).join(' ').trim()
  const elevenLabsPrompt = lines.slice(promptIdx).join(' ').replace('PROMPT:', '').trim()
  return { detection, elevenLabsPrompt }
}
