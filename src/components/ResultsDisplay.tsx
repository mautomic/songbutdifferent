import type { AudioAnalysis } from '../lib/audioAnalysis'

interface Props {
  analysis: AudioAnalysis
  detection: string
  elevenLabsPrompt: string
  audioUrl: string | null
}

export function ResultsDisplay({ analysis, detection, elevenLabsPrompt, audioUrl }: Props) {
  return (
    <div className="space-y-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">What We Detected</h3>
        <p className="text-gray-300 italic">{detection}</p>
        <div className="mt-3 flex gap-4 text-sm text-gray-400">
          <span>{analysis.bpm} BPM</span>
          <span>{analysis.key.note} {analysis.key.scale}</span>
          <span>{analysis.energy} energy</span>
          <span>{analysis.timbre} timbre</span>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">The Prompt We Sent</h3>
        <p className="text-gray-300 font-mono text-sm">{elevenLabsPrompt}</p>
      </div>

      {audioUrl && (
        <div aria-label="result" role="region" className="bg-gray-900 border border-indigo-700 rounded-lg p-4">
          <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">The Result</h3>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls src={audioUrl} className="w-full" />
        </div>
      )}
    </div>
  )
}
