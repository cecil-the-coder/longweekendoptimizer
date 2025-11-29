import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import HelloWorld from '../HelloWorld'

describe('HelloWorld Component', () => {
  it('renders default greeting', () => {
    render(<HelloWorld />)
    expect(screen.getByText('Hello, World!')).toBeInTheDocument()
  })

  it('renders custom name greeting', () => {
    render(<HelloWorld name="React" />)
    expect(screen.getByText('Hello, React!')).toBeInTheDocument()
  })

  it('displays welcome message', () => {
    render(<HelloWorld />)
    expect(screen.getByText('Welcome to HolidayHacker')).toBeInTheDocument()
  })

  it('renders count button', () => {
    render(<HelloWorld />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Count is 0')
  })

  it('increments count when button is clicked', () => {
    const { getByRole } = render(<HelloWorld />)
    const button = getByRole('button')

    // Initial state
    expect(button).toHaveTextContent('Count is 0')

    // Click button using fireEvent to properly handle React state updates
    fireEvent.click(button)
    expect(button).toHaveTextContent('Count is 1')
  })
})