import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('does not render lyrics section when lyrics prop is undefined', () => {
    render(<ResultsDisplay analysis={analysis} detection="blurb" elevenLabsPrompt="prompt" audioUrl={null} />)
    expect(screen.queryByText(/^Lyrics$/i)).toBeNull()
  })

  it('does not render lyrics section when lyrics prop is empty string', () => {
    render(<ResultsDisplay analysis={analysis} detection="blurb" elevenLabsPrompt="prompt" audioUrl={null} lyrics="" />)
    expect(screen.queryByText(/^Lyrics$/i)).toBeNull()
  })

  it('renders lyrics section when lyrics prop is provided', () => {
    render(<ResultsDisplay analysis={analysis} detection="blurb" elevenLabsPrompt="prompt" audioUrl={null} lyrics="This is my song" />)
    expect(screen.getByText(/^Lyrics$/i)).toBeTruthy()
  })

  it('displays full lyrics text when section is expanded', async () => {
    const user = userEvent.setup()
    const lyricsText = "Verse 1\nThis is the first verse\nChorus\nThis is the chorus"
    render(<ResultsDisplay analysis={analysis} detection="blurb" elevenLabsPrompt="prompt" audioUrl={null} lyrics={lyricsText} />)

    const button = screen.getByRole('button', { name: /lyrics/i })
    await user.click(button)

    // Check that all parts of the lyrics are visible
    expect(screen.getByText(/Verse 1/)).toBeTruthy()
    expect(screen.getByText(/This is the first verse/)).toBeTruthy()
    expect(screen.getByText(/Chorus/)).toBeTruthy()
    expect(screen.getByText(/This is the chorus/)).toBeTruthy()
  })

  it('hides lyrics text when section is collapsed', async () => {
    const user = userEvent.setup()
    const lyricsText = "Verse 1\nThis is the first verse"
    render(<ResultsDisplay analysis={analysis} detection="blurb" elevenLabsPrompt="prompt" audioUrl={null} lyrics={lyricsText} />)

    const button = screen.getByRole('button', { name: /lyrics/i })
    await user.click(button)
    await user.click(button)

    expect(screen.queryByText(lyricsText)).toBeNull()
  })

  it('toggles lyrics section with button clicks', async () => {
    const user = userEvent.setup()
    const lyricsText = "Line 1\nLine 2"
    render(<ResultsDisplay analysis={analysis} detection="blurb" elevenLabsPrompt="prompt" audioUrl={null} lyrics={lyricsText} />)

    const button = screen.getByRole('button', { name: /lyrics/i })
    expect(button).toHaveAttribute('aria-expanded', 'false')

    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')

    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })
})
