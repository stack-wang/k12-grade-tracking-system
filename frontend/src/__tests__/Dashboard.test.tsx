import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import Dashboard from '../pages/Dashboard'

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
  },
}))

import api from '../api'

function renderDashboard() {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    </BrowserRouter>,
  )
}

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem('token', 'test-token')
  })

  it('renders without crashing on initial load', () => {
    vi.mocked(api.get).mockImplementation(() => new Promise(() => { }))
    const { container } = renderDashboard()
    expect(container.querySelector('.ant-spin')).toBeTruthy()
  })

  it('renders statistics after loading', async () => {
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === '/exams') return Promise.resolve({ data: [{ id: 1, name: '期中考试', exam_date: '2024-11-15' }] })
      if (url === '/subjects') return Promise.resolve({ data: [{ id: 1, name: '数学' }] })
      if (url === '/reports/full') return Promise.resolve({ data: { all_scores: [] } })
      if (url === '/reports/trends') return Promise.resolve({ data: [] })
      if (url === '/reports/warnings') return Promise.resolve({ data: [] })
      if (url === '/reports/strength-weakness') return Promise.resolve({ data: null })
      return Promise.reject(new Error('unknown'))
    })

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('考试次数')).toBeInTheDocument()
      expect(screen.getByText('科目数量')).toBeInTheDocument()
      expect(screen.getByText('最近平均分')).toBeInTheDocument()
      expect(screen.getByText('成绩记录数')).toBeInTheDocument()
    })
  })

  it('displays no data message when empty', async () => {
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === '/exams') return Promise.resolve({ data: [] })
      if (url === '/subjects') return Promise.resolve({ data: [] })
      if (url === '/reports/full') return Promise.resolve({ data: { all_scores: [] } })
      if (url === '/reports/trends') return Promise.resolve({ data: [] })
      if (url === '/reports/warnings') return Promise.resolve({ data: [] })
      if (url === '/reports/strength-weakness') return Promise.resolve({ data: null })
      return Promise.reject(new Error('unknown'))
    })

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('暂无数据，请先录入成绩')).toBeInTheDocument()
    })
  })

  it('renders recent scores table with data', async () => {
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === '/exams') return Promise.resolve({ data: [{ id: 1, name: '期中考试', exam_date: '2024-11-15' }] })
      if (url === '/subjects') return Promise.resolve({ data: [{ id: 1, name: '数学' }] })
      if (url === '/reports/full') {
        return Promise.resolve({
          data: {
            all_scores: [
              {
                subject_id: 1,
                subject_name: '数学',
                exam_id: 1,
                exam_name: '期中考试',
                exam_date: '2024-11-15',
                score: 95,
                max_score: 100,
                percentage: 95,
              },
            ],
          },
        })
      }
      if (url === '/reports/trends') return Promise.resolve({ data: [] })
      if (url === '/reports/warnings') return Promise.resolve({ data: [] })
      if (url === '/reports/strength-weakness') return Promise.resolve({ data: null })
      return Promise.reject(new Error('unknown'))
    })

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('数学')).toBeInTheDocument()
      expect(screen.getByText('95 / 100')).toBeInTheDocument()
      expect(screen.getByText('期中考试')).toBeInTheDocument()
    })
  })
})
