import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchLyrics } from './lyricsApi'

describe('fetchLyrics', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('calls backend proxy with correct URL and parameters', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ lyrics: 'Amazing lyrics here' }),
    } as Response)

    await fetchLyrics('The Beatles', 'Let It Be')

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('http://localhost:3001/api/lyrics'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'content-type': 'application/json',
        }),
      })
    )
  })

  it('includes artist and title as query parameters', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ lyrics: 'Test lyrics' }),
    } as Response)

    await fetchLyrics('Queen', 'Bohemian Rhapsody')

    const callUrl = vi.mocked(fetch).mock.calls[0][0] as string
    expect(callUrl).toContain('artist=Queen')
    expect(callUrl).toContain('title=Bohemian+Rhapsody')
  })

  it('returns lyrics string on success', async () => {
    const testLyrics = 'These are the lyrics\nLine 2\nLine 3'
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ lyrics: testLyrics }),
    } as Response)

    const result = await fetchLyrics('Artist', 'Title')
    expect(result).toBe(testLyrics)
  })

  it('returns empty string on HTTP error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response)

    const result = await fetchLyrics('NonExistent', 'Song')
    expect(result).toBe('')
  })

  it('returns empty string on network error', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    const result = await fetchLyrics('Artist', 'Title')
    expect(result).toBe('')
  })

  it('returns empty string on JSON parse error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON')
      },
    } as Response)

    const result = await fetchLyrics('Artist', 'Title')
    expect(result).toBe('')
  })

  it('returns empty string when lyrics property is missing', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: 'something' }),
    } as Response)

    const result = await fetchLyrics('Artist', 'Title')
    expect(result).toBe('')
  })

  it('returns empty string when lyrics property is not a string', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ lyrics: null }),
    } as Response)

    const result = await fetchLyrics('Artist', 'Title')
    expect(result).toBe('')
  })

  it('returns empty string when artist is empty', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ lyrics: 'Lyrics' }),
    } as Response)

    const result = await fetchLyrics('', 'Title')
    expect(result).toBe('')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('returns empty string when title is empty', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ lyrics: 'Lyrics' }),
    } as Response)

    const result = await fetchLyrics('Artist', '')
    expect(result).toBe('')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('returns empty string when both artist and title are empty', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ lyrics: 'Lyrics' }),
    } as Response)

    const result = await fetchLyrics('', '')
    expect(result).toBe('')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('trims whitespace from artist and title', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ lyrics: 'Lyrics' }),
    } as Response)

    await fetchLyrics('  Artist  ', '  Title  ')

    const callUrl = vi.mocked(fetch).mock.calls[0][0] as string
    expect(callUrl).toContain('artist=Artist')
    expect(callUrl).toContain('title=Title')
  })

  it('handles API error status codes gracefully', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response)

    const result = await fetchLyrics('Artist', 'Title')
    expect(result).toBe('')
  })

  it('handles authorization error gracefully', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
    } as Response)

    const result = await fetchLyrics('Artist', 'Title')
    expect(result).toBe('')
  })
})
