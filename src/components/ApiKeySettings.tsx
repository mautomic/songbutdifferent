import { useState } from 'react'

interface Props {
  onSave: (keys: { claudeKey: string; elevenLabsKey: string }) => void
  initialClaudeKey: string
  initialElevenLabsKey: string
}

export function ApiKeySettings({ onSave, initialClaudeKey, initialElevenLabsKey }: Props) {
  const [claudeKey, setClaudeKey] = useState(initialClaudeKey)
  const [elevenLabsKey, setElevenLabsKey] = useState(initialElevenLabsKey)
  const [show, setShow] = useState(false)

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-3">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">API Keys</h2>
      <div>
        <label htmlFor="claude-key" className="block text-sm text-gray-300 mb-1">Claude API Key</label>
        <input
          id="claude-key"
          type={show ? 'text' : 'password'}
          value={claudeKey}
          onChange={e => setClaudeKey(e.target.value)}
          placeholder="sk-ant-..."
          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white"
        />
      </div>
      <div>
        <label htmlFor="el-key" className="block text-sm text-gray-300 mb-1">ElevenLabs API Key</label>
        <input
          id="el-key"
          type={show ? 'text' : 'password'}
          value={elevenLabsKey}
          onChange={e => setElevenLabsKey(e.target.value)}
          placeholder="..."
          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white"
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => onSave({ claudeKey, elevenLabsKey })}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded"
        >
          Save Keys
        </button>
        <button
          onClick={() => setShow(s => !s)}
          className="text-gray-400 text-sm underline"
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
      <p className="text-xs text-gray-500">Keys stored in localStorage. Never sent anywhere except the respective APIs.</p>
    </div>
  )
}
