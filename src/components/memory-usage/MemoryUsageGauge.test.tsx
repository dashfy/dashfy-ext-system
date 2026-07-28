import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { MemoryUsageGauge } from './MemoryUsageGauge'

vi.mock('@dashfy/ui', async () => {
  const actual = await vi.importActual('@dashfy/ui')
  return {
    ...actual,
    useApiSubscription: vi.fn(),
  }
})

const { useApiSubscription } = await import('@dashfy/ui')
import { memoryUsageResponse } from '@/test-fixtures'

describe('MemoryUsageGauge', () => {
  it('should render loading state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: null,
      loading: true,
      lastUpdate: undefined,
    })

    render(<MemoryUsageGauge />)

    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('should render Memory gauge', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: memoryUsageResponse,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<MemoryUsageGauge />)

    expect(screen.getByTestId('gauge-mock')).toHaveTextContent('Memory')
  })
})
