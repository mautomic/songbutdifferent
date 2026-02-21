export async function generateMusic(prompt: string, apiKey: string, durationSeconds: number): Promise<Blob> {
  // ElevenLabs sound generation: duration must be 0.5-30 seconds
  // Calculate 1/4 of original, but cap at 30 second max
  const targetDuration = Math.round(durationSeconds / 4)
  const cappedDuration = Math.min(Math.max(targetDuration, 10), 30)

  const response = await fetch('http://localhost:3001/api/elevenlabs', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      text: prompt,
      duration_seconds: cappedDuration,
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
