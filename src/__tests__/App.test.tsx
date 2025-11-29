import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from '../App'

// Mock HolidayProvider to avoid context issues in simple component test
vi.mock('../context/HolidayContext', () => ({
  HolidayProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock the components to isolate App test
vi.mock('../components/HolidayForm', () => ({
  default: () => <div data-testid="holiday-form">HolidayForm</div>,
}))

vi.mock('../components/HolidayList', () => ({
  default: () => <div data-testid="holiday-list">HolidayList</div>,
}))

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />)
  })

  it('renders main heading', () => {
    render(<App />)
    expect(screen.getByText('HolidayHacker')).toBeInTheDocument()
  })

  it('renders subtitle', () => {
    render(<App />)
    expect(screen.getByText('Add your company holidays to find long weekends')).toBeInTheDocument()
  })

  it('renders HolidayForm component', () => {
    render(<App />)
    expect(screen.getByTestId('holiday-form')).toBeInTheDocument()
  })

  it('renders HolidayList component', () => {
    render(<App />)
    expect(screen.getByTestId('holiday-list')).toBeInTheDocument()
  })

  it('has proper layout structure', () => {
    render(<App />)

    // Check for main container
    const mainContainer = document.querySelector('.min-h-screen')
    expect(mainContainer).toBeTruthy()

    // Check for header
    const header = screen.getByRole('heading', { name: 'HolidayHacker' })
    expect(header).toBeInTheDocument()
    expect(header).toHaveClass('text-3xl', 'font-bold', 'text-blue-700')
  })
})