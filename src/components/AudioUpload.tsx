import { useState } from 'react'

interface Props {
  onFile: (file: File) => void
}

export function AudioUpload({ onFile }: Props) {
  const [filename, setFilename] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFilename(file.name)
    onFile(file)
  }

  return (
    <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
      <label htmlFor="audio-upload" className="cursor-pointer">
        <div className="text-4xl mb-3">🎵</div>
        <div className="text-lg font-semibold text-gray-200">
          {filename ?? 'Drop your song here or click to upload'}
        </div>
        <div className="text-sm text-gray-500 mt-1">MP3, WAV, FLAC, M4A</div>
        <input
          id="audio-upload"
          type="file"
          accept="audio/*"
          onChange={handleChange}
          className="sr-only"
          aria-label="Upload audio file"
        />
      </label>
    </div>
  )
}
