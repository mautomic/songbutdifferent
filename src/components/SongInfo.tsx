import { useState, useEffect } from 'react'

interface Props {
  artist: string
  title: string
  onUpdate: (info: { artist: string; title: string }) => void
}

export function SongInfo({ artist, title, onUpdate }: Props) {
  const [localArtist, setLocalArtist] = useState(artist)
  const [localTitle, setLocalTitle] = useState(title)

  // Sync local state when props change
  useEffect(() => {
    setLocalArtist(artist)
    setLocalTitle(title)
  }, [artist, title])

  function handleArtistChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newArtist = e.target.value
    setLocalArtist(newArtist)
    onUpdate({ artist: newArtist, title: localTitle })
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newTitle = e.target.value
    setLocalTitle(newTitle)
    onUpdate({ artist: localArtist, title: newTitle })
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="artist" className="block text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Artist
        </label>
        <input
          id="artist"
          type="text"
          value={localArtist}
          onChange={handleArtistChange}
          placeholder="Enter artist name"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          aria-label="Artist name"
        />
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Song Title
        </label>
        <input
          id="title"
          type="text"
          value={localTitle}
          onChange={handleTitleChange}
          placeholder="Enter song title"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          aria-label="Song title"
        />
      </div>
    </div>
  )
}
