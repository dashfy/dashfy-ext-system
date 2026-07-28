import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { CpuUsageLine } from './CpuUsageLine'

vi.mock('@dashfy/ui', async () => {
  const actual = await vi.importActual('@dashfy/ui')
  return {
    ...actual,
    useApiSubscription: vi.fn(),
  }
})

const { useApiSubscription } = await import('@dashfy/ui')
import { cpuUsageResponse } from '@/test-fixtures'

describe('CpuUsageLine', () => {
  it('should render loading state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: null,
      loading: true,
      lastUpdate: undefined,
    })

    render(<CpuUsageLine />)

    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('should render liveline after data arrives', async () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: cpuUsageResponse,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<CpuUsageLine />)

    await waitFor(() => {
      expect(screen.getByTestId('liveline-mock')).toBeTruthy()
    })
  })
})
