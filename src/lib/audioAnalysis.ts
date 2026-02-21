import Meyda from 'meyda'

export interface AudioAnalysis {
  bpm: number
  key: { note: string; scale: 'major' | 'minor' }
  energy: 'low' | 'medium' | 'high'
  timbre: 'bright' | 'neutral' | 'warm'
  durationSeconds: number
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
// Krumhansl-Schmuckler profiles
const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]

function pearsonCorrelation(a: number[], b: number[]): number {
  const n = a.length
  const meanA = a.reduce((s, v) => s + v, 0) / n
  const meanB = b.reduce((s, v) => s + v, 0) / n
  let num = 0, denA = 0, denB = 0
  for (let i = 0; i < n; i++) {
    num += (a[i] - meanA) * (b[i] - meanB)
    denA += (a[i] - meanA) ** 2
    denB += (b[i] - meanB) ** 2
  }
  return num / (Math.sqrt(denA) * Math.sqrt(denB) || 1)
}

export function averageChroma(frames: number[][]): number[] {
  const avg = new Array(12).fill(0)
  for (const frame of frames) {
    for (let i = 0; i < 12; i++) avg[i] += frame[i]
  }
  return avg.map(v => v / frames.length)
}

export function detectKey(avgChroma: number[]): { note: string; scale: 'major' | 'minor' } {
  let best = { note: 'C', scale: 'major' as const, corr: -Infinity }
  for (let i = 0; i < 12; i++) {
    const rotated = [...avgChroma.slice(i), ...avgChroma.slice(0, i)]
    const majorCorr = pearsonCorrelation(rotated, MAJOR_PROFILE)
    const minorCorr = pearsonCorrelation(rotated, MINOR_PROFILE)
    if (majorCorr > best.corr) best = { note: NOTE_NAMES[i], scale: 'major', corr: majorCorr }
    if (minorCorr > best.corr) best = { note: NOTE_NAMES[i], scale: 'minor', corr: minorCorr }
  }
  return { note: best.note, scale: best.scale }
}

export function estimateBPM(rmsValues: number[], sampleRate: number, hopSize: number): number {
  const threshold = Math.max(...rmsValues) * 0.5
  const peaks: number[] = []
  for (let i = 1; i < rmsValues.length - 1; i++) {
    if (rmsValues[i] > threshold && rmsValues[i] > rmsValues[i - 1] && rmsValues[i] > rmsValues[i + 1]) {
      if (peaks.length === 0 || i - peaks[peaks.length - 1] > 10) peaks.push(i)
    }
  }
  if (peaks.length < 2) return 120
  const intervals = peaks.slice(1).map((p, i) => p - peaks[i])
  const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length
  const secondsPerBeat = (avgInterval * hopSize) / sampleRate
  const bpm = Math.round(60 / secondsPerBeat)
  return Math.min(Math.max(bpm, 40), 220)
}

export function classifyEnergy(meanRms: number): 'low' | 'medium' | 'high' {
  if (meanRms < 0.1) return 'low'
  if (meanRms < 0.25) return 'medium'
  return 'high'
}

export function classifyTimbre(meanCentroid: number): 'bright' | 'neutral' | 'warm' {
  if (meanCentroid < 1500) return 'warm'
  if (meanCentroid < 4000) return 'neutral'
  return 'bright'
}

export async function analyzeAudioBuffer(audioBuffer: AudioBuffer): Promise<AudioAnalysis> {
  const channelData = audioBuffer.getChannelData(0)
  const sampleRate = audioBuffer.sampleRate
  const hopSize = 512
  const bufferSize = 512

  const rmsValues: number[] = []
  const chromaFrames: number[][] = []
  const centroidValues: number[] = []

  for (let offset = 0; offset + bufferSize <= channelData.length; offset += hopSize) {
    const frame = channelData.slice(offset, offset + bufferSize)
    const features = Meyda.extract(['rms', 'chroma', 'spectralCentroid'], frame) as {
      rms: number
      chroma: number[]
      spectralCentroid: number
    }
    if (features.rms != null) rmsValues.push(features.rms)
    if (features.chroma) chromaFrames.push(features.chroma)
    if (features.spectralCentroid != null) centroidValues.push(features.spectralCentroid)
  }

  const meanRms = rmsValues.reduce((a, b) => a + b, 0) / rmsValues.length
  const meanCentroid = centroidValues.reduce((a, b) => a + b, 0) / centroidValues.length
  const avgChroma = averageChroma(chromaFrames)

  return {
    bpm: estimateBPM(rmsValues, sampleRate, hopSize),
    key: detectKey(avgChroma),
    energy: classifyEnergy(meanRms),
    timbre: classifyTimbre(meanCentroid),
    durationSeconds: audioBuffer.duration,
  }
}
