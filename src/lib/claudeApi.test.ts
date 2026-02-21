import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateGenrePrompt, parseClaudeResponse } from './claudeApi'
import type { AudioAnalysis } from './audioAnalysis'

const mockAnalysis: AudioAnalysis = {
  bpm: 87,
  key: { note: 'A', scale: 'minor' },
  energy: 'medium',
  timbre: 'warm',
  durationSeconds: 180,
}

describe('generateGenrePrompt', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  it('calls backend proxy with correct headers', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Jazz prompt here' } }] }),
    } as Response)

    await generateGenrePrompt(mockAnalysis, 'Jazz', 'test-api-key')

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/openai',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'content-type': 'application/json',
        }),
      })
    )
  })

  it('returns the text from OpenAI response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Jazz prompt here' } }] }),
    } as Response)

    const result = await generateGenrePrompt(mockAnalysis, 'Jazz', 'test-api-key')
    expect(result).toBe('Jazz prompt here')
  })

  it('throws on API error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: 'Unauthorized' } }),
    } as Response)

    await expect(generateGenrePrompt(mockAnalysis, 'Jazz', 'key')).rejects.toThrow('OpenAI API error: 401')
  })

  it('includes lyrics in the user message when provided', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Jazz prompt here' } }] }),
    } as Response)

    // Use longer lyrics so proportional extraction includes meaningful content
    const testLyrics = 'a'.repeat(200)
    await generateGenrePrompt(mockAnalysis, 'Jazz', 'test-api-key', testLyrics)

    const callArgs = vi.mocked(fetch).mock.calls[0]
    const body = JSON.parse(callArgs[1]?.body as string)
    expect(body.messages[1].content).toContain('Original lyrics context for instrumental style')
    expect(body.messages[1].content).toContain('Lyrics for vocals (use these in the ElevenLabs prompt so they get sung)')
    expect(body.messages[1].content).toContain('aaa') // At least some lyrics present
  })

  it('extracts proportional lyrics (~27% for 1/4 length songs)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Jazz prompt here' } }] }),
    } as Response)

    const longLyrics = 'a'.repeat(1000)
    await generateGenrePrompt(mockAnalysis, 'Jazz', 'test-api-key', longLyrics)

    const callArgs = vi.mocked(fetch).mock.calls[0]
    const body = JSON.parse(callArgs[1]?.body as string)
    const contextSection = body.messages[1].content.split('Original lyrics context for instrumental style')[1]
    const contextContent = contextSection?.split('Lyrics for vocals')[0]?.trim()
    // Should be roughly 27% of 1000 = ~270 chars (allow 50 char variance for line break handling)
    expect(contextContent?.length).toBeGreaterThan(220)
    expect(contextContent?.length).toBeLessThan(320)
  })

  it('extracts larger vocal lyrics (~55% for vocals to sing)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Jazz prompt here' } }] }),
    } as Response)

    const longLyrics = 'a'.repeat(1000)
    await generateGenrePrompt(mockAnalysis, 'Jazz', 'test-api-key', longLyrics)

    const callArgs = vi.mocked(fetch).mock.calls[0]
    const body = JSON.parse(callArgs[1]?.body as string)
    const vocalSection = body.messages[1].content.split('Lyrics for vocals (use these in the ElevenLabs prompt so they get sung):')[1]
    const vocalContent = vocalSection?.trim()
    // Should be roughly 55% of 1000 = ~550 chars (allow 100 char variance for line break handling)
    expect(vocalContent?.length).toBeGreaterThan(450)
    expect(vocalContent?.length).toBeLessThan(650)
  })

  it('includes duration context in lyrics label', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Jazz prompt here' } }] }),
    } as Response)

    // Use longer lyrics so vocal section appears
    const testLyrics = 'a'.repeat(200)
    await generateGenrePrompt(mockAnalysis, 'Jazz', 'test-api-key', testLyrics)

    const callArgs = vi.mocked(fetch).mock.calls[0]
    const body = JSON.parse(callArgs[1]?.body as string)
    // 180 seconds / 4 = 45 seconds
    expect(body.messages[1].content).toContain('proportional to 45s generated song')
  })

  it('handles empty lyrics gracefully', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Jazz prompt here' } }] }),
    } as Response)

    await generateGenrePrompt(mockAnalysis, 'Jazz', 'test-api-key', '')

    const callArgs = vi.mocked(fetch).mock.calls[0]
    const body = JSON.parse(callArgs[1]?.body as string)
    expect(body.messages[1].content).not.toContain('Original lyrics (excerpt):')
  })

  it('works without lyrics parameter (backwards compatibility)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Jazz prompt here' } }] }),
    } as Response)

    const result = await generateGenrePrompt(mockAnalysis, 'Jazz', 'test-api-key')
    expect(result).toBe('Jazz prompt here')

    const callArgs = vi.mocked(fetch).mock.calls[0]
    const body = JSON.parse(callArgs[1]?.body as string)
    expect(body.messages[1].content).not.toContain('Original lyrics (excerpt):')
  })
})
