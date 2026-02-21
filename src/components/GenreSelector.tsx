const GENRES = [
  'Jazz', 'Bossa Nova', 'Norwegian Death Metal', 'Country',
  'Smooth R&B', 'Celtic Folk', 'Hip Hop', 'Soul',
  'Yacht Rock', 'Punk Rock', 'Pop', 'Reggaeton',
  'Gospel', 'Funk', 'Indie Rock', 'Blues', 'Disco',
]

interface Props {
  selected: string | null
  onSelect: (genre: string) => void
}

export function GenreSelector({ selected, onSelect }: Props) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Target Genre
      </h2>
      <div className="flex flex-wrap gap-2">
        {GENRES.map(genre => (
          <button
            key={genre}
            onClick={() => onSelect(genre)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              selected === genre
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-indigo-500'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  )
}
