import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { NetworkStats } from './NetworkStats'

vi.mock('@dashfy/ui', async () => {
  const actual = await vi.importActual('@dashfy/ui')
  return {
    ...actual,
    useApiSubscription: vi.fn(),
  }
})

const { useApiSubscription } = await import('@dashfy/ui')
import { networkStatsNoActive, networkStatsResponse } from '@/test-fixtures'

describe('NetworkStats', () => {
  it('should render loading state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: null,
      loading: true,
      lastUpdate: undefined,
    })

    render(<NetworkStats />)

    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('should list active interfaces', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: networkStatsResponse,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<NetworkStats />)

    expect(screen.getByText('en0')).toBeTruthy()
    expect(screen.queryByText('lo0')).toBeNull()
  })

  it('should show empty when no active interfaces', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: networkStatsNoActive,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<NetworkStats />)

    expect(screen.getByText('No active network interfaces')).toBeTruthy()
  })
})
