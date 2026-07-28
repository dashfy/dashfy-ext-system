import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { MemoryUsageLine } from './MemoryUsageLine'

vi.mock('@getdashfy/ui', async () => {
  const actual = await vi.importActual('@getdashfy/ui')
  return {
    ...actual,
    useApiSubscription: vi.fn(),
  }
})

const { useApiSubscription } = await import('@getdashfy/ui')
import { memoryUsageResponse } from '@/test-fixtures'

describe('MemoryUsageLine', () => {
  it('should render loading state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: null,
      loading: true,
      lastUpdate: undefined,
    })

    render(<MemoryUsageLine />)

    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('should render liveline after data', async () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: memoryUsageResponse,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<MemoryUsageLine />)

    await waitFor(() => {
      expect(screen.getByTestId('liveline-mock')).toBeTruthy()
    })
  })
})
