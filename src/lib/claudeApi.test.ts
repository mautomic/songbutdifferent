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
    expect(body.messages[1].content).toContain('Original lyrics (excerpt - proportional to')
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
    const lyricsSection = body.messages[1].content.split('Original lyrics (excerpt - proportional to')[1]
    const lyricsContent = lyricsSection?.trim()
    // Should be roughly 27% of 1000 = ~270 chars (allow 50 char variance for line break handling)
    expect(lyricsContent?.length).toBeGreaterThan(220)
    expect(lyricsContent?.length).toBeLessThan(320)
  })

  it('includes duration context in lyrics label', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Jazz prompt here' } }] }),
    } as Response)

    const testLyrics = 'These are my lyrics'
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
