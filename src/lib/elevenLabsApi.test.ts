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
})
