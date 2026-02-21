import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AudioUpload } from './AudioUpload'

describe('AudioUpload', () => {
  it('calls onFile when a file is selected', () => {
    const onFile = vi.fn()
    render(<AudioUpload onFile={onFile} />)
    const file = new File(['audio'], 'song.mp3', { type: 'audio/mpeg' })
    const input = screen.getByLabelText(/upload/i)
    fireEvent.change(input, { target: { files: [file] } })
    expect(onFile).toHaveBeenCalledWith(file)
  })

  it('shows filename after selection', () => {
    render(<AudioUpload onFile={vi.fn()} />)
    const file = new File(['audio'], 'mysong.mp3', { type: 'audio/mpeg' })
    fireEvent.change(screen.getByLabelText(/upload/i), { target: { files: [file] } })
    expect(screen.getByText(/mysong\.mp3/i)).toBeTruthy()
  })
})
