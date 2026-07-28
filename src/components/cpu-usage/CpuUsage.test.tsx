import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { CpuUsage } from './CpuUsage'

vi.mock('@getdashfy/ui', async () => {
  const actual = await vi.importActual('@getdashfy/ui')
  return {
    ...actual,
    useApiSubscription: vi.fn(),
  }
})

const { useApiSubscription } = await import('@getdashfy/ui')
import { cpuUsageResponse } from '@/test-fixtures'

describe('CpuUsage', () => {
  it('should render loading state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: null,
      loading: true,
      lastUpdate: undefined,
    })

    render(<CpuUsage />)

    expect(screen.getByText('System')).toBeTruthy()
    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('should render error state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: 'CPU error',
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<CpuUsage />)

    expect(screen.getByText(/CPU error/i)).toBeTruthy()
  })

  it('should render overall load and optional cores', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: cpuUsageResponse,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    const { rerender } = render(<CpuUsage />)

    expect(screen.getByText('Overall')).toBeTruthy()

    rerender(<CpuUsage showCores />)

    expect(screen.getByText('Per Core')).toBeTruthy()
  })
})
