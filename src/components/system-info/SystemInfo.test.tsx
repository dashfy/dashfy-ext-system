import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { systemInfoResponse, systemInfoWithHardware } from '@/test-fixtures'

import { SystemInfo } from './SystemInfo'

vi.mock('@dashfy/ui', async () => {
  const actual = await vi.importActual('@dashfy/ui')
  return {
    ...actual,
    useApiSubscription: vi.fn(),
  }
})

vi.mock('@dashfy/utils', async (importOriginal) => {
  const actual = await importOriginal()
  return Object.assign({}, actual, {
    format: vi.fn((value: unknown, kind?: string) => (kind === 'uptime' ? '1h 0m' : String(value))),
  })
})

const { useApiSubscription } = await import('@dashfy/ui')

describe('SystemInfo', () => {
  it('should render loading state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: null,
      loading: true,
      lastUpdate: undefined,
    })

    render(<SystemInfo />)

    expect(screen.getByText('System')).toBeTruthy()
    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('should render error state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: 'Collection failed',
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<SystemInfo />)

    expect(screen.getByText(/Collection failed/i)).toBeTruthy()
  })

  it('should render hostname and hide O.E.M. hardware row', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: systemInfoResponse,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<SystemInfo />)

    expect(screen.getByText('my-host')).toBeTruthy()
    expect(screen.getByText(/macOS 14\.0/)).toBeTruthy()
    expect(screen.queryByText('Hardware')).toBeNull()
  })

  it('should show hardware when manufacturer is real', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: systemInfoWithHardware,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<SystemInfo />)

    expect(screen.getByText('Hardware')).toBeTruthy()
    expect(screen.getByText(/Dell XPS/)).toBeTruthy()
  })
})
