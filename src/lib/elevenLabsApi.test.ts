import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateMusic } from './elevenLabsApi'

describe('generateMusic', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  it('calls backend proxy with correct headers and body', async () => {
    const fakeBlob = new Blob(['audio'], { type: 'audio/mpeg' })
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      blob: async () => fakeBlob,
    } as Response)

    await generateMusic('cool jazz prompt', 'test-key', 240)

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/elevenlabs',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'content-type': 'application/json' }),
        body: expect.stringContaining('cool jazz prompt'),
      })
    )
  })

  it('returns a Blob on success', async () => {
    const fakeBlob = new Blob(['audio'], { type: 'audio/mpeg' })
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      blob: async () => fakeBlob,
    } as Response)

    const result = await generateMusic('prompt', 'key', 240)
    expect(result).toBeInstanceOf(Blob)
  })

  it('throws on API error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
    } as Response)

    await expect(generateMusic('prompt', 'key', 240)).rejects.toThrow('ElevenLabs API error: 401')
  })

  it('caps duration at 30 seconds max (ElevenLabs API limit)', async () => {
    const fakeBlob = new Blob(['audio'], { type: 'audio/mpeg' })
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      blob: async () => fakeBlob,
    } as Response)

    // Try with a very long song (268s) - would calculate to 67s without cap
    await generateMusic('prompt', 'key', 268)

    const callArgs = vi.mocked(fetch).mock.calls[0]
    const body = JSON.parse(callArgs[1]?.body as string)
    // Should be capped at 30, not 67 (268 / 4)
    expect(body.duration_seconds).toBe(30)
  })

  it('uses minimum duration of 10 seconds for short songs', async () => {
    const fakeBlob = new Blob(['audio'], { type: 'audio/mpeg' })
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      blob: async () => fakeBlob,
    } as Response)

    // Short song (20s) would calculate to 5s - should use minimum of 10s
    await generateMusic('prompt', 'key', 20)

    const callArgs = vi.mocked(fetch).mock.calls[0]
    const body = JSON.parse(callArgs[1]?.body as string)
    expect(body.duration_seconds).toBe(10)
  })
})
