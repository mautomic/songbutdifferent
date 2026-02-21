export async function fetchLyrics(artist: string, title: string): Promise<string> {
  try {
    // Return empty string if required parameters are missing
    if (!artist || !title) {
      return ''
    }

    const params = new URLSearchParams({
      artist: artist.trim(),
      title: title.trim(),
    })

    const response = await fetch(`http://localhost:3001/api/lyrics?${params.toString()}`, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error(`Lyrics API error: ${response.status}`)
      return ''
    }

    const data = await response.json()

    // Handle case where data doesn't have lyrics property
    if (typeof data.lyrics !== 'string') {
      return ''
    }

    return data.lyrics
  } catch (error) {
    // Handle all error cases gracefully (network errors, parse errors, etc.)
    console.error('Error fetching lyrics:', error)
    return ''
  }
}
