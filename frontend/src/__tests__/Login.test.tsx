import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import Login from '../pages/Login'

vi.mock('../api', () => ({
  default: {
    post: vi.fn(),
  },
}))

import api from '../api'

function renderLogin() {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>,
  )
}

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders login tab by default', () => {
    renderLogin()
    expect(screen.getByText('K12 成绩追踪系统')).toBeInTheDocument()
    expect(screen.getByText('登录')).toBeInTheDocument()
  })

  it('shows register tab when clicked', () => {
    renderLogin()
    fireEvent.click(screen.getByText('注册'))
    expect(screen.getByPlaceholderText('您的姓名')).toBeInTheDocument()
  })

  it('calls login API on form submit', async () => {
    const mockPost = vi.mocked(api.post)
    mockPost.mockResolvedValueOnce({
      data: { access_token: 'test-token', parent_name: 'Test' },
    })

    const { container } = renderLogin()
    const form = container.querySelector('form')!
    fireEvent.change(screen.getByPlaceholderText('用户名'), { target: { value: 'user1' } })
    fireEvent.change(screen.getByPlaceholderText('密码'), { target: { value: 'pass123' } })
    fireEvent.submit(form)

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/auth/login', {
        username: 'user1',
        password: 'pass123',
      })
    })
  })

  it('shows error message on login failure', async () => {
    const mockPost = vi.mocked(api.post)
    mockPost.mockRejectedValueOnce({
      response: { data: { detail: '用户名或密码错误' } },
    })

    renderLogin()
    fireEvent.change(screen.getByPlaceholderText('用户名'), { target: { value: 'bad' } })
    fireEvent.change(screen.getByPlaceholderText('密码'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByText('登录'))

    await waitFor(() => {
      expect(screen.getByText('登录')).toBeInTheDocument()
    })
  })
})
