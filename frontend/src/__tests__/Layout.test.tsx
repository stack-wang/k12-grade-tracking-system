import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import Layout from '../components/Layout'

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

import api from '../api'

function renderLayout(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <Layout>
          <div data-testid="child-content">Page Content</div>
        </Layout>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('Layout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('parent_name', 'TestParent')
  })

  it('renders hamburger menu button for mobile', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] })
    renderLayout()
    await waitFor(() => {
      expect(screen.getByLabelText('menu')).toBeInTheDocument()
    })
  })

  it('renders child content', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] })
    renderLayout()
    await waitFor(() => {
      expect(screen.getByTestId('child-content')).toBeInTheDocument()
    })
  })

  it('shows logout button in header', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] })
    renderLayout()
    await waitFor(() => {
      expect(screen.getByLabelText('logout')).toBeInTheDocument()
    })
  })

  it('shows setup modal when no child exists', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] })
    renderLayout()
    await waitFor(() => {
      expect(screen.getByText('初次使用 - 添加孩子信息')).toBeInTheDocument()
    })
  })

  it('shows child info in header when child exists', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: [{ id: 1, name: '小明', gender: '男', grade: '三年级', school_name: '实验小学' }],
    })
    renderLayout()
    await waitFor(() => {
      expect(screen.getByText('小明 · 三年级')).toBeInTheDocument()
    })
  })

  it('opens drawer with menu items when hamburger clicked', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] })
    renderLayout()
    await waitFor(() => {
      expect(screen.getByLabelText('menu')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByLabelText('menu'))
    await waitFor(() => {
      expect(screen.getByText('仪表盘')).toBeInTheDocument()
      expect(screen.getByText('成绩录入')).toBeInTheDocument()
    })
  })

  it('does not show setup modal when child exists', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: [{ id: 1, name: '小明', gender: '男', grade: '三年级', school_name: '实验小学' }],
    })
    renderLayout()
    await waitFor(() => {
      expect(screen.queryByText('初次使用 - 添加孩子信息')).not.toBeInTheDocument()
    })
  })
})
