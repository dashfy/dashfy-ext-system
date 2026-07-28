import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { DiskUsageGauge } from './DiskUsageGauge'

vi.mock('@dashfy/ui', async () => {
  const actual = await vi.importActual('@dashfy/ui')
  return {
    ...actual,
    useApiSubscription: vi.fn(),
  }
})

const { useApiSubscription } = await import('@dashfy/ui')
import { diskUsageResponse } from '@/test-fixtures'

describe('DiskUsageGauge', () => {
  it('should render empty when mount missing', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: diskUsageResponse,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<DiskUsageGauge mount="/missing" />)

    expect(screen.getByText('No disk found')).toBeTruthy()
  })

  it('should render gauge for mount', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: diskUsageResponse,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<DiskUsageGauge mount="/home" />)

    expect(screen.getByTestId('gauge-mock')).toHaveTextContent('Disk')
    expect(screen.getByText(/\/home/)).toBeTruthy()
  })
})
