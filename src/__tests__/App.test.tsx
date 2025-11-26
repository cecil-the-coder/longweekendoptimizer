import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../App'

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />)
  })

  it('renders HelloWorld component', () => {
    render(<App />)
    expect(screen.getByText('Hello, World!')).toBeInTheDocument()
  })

  it('renders welcome message', () => {
    render(<App />)
    expect(screen.getByText('Welcome to Long Weekend Optimizer')).toBeInTheDocument()
  })
})