import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ApiKeySettings } from './ApiKeySettings'

describe('ApiKeySettings', () => {
  it('calls onSave when Claude key is changed', () => {
    const onSave = vi.fn()
    render(<ApiKeySettings onSave={onSave} initialClaudeKey="" initialElevenLabsKey="" />)

    fireEvent.change(screen.getByLabelText(/claude api key/i), { target: { value: 'claude-123' } })

    expect(onSave).toHaveBeenCalledWith({ claudeKey: 'claude-123', elevenLabsKey: '' })
  })

  it('calls onSave when ElevenLabs key is changed', () => {
    const onSave = vi.fn()
    render(<ApiKeySettings onSave={onSave} initialClaudeKey="" initialElevenLabsKey="" />)

    fireEvent.change(screen.getByLabelText(/elevenlabs api key/i), { target: { value: 'el-456' } })

    expect(onSave).toHaveBeenCalledWith({ claudeKey: '', elevenLabsKey: 'el-456' })
  })
})
