import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test/utils'
import { Navigation } from '../navigation'

// Mock the auth context
vi.mock('../../contexts/auth-context', () => ({
  useAuth: () => ({
    user: null,
    signOut: vi.fn(),
    loading: false
  })
}))

describe('Navigation', () => {
  it('renders the Petify logo', () => {
    render(<Navigation />)
    
    expect(screen.getByText('Petify')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Navigation />)
    
    expect(screen.getAllByText('Find Services')).toHaveLength(2) // Desktop and mobile
    expect(screen.getAllByText('Become a Provider')).toHaveLength(2)
    expect(screen.getAllByText('How it Works')).toHaveLength(2)
  })

  it('shows sign in button when user is not authenticated', () => {
    render(<Navigation />)
    
    expect(screen.getAllByText('Sign In')).toHaveLength(2) // Desktop and mobile
  })

  it('renders mobile menu button', () => {
    render(<Navigation />)
    
    const menuButton = screen.getByRole('button', { name: /toggle mobile menu/i })
    expect(menuButton).toBeInTheDocument()
  })
})
