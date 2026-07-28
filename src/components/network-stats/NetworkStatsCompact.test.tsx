import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { NetworkStatsCompact } from './NetworkStatsCompact'

vi.mock('@getdashfy/ui', async () => {
  const actual = await vi.importActual('@getdashfy/ui')
  return {
    ...actual,
    useApiSubscription: vi.fn(),
  }
})

const { useApiSubscription } = await import('@getdashfy/ui')
import { networkStatsResponse } from '@/test-fixtures'

describe('NetworkStatsCompact', () => {
  it('should render loading state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: null,
      loading: true,
      lastUpdate: undefined,
    })

    render(<NetworkStatsCompact />)

    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('should show empty when no matching interface', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: networkStatsResponse,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<NetworkStatsCompact interface="eth999" />)

    expect(screen.getByText('No active network interface found')).toBeTruthy()
  })

  it('should render traffic for selected interface', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: networkStatsResponse,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<NetworkStatsCompact interface="en0" />)

    expect(screen.getByText(/en0/)).toBeTruthy()
  })
})
