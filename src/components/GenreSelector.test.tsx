import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { GenreSelector } from './GenreSelector'

describe('GenreSelector', () => {
  it('renders all genre buttons', () => {
    render(<GenreSelector selected={null} onSelect={vi.fn()} />)
    expect(screen.getByText('Jazz')).toBeTruthy()
    expect(screen.getByText('Norwegian Death Metal')).toBeTruthy()
  })

  it('calls onSelect with the genre name', () => {
    const onSelect = vi.fn()
    render(<GenreSelector selected={null} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Bossa Nova'))
    expect(onSelect).toHaveBeenCalledWith('Bossa Nova')
  })

  it('marks selected genre', () => {
    render(<GenreSelector selected="Jazz" onSelect={vi.fn()} />)
    const btn = screen.getByText('Jazz').closest('button')
    expect(btn?.className).toMatch(/indigo/)
  })
})
