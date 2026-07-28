import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { CpuUsageGauge } from './CpuUsageGauge'

vi.mock('@dashfy/ui', async () => {
  const actual = await vi.importActual('@dashfy/ui')
  return {
    ...actual,
    useApiSubscription: vi.fn(),
  }
})

const { useApiSubscription } = await import('@dashfy/ui')
import { cpuUsageResponse } from '@/test-fixtures'

describe('CpuUsageGauge', () => {
  it('should render loading state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: null,
      loading: true,
      lastUpdate: undefined,
    })

    render(<CpuUsageGauge />)

    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('should render gauge for CPU', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: cpuUsageResponse,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<CpuUsageGauge />)

    expect(screen.getByTestId('gauge-mock')).toHaveTextContent('CPU')
  })
})
