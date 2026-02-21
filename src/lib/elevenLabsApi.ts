export async function generateMusic(prompt: string, apiKey: string): Promise<Blob> {
  const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      text: prompt,
      duration_seconds: 22,
      prompt_influence: 0.5,
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
