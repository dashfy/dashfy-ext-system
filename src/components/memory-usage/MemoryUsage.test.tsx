import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { MemoryUsage } from './MemoryUsage'

vi.mock('@getdashfy/ui', async () => {
  const actual = await vi.importActual('@getdashfy/ui')
  return {
    ...actual,
    useApiSubscription: vi.fn(),
  }
})

const { useApiSubscription } = await import('@getdashfy/ui')
import { memoryUsageNoSwap, memoryUsageResponse } from '@/test-fixtures'

describe('MemoryUsage', () => {
  it('should render loading state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: null,
      loading: true,
      lastUpdate: undefined,
    })

    render(<MemoryUsage />)

    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('should render error state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: 'Memory error',
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<MemoryUsage />)

    expect(screen.getByText(/Memory error/i)).toBeTruthy()
  })

  it('should render RAM and swap when enabled', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: memoryUsageResponse,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<MemoryUsage />)

    expect(screen.getByText('RAM')).toBeTruthy()
    expect(screen.getByText('Swap')).toBeTruthy()
  })

  it('should hide swap when disabled or no swap', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: memoryUsageNoSwap,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    const { rerender } = render(<MemoryUsage showSwap />)

    expect(screen.queryByText('Swap')).toBeNull()

    vi.mocked(useApiSubscription).mockReturnValue({
      data: memoryUsageResponse,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    rerender(<MemoryUsage showSwap={false} />)

    expect(screen.queryByText('Swap')).toBeNull()
  })
})
