import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// OpenAI API proxy
app.post('/api/openai', async (req, res) => {
  try {
    const { messages, model, max_tokens, apiKey } = req.body

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens,
        messages,
      }),
    })

    if (!response.ok) {
      return res.status(response.status).json({ error: 'OpenAI API error' })
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
      const errorText = await response.text()
      console.error(`ElevenLabs error ${response.status}:`, errorText)
      return res.status(response.status).json({
        error: 'ElevenLabs API error',
        details: errorText,
        status: response.status
      })
    }

    const blob = await response.arrayBuffer()
    res.setHeader('Content-Type', 'audio/mpeg')
    res.send(Buffer.from(blob))
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' })
  }
})

// Lyrics API proxy
app.get('/api/lyrics', async (req, res) => {
  try {
    const { artist, title } = req.query

    if (!artist || !title) {
      return res.json({ lyrics: '' })
    }

    const encodedArtist = encodeURIComponent(artist as string)
    const encodedTitle = encodeURIComponent(title as string)

    const response = await fetch(`https://api.lyrics.ovh/v1/${encodedArtist}/${encodedTitle}`)

    if (!response.ok) {
      return res.json({ lyrics: '' })
    }

    const data = await response.json()
    res.json({ lyrics: data.lyrics || '' })
  } catch (error) {
    res.json({ lyrics: '' })
  }
})

app.listen(PORT, () => {
  console.log(`Backend proxy running on http://localhost:${PORT}`)
})
