import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ResultsDisplay } from './ResultsDisplay'
import type { AudioAnalysis } from '../lib/audioAnalysis'

const analysis: AudioAnalysis = {
  bpm: 87, key: { note: 'A', scale: 'minor' },
  energy: 'medium', timbre: 'warm', durationSeconds: 180,
}

describe('ResultsDisplay', () => {
  it('shows analysis data', () => {
    render(<ResultsDisplay analysis={analysis} detection="Corporate sadness detected." elevenLabsPrompt="Jazz prompt" audioUrl={null} />)
    expect(screen.getByText(/87 BPM/i)).toBeTruthy()
    expect(screen.getByText(/A minor/i)).toBeTruthy()
  })

  it('shows detection blurb', () => {
    render(<ResultsDisplay analysis={analysis} detection="Corporate sadness detected." elevenLabsPrompt="Jazz prompt" audioUrl={null} />)
    expect(screen.getByText(/Corporate sadness detected\./)).toBeTruthy()
  })

  it('renders audio player when url is provided', () => {
    render(<ResultsDisplay analysis={analysis} detection="blurb" elevenLabsPrompt="prompt" audioUrl="blob:example" />)
    expect(screen.getByRole('region', { name: /result/i })).toBeTruthy()
  })
})
