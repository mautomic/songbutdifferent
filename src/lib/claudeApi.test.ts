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

    // Use longer lyrics so vocal extraction includes meaningful content
    const testLyrics = 'a'.repeat(200)
    await generateGenrePrompt(mockAnalysis, 'Jazz', 'test-api-key', testLyrics)

    const callArgs = vi.mocked(fetch).mock.calls[0]
    const body = JSON.parse(callArgs[1]?.body as string)
    expect(body.messages[1].content).toContain('IMPORTANT - Read this lyrical content to inform the ElevenLabs prompt')
    expect(body.messages[1].content).toContain('lyrical themes')
    expect(body.messages[1].content).toContain("don't embed the lyrics themselves")
    expect(body.messages[1].content).toContain('aaa') // At least some lyrics present
  })

  it('extracts larger vocal lyrics (~55% for theme analysis)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Jazz prompt here' } }] }),
    } as Response)

    const longLyrics = 'a'.repeat(1000)
    await generateGenrePrompt(mockAnalysis, 'Jazz', 'test-api-key', longLyrics)

    const callArgs = vi.mocked(fetch).mock.calls[0]
    const body = JSON.parse(callArgs[1]?.body as string)
    const vocalSection = body.messages[1].content.split('IMPORTANT - Read this lyrical content to inform the ElevenLabs prompt:')[1]
    const vocalContent = vocalSection?.split('Create the ElevenLabs prompt')[0]?.trim()
    // Should be roughly 55% of 1000 = ~550 chars (allow 150 char variance for line break handling)
    expect(vocalContent?.length).toBeGreaterThan(450)
    expect(vocalContent?.length).toBeLessThan(700)
  })

  it('instructs AI to describe themes rather than embed lyrics', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Jazz prompt here' } }] }),
    } as Response)

    // Use longer lyrics
    const testLyrics = 'a'.repeat(200)
    await generateGenrePrompt(mockAnalysis, 'Jazz', 'test-api-key', testLyrics)

    const callArgs = vi.mocked(fetch).mock.calls[0]
    const body = JSON.parse(callArgs[1]?.body as string)
    expect(body.messages[1].content).toContain('Analyze the themes, emotions, and storytelling')
    expect(body.messages[1].content).toContain("don't embed the lyrics themselves")
    expect(body.messages[1].content).toContain('vocal style, emotion')
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
