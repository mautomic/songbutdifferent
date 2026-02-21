import type { AudioAnalysis } from './audioAnalysis'

const SYSTEM_PROMPT = `You are a sardonic music analyst and creative prompt engineer.
You describe songs with deadpan confidence, even when your analysis is obviously absurd.
You write prompts for ElevenLabs music generation that capture a song's essence reimagined in a new genre.
When original lyrics are provided, include them in the ElevenLabs prompt so vocals can sing them in the new genre style.
Keep prompts under 300 characters: specific, evocative, instrument-forward, and include the vocal content when lyrics are available.`

// Extract a proportional amount of lyrics for instrumental context (~25-30% for 1/4 length)
function getProportionalLyricsExcerpt(lyrics: string): string {
  const trimmed = lyrics.trim()
  if (!trimmed) return ''

  // Use roughly 25-30% of the original lyrics for the 1/4 length song
  // Calculate based on character count to preserve natural line breaks
  const targetLength = Math.ceil(trimmed.length * 0.27)
  let excerpt = trimmed.substring(0, targetLength)

  // Try to end at a line break for cleaner output
  const lastNewline = excerpt.lastIndexOf('\n')
  if (lastNewline > targetLength * 0.8) {
    excerpt = excerpt.substring(0, lastNewline)
  }

  return excerpt
}

// Extract a larger amount of lyrics for vocals (~50-60% to have meaningful vocal content)
function getVocalLyricsExcerpt(lyrics: string): string {
  const trimmed = lyrics.trim()
  if (!trimmed) return ''

  // Use roughly 50-60% of the original lyrics for vocals in the 1/4 length song
  // More content allows for a more substantive vocal performance
  const targetLength = Math.ceil(trimmed.length * 0.55)
  let excerpt = trimmed.substring(0, targetLength)

  // Try to end at a line break for cleaner output
  const lastNewline = excerpt.lastIndexOf('\n')
  if (lastNewline > targetLength * 0.8) {
    excerpt = excerpt.substring(0, lastNewline)
  }

  return excerpt
}

function buildUserMessage(analysis: AudioAnalysis, genre: string, lyrics?: string): string {
  const { bpm, key, energy, timbre, durationSeconds } = analysis
  let message = `Audio analysis of an uploaded song:
- BPM: ${bpm}
- Key: ${key.note} ${key.scale}
- Energy: ${energy}
- Timbre: ${timbre}
- Duration: ${Math.round(durationSeconds)}s

Target genre: ${genre}

First, write one sentence describing what you "detected" in the original song (be confidently absurd).
Then on a new line starting with "PROMPT:", write an ElevenLabs music generation prompt that captures this song's essence reimagined as ${genre}. Be specific about tempo, instruments, mood, atmosphere, AND vocal content/singing style.`

  if (lyrics && lyrics.trim()) {
    const contextExcerpt = getProportionalLyricsExcerpt(lyrics)
    const vocalExcerpt = getVocalLyricsExcerpt(lyrics)

    message += `

Original lyrics context for instrumental style (excerpt - proportional to ${Math.round(durationSeconds / 4)}s generated song):
${contextExcerpt}

Lyrics for vocals (use these in the ElevenLabs prompt so they get sung):
${vocalExcerpt}`
  }

  return message
}

export async function generateGenrePrompt(
  analysis: AudioAnalysis,
  genre: string,
  apiKey: string,
  lyrics?: string
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
        { role: 'user', content: buildUserMessage(analysis, genre, lyrics) },
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
