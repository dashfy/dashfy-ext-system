import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { NetworkStatsLine } from './NetworkStatsLine'

vi.mock('@dashfy/ui', async () => {
  const actual = await vi.importActual('@dashfy/ui')
  return {
    ...actual,
    useApiSubscription: vi.fn(),
  }
})

const { useApiSubscription } = await import('@dashfy/ui')
import { networkStatsResponse } from '@/test-fixtures'

describe('NetworkStatsLine', () => {
  it('should render loading state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: null,
      loading: true,
      lastUpdate: undefined,
    })

    render(<NetworkStatsLine />)

    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('should render liveline when data is available', async () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: networkStatsResponse,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<NetworkStatsLine />)

    await waitFor(() => {
      expect(screen.getByTestId('liveline-mock')).toBeTruthy()
    })
  })
})
