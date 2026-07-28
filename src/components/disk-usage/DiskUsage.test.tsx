import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { DiskUsage } from './DiskUsage'

vi.mock('@getdashfy/ui', async () => {
  const actual = await vi.importActual('@getdashfy/ui')
  return {
    ...actual,
    useApiSubscription: vi.fn(),
  }
})

const { useApiSubscription } = await import('@getdashfy/ui')
import { diskUsageResponse } from '@/test-fixtures'

describe('DiskUsage', () => {
  it('should render loading state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: null,
      loading: true,
      lastUpdate: undefined,
    })

    render(<DiskUsage />)

    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('should list mount points', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: diskUsageResponse,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<DiskUsage />)

    expect(screen.getByText('/')).toBeTruthy()
    expect(screen.getByText('/home')).toBeTruthy()
  })
})
