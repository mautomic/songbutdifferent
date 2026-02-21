import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SongInfo } from './SongInfo'

describe('SongInfo', () => {
  it('renders artist and title input fields', () => {
    render(
      <SongInfo artist="" title="" onUpdate={vi.fn()} />
    )
    expect(screen.getByLabelText(/artist/i)).toBeTruthy()
    expect(screen.getByLabelText(/song title/i)).toBeTruthy()
  })

  it('displays initial artist and title values', () => {
    render(
      <SongInfo artist="The Beatles" title="Let It Be" onUpdate={vi.fn()} />
    )
    const artistInput = screen.getByLabelText(/artist/i) as HTMLInputElement
    const titleInput = screen.getByLabelText(/song title/i) as HTMLInputElement
    expect(artistInput.value).toBe('The Beatles')
    expect(titleInput.value).toBe('Let It Be')
  })

  it('calls onUpdate with new artist value on artist input change', () => {
    const onUpdate = vi.fn()
    render(
      <SongInfo artist="Original Artist" title="Original Title" onUpdate={onUpdate} />
    )
    const artistInput = screen.getByLabelText(/artist/i)
    fireEvent.change(artistInput, { target: { value: 'New Artist' } })
    expect(onUpdate).toHaveBeenCalledWith({
      artist: 'New Artist',
      title: 'Original Title'
    })
  })

  it('calls onUpdate with new title value on title input change', () => {
    const onUpdate = vi.fn()
    render(
      <SongInfo artist="Original Artist" title="Original Title" onUpdate={onUpdate} />
    )
    const titleInput = screen.getByLabelText(/song title/i)
    fireEvent.change(titleInput, { target: { value: 'New Title' } })
    expect(onUpdate).toHaveBeenCalledWith({
      artist: 'Original Artist',
      title: 'New Title'
    })
  })

  it('updates local state when artist changes', () => {
    render(
      <SongInfo artist="Original Artist" title="Title" onUpdate={vi.fn()} />
    )
    const artistInput = screen.getByLabelText(/artist/i) as HTMLInputElement
    fireEvent.change(artistInput, { target: { value: 'Updated Artist' } })
    expect(artistInput.value).toBe('Updated Artist')
  })

  it('updates local state when title changes', () => {
    render(
      <SongInfo artist="Artist" title="Original Title" onUpdate={vi.fn()} />
    )
    const titleInput = screen.getByLabelText(/song title/i) as HTMLInputElement
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } })
    expect(titleInput.value).toBe('Updated Title')
  })

  it('calls onUpdate on every keystroke for artist', () => {
    const onUpdate = vi.fn()
    render(
      <SongInfo artist="A" title="Title" onUpdate={onUpdate} />
    )
    const artistInput = screen.getByLabelText(/artist/i)
    fireEvent.change(artistInput, { target: { value: 'AB' } })
    fireEvent.change(artistInput, { target: { value: 'ABC' } })
    fireEvent.change(artistInput, { target: { value: 'ABCD' } })
    expect(onUpdate).toHaveBeenCalledTimes(3)
  })

  it('calls onUpdate on every keystroke for title', () => {
    const onUpdate = vi.fn()
    render(
      <SongInfo artist="Artist" title="T" onUpdate={onUpdate} />
    )
    const titleInput = screen.getByLabelText(/song title/i)
    fireEvent.change(titleInput, { target: { value: 'Ti' } })
    fireEvent.change(titleInput, { target: { value: 'Tit' } })
    expect(onUpdate).toHaveBeenCalledTimes(2)
  })

  it('maintains independent state for artist and title', () => {
    const onUpdate = vi.fn()
    render(
      <SongInfo artist="Artist A" title="Title B" onUpdate={onUpdate} />
    )
    const artistInput = screen.getByLabelText(/artist/i) as HTMLInputElement
    const titleInput = screen.getByLabelText(/song title/i) as HTMLInputElement

    fireEvent.change(artistInput, { target: { value: 'Artist X' } })
    expect(artistInput.value).toBe('Artist X')
    expect(titleInput.value).toBe('Title B')

    fireEvent.change(titleInput, { target: { value: 'Title Y' } })
    expect(artistInput.value).toBe('Artist X')
    expect(titleInput.value).toBe('Title Y')
  })

  it('shows placeholder text for empty inputs', () => {
    render(
      <SongInfo artist="" title="" onUpdate={vi.fn()} />
    )
    const artistInput = screen.getByPlaceholderText(/enter artist name/i)
    const titleInput = screen.getByPlaceholderText(/enter song title/i)
    expect(artistInput).toBeTruthy()
    expect(titleInput).toBeTruthy()
  })
})
