export const MAX_CHART_POINTS = 300

export const PERCENT_OPTIONS = {
  scaleBy100: false,
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
} as const

export const PERCENT_INT_OPTIONS = {
  scaleBy100: false,
  maximumFractionDigits: 0,
} as const

export const TEMPERATURE_OPTIONS = {
  zeroFormat: 'N/A',
  nullFormat: 'N/A',
  maximumFractionDigits: 0,
} as const

export const BYTES_OPTIONS = { binary: false } as const

export const CHART_WINDOW_OPTIONS = [
  { label: '30s', secs: 30 },
  { label: '1m', secs: 60 },
  { label: '5m', secs: 300 },
  { label: '15m', secs: 900 },
]

export const GAUGE_ZONES = [
  { from: 0, to: 50, color: '#22c55e' },
  { from: 50, to: 80, color: '#f59e0b' },
  { from: 80, to: 100, color: '#ef4444' },
]

/**
 * Format CPU speed in GHz (e.g., 3.20 GHz).
 *
 * @param ghz - The CPU speed in GHz
 * @returns The formatted CPU speed
 *
 * @example
 * ```ts
 * formatSpeed(3.20)
 * // => '3.20 GHz'
 * ```
 */
export function formatSpeed(ghz: number): string {
  return `${ghz.toFixed(2)} GHz`
}

/**
 * Get the color for a gauge based on the value.
 *
 * @param value - The value to get the color for
 * @returns The color
 *
 * @example
 * ```ts
 * getGaugeColor(92)
 * // => '#ef4444'
 * ```
 */
export function getGaugeColor(value: number): string {
  if (value >= 80) {
    return '#ef4444'
  }

  if (value >= 50) {
    return '#f59e0b'
  }

  return '#22c55e'
}

/**
 * Get a color class based on usage percentage thresholds.
 *
 * @param percentage - The usage percentage
 * @returns The color class
 *
 * @example
 * ```ts
 * getUsageColor(92)
 * // => 'text-error'
 * ```
 */
export function getUsageColor(percentage: number): string {
  if (percentage >= 90) {
    return 'text-error'
  }

  if (percentage >= 70) {
    return 'text-warning'
  }

  return 'text-success'
}
