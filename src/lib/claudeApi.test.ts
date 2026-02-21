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

    const testLyrics = 'Verse 1:\nThese are my lyrics\nChorus:\nSinging together'
    await generateGenrePrompt(mockAnalysis, 'Jazz', 'test-api-key', testLyrics)

    const callArgs = vi.mocked(fetch).mock.calls[0]
    const body = JSON.parse(callArgs[1]?.body as string)
    expect(body.messages[1].content).toContain('KEY LYRICS')
    expect(body.messages[1].content).toContain('These are my lyrics')
    expect(body.messages[1].content).toContain('450')
  })

  it('enforces 450 character limit and vocal timing on ElevenLabs prompt', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Jazz prompt here' } }] }),
    } as Response)

    const testLyrics = 'Verse 1:\nFirst line\nSecond line\nChorus:\nMain hook'
    await generateGenrePrompt(mockAnalysis, 'Jazz', 'test-api-key', testLyrics)

    const callArgs = vi.mocked(fetch).mock.calls[0]
    const body = JSON.parse(callArgs[1]?.body as string)
    // Verify character limit is mentioned
    expect(body.messages[1].content).toContain('MAXIMUM 450 CHARACTERS')
    expect(body.messages[1].content).toContain('450')
    expect(body.messages[0].content).toContain('450 characters or less')
    // Verify vocal timing requirement
    expect(body.messages[1].content).toContain('vocals start within 10 seconds')
    expect(body.messages[1].content).toContain('~30s')
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
