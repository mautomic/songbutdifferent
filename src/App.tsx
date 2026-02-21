import { useState, useCallback } from 'react'
import { AudioUpload } from './components/AudioUpload'
import { GenreSelector } from './components/GenreSelector'
import { ResultsDisplay } from './components/ResultsDisplay'
import { analyzeAudioBuffer, type AudioAnalysis } from './lib/audioAnalysis'
import { generateGenrePrompt, parseClaudeResponse } from './lib/claudeApi'
import { generateMusic, blobToObjectUrl } from './lib/elevenLabsApi'

type Phase = 'idle' | 'analyzing' | 'generating-prompt' | 'generating-music' | 'done' | 'error'

interface Keys { openaiKey: string; elevenLabsKey: string }

const STORAGE_KEY = 'sbd-api-keys'

function loadKeys(): Keys {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    // Use stored keys if available, otherwise fall back to env vars
    return {
      openaiKey: stored.openaiKey || (import.meta.env.VITE_OPENAI_API_KEY ?? ''),
      elevenLabsKey: stored.elevenLabsKey || (import.meta.env.VITE_ELEVENLABS_API_KEY ?? ''),
    }
  } catch {
    return {
      openaiKey: import.meta.env.VITE_OPENAI_API_KEY ?? '',
      elevenLabsKey: import.meta.env.VITE_ELEVENLABS_API_KEY ?? '',
    }
  }
}

export default function App() {
  const [keys, setKeys] = useState<Keys>(loadKeys)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [genre, setGenre] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [analysis, setAnalysis] = useState<AudioAnalysis | null>(null)
  const [detection, setDetection] = useState('')
  const [elevenLabsPrompt, setElevenLabsPrompt] = useState('')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback((file: File) => {
    setAudioFile(file)
    setPhase('idle')
    setAnalysis(null)
    setAudioUrl(null)
    setError(null)
  }, [])

  async function handleTransform() {
    if (!audioFile || !genre) return
    if (!keys.openaiKey || !keys.elevenLabsKey) {
      setError('API keys not configured. Set VITE_OPENAI_API_KEY and VITE_ELEVENLABS_API_KEY in your .env file.')
      return
    }

    try {
      // Step 1: Decode audio
      setPhase('analyzing')
      const arrayBuffer = await audioFile.arrayBuffer()
      const audioCtx = new AudioContext()
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
      const result = await analyzeAudioBuffer(audioBuffer)
      setAnalysis(result)

      // Step 2: Generate prompt via OpenAI
      setPhase('generating-prompt')
      const rawResponse = await generateGenrePrompt(result, genre, keys.openaiKey)
      const { detection: det, elevenLabsPrompt: prompt } = parseClaudeResponse(rawResponse)
      setDetection(det)
      setElevenLabsPrompt(prompt)

      // Step 3: Generate music via ElevenLabs
      setPhase('generating-music')
      const blob = await generateMusic(prompt, keys.elevenLabsKey, result.durationSeconds)
      setAudioUrl(blobToObjectUrl(blob))
      setPhase('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setPhase('error')
    }
  }

  const PHASE_MESSAGES: Record<Phase, string> = {
    idle: '',
    analyzing: 'Analyzing your song with great confidence...',
    'generating-prompt': 'Consulting OpenAI about your questionable taste...',
    'generating-music': 'ElevenLabs is cooking something up...',
    done: '',
    error: '',
  }

  const canTransform = audioFile && genre && phase !== 'analyzing' &&
    phase !== 'generating-prompt' && phase !== 'generating-music'

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-white">Song But Different</h1>
          <p className="text-gray-400 mt-1">Upload a song. Get it back as something else. Probably worse.</p>
        </header>

        <AudioUpload onFile={handleFile} />

        <GenreSelector selected={genre} onSelect={setGenre} />

        <button
          onClick={handleTransform}
          disabled={!canTransform}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg font-semibold text-lg transition-colors"
        >
          Transform
        </button>

        {PHASE_MESSAGES[phase] && (
          <p className="text-center text-gray-400 animate-pulse">{PHASE_MESSAGES[phase]}</p>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300 text-sm">
            {error}
          </div>
        )}

        {phase === 'done' && analysis && (
          <ResultsDisplay
            analysis={analysis}
            detection={detection}
            elevenLabsPrompt={elevenLabsPrompt}
            audioUrl={audioUrl}
          />
        )}
      </div>
    </div>
  )
}
