import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Processes } from './Processes'

vi.mock('@getdashfy/ui', async () => {
  const actual = await vi.importActual('@getdashfy/ui')
  return {
    ...actual,
    useApiSubscription: vi.fn(),
  }
})

const { useApiSubscription } = await import('@getdashfy/ui')
import { processesResponse } from '@/test-fixtures'

describe('Processes', () => {
  it('should pass limit and sortBy to subscription', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: processesResponse,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Processes limit={5} sortBy="mem" />)

    expect(useApiSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        params: { limit: 5, sortBy: 'mem' },
      }),
    )
  })

  it('should render process rows', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: processesResponse,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Processes />)

    expect(screen.getByText('node')).toBeTruthy()
    expect(screen.getByText('kernel')).toBeTruthy()
  })

  it('should show empty message when no processes', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: {
        processes: {
          ...processesResponse.processes,
          list: [],
        },
      },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Processes />)

    expect(screen.getByText('No processes found')).toBeTruthy()
  })
})
