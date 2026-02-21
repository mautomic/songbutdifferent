import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// Claude API proxy
app.post('/api/claude', async (req, res) => {
  try {
    const { messages, system, model, max_tokens, apiKey } = req.body

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens,
        system,
        messages,
      }),
    })

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Claude API error' })
    }

    const data = await response.json()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' })
  }
})

// ElevenLabs API proxy
app.post('/api/elevenlabs', async (req, res) => {
  try {
    const { text, duration_seconds, prompt_influence, apiKey } = req.body

    const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        text,
        duration_seconds,
        prompt_influence,
      }),
    })

    if (!response.ok) {
      return res.status(response.status).json({ error: 'ElevenLabs API error' })
    }

    const blob = await response.arrayBuffer()
    res.setHeader('Content-Type', 'audio/mpeg')
    res.send(Buffer.from(blob))
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' })
  }
})

app.listen(PORT, () => {
  console.log(`Backend proxy running on http://localhost:${PORT}`)
})
