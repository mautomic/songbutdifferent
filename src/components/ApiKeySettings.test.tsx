import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ApiKeySettings } from './ApiKeySettings'

describe('ApiKeySettings', () => {
  it('calls onSave with both keys when submitted', () => {
    const onSave = vi.fn()
    render(<ApiKeySettings onSave={onSave} initialClaudeKey="" initialElevenLabsKey="" />)

    fireEvent.change(screen.getByLabelText(/claude api key/i), { target: { value: 'claude-123' } })
    fireEvent.change(screen.getByLabelText(/elevenlabs api key/i), { target: { value: 'el-456' } })
    fireEvent.click(screen.getByRole('button', { name: /save keys/i }))

    expect(onSave).toHaveBeenCalledWith({ claudeKey: 'claude-123', elevenLabsKey: 'el-456' })
  })
})
