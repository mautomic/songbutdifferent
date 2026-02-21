import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateMusic } from './elevenLabsApi'

describe('generateMusic', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  it('calls ElevenLabs with correct headers and body', async () => {
    const fakeBlob = new Blob(['audio'], { type: 'audio/mpeg' })
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      blob: async () => fakeBlob,
    } as Response)

    await generateMusic('cool jazz prompt', 'test-key')

    expect(fetch).toHaveBeenCalledWith(
      'https://api.elevenlabs.io/v1/sound-generation',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'xi-api-key': 'test-key' }),
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

    const result = await generateMusic('prompt', 'key')
    expect(result).toBeInstanceOf(Blob)
  })

  it('throws on API error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
    } as Response)

    await expect(generateMusic('prompt', 'key')).rejects.toThrow('ElevenLabs API error: 401')
  })
})
