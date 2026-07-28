import '@testing-library/jest-dom/vitest'

import * as React from 'react'
import { afterEach, beforeEach, vi } from 'vitest'

/** Recharts logs this when ResponsiveContainer measures 0×0 in jsdom (line chart tests). */
const RECHARTS_ZERO_SIZE_WARNING = /width\(0\) and height\(0\) of chart/i

function shouldSilenceChartSizeMessage(firstArg: unknown): boolean {
  return typeof firstArg === 'string' && RECHARTS_ZERO_SIZE_WARNING.test(firstArg)
}

const consoleWarn = console.warn.bind(console)
const consoleError = console.error.bind(console)

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation((first, ...rest) => {
    if (shouldSilenceChartSizeMessage(first)) {
      return
    }
    consoleWarn(first as never, ...(rest as never[]))
  })

  vi.spyOn(console, 'error').mockImplementation((first, ...rest) => {
    if (shouldSilenceChartSizeMessage(first)) {
      return
    }
    consoleError(first as never, ...(rest as never[]))
  })
})

afterEach(() => {
  vi.mocked(console.warn).mockRestore()
  vi.mocked(console.error).mockRestore()
})

vi.mock('livegauge', () => ({
  Gauge: (props: { label?: string }) =>
    React.createElement('div', { 'data-testid': 'gauge-mock' }, props.label ?? ''),
}))

vi.mock('liveline', () => ({
  Liveline: () => React.createElement('div', { 'data-testid': 'liveline-mock' }),
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => {
      const keys = Object.keys(store)
      return keys[index] ?? null
    },
  }
})()

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
class ResizeObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverMock,
})
