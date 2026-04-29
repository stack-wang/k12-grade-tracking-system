import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { AuthProvider, useAuth } from '../context/AuthContext'

function TestComponent() {
  const { token, parentName, isAuthenticated, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="token">{token || 'null'}</span>
      <span data-testid="name">{parentName || 'null'}</span>
      <span data-testid="auth">{isAuthenticated ? 'true' : 'false'}</span>
      <button data-testid="login-btn" onClick={() => login('test-token', 'TestParent')}>
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  )
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>,
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('provides default unauthenticated state', () => {
    renderWithProvider()
    expect(screen.getByTestId('token')).toHaveTextContent('null')
    expect(screen.getByTestId('name')).toHaveTextContent('null')
    expect(screen.getByTestId('auth')).toHaveTextContent('false')
  })

  it('updates state after login', () => {
    renderWithProvider()
    act(() => {
      screen.getByTestId('login-btn').click()
    })
    expect(screen.getByTestId('token')).toHaveTextContent('test-token')
    expect(screen.getByTestId('name')).toHaveTextContent('TestParent')
    expect(screen.getByTestId('auth')).toHaveTextContent('true')
    expect(localStorage.getItem('token')).toBe('test-token')
    expect(localStorage.getItem('parent_name')).toBe('TestParent')
  })

  it('clears state after logout', () => {
    renderWithProvider()
    act(() => {
      screen.getByTestId('login-btn').click()
    })
    act(() => {
      screen.getByTestId('logout-btn').click()
    })
    expect(screen.getByTestId('token')).toHaveTextContent('null')
    expect(screen.getByTestId('name')).toHaveTextContent('null')
    expect(screen.getByTestId('auth')).toHaveTextContent('false')
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('parent_name')).toBeNull()
  })

  it('restores state from localStorage on mount', () => {
    localStorage.setItem('token', 'saved-token')
    localStorage.setItem('parent_name', 'SavedParent')
    renderWithProvider()
    expect(screen.getByTestId('token')).toHaveTextContent('saved-token')
    expect(screen.getByTestId('name')).toHaveTextContent('SavedParent')
    expect(screen.getByTestId('auth')).toHaveTextContent('true')
  })
})
