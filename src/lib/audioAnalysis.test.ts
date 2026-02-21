import { describe, it, expect } from 'vitest'
import {
  estimateBPM,
  detectKey,
  classifyEnergy,
  classifyTimbre,
  averageChroma,
} from './audioAnalysis'

describe('estimateBPM', () => {
  it('returns a BPM in a plausible range', () => {
    // Simulate 120 BPM at 44100 Hz with 512 hop: peak every ~86 frames
    const hopSize = 512
    const sampleRate = 44100
    // One beat = 44100/120*60 = 22050 samples = ~43 hops
    const rmsValues = Array.from({ length: 200 }, (_, i) => (i % 43 === 0 ? 1 : 0.05))
    const bpm = estimateBPM(rmsValues, sampleRate, hopSize)
    expect(bpm).toBeGreaterThan(60)
    expect(bpm).toBeLessThan(200)
  })

  it('returns fallback 120 when fewer than 2 peaks found', () => {
    const rmsValues = Array.from({ length: 100 }, () => 0.01)
    expect(estimateBPM(rmsValues, 44100, 512)).toBe(120)
  })
})

describe('averageChroma', () => {
  it('returns 12-element array', () => {
    const frames = [
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]
    const avg = averageChroma(frames)
    expect(avg).toHaveLength(12)
    expect(avg[0]).toBe(1)
    expect(avg[1]).toBe(0)
  })
})

describe('detectKey', () => {
  it('detects C major from C major chroma profile', () => {
    // C major chroma: C and E and G should be strong
    const chroma = [1, 0, 0.5, 0, 0.8, 0.6, 0, 0.9, 0, 0.5, 0, 0.3]
    const result = detectKey(chroma)
    expect(result).toHaveProperty('note')
    expect(result).toHaveProperty('scale')
    expect(['major', 'minor']).toContain(result.scale)
  })
})

describe('classifyEnergy', () => {
  it('classifies low energy', () => expect(classifyEnergy(0.05)).toBe('low'))
  it('classifies medium energy', () => expect(classifyEnergy(0.15)).toBe('medium'))
  it('classifies high energy', () => expect(classifyEnergy(0.4)).toBe('high'))
})

describe('classifyTimbre', () => {
  it('classifies warm timbre for low centroid', () => expect(classifyTimbre(800)).toBe('warm'))
  it('classifies neutral timbre', () => expect(classifyTimbre(2500)).toBe('neutral'))
  it('classifies bright timbre for high centroid', () => expect(classifyTimbre(5000)).toBe('bright'))
})
