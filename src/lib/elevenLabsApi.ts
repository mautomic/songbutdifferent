export async function generateMusic(prompt: string, apiKey: string, durationSeconds: number): Promise<Blob> {
  const response = await fetch('http://localhost:3001/api/elevenlabs', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      text: prompt,
      duration_seconds: Math.max(Math.round(durationSeconds / 4), 10),
      prompt_influence: 0.5,
      apiKey,
    }),
  })

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status}`)
  }

  return response.blob()
}

export function blobToObjectUrl(blob: Blob): string {
  return URL.createObjectURL(blob)
}
