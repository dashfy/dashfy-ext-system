import { describe, expect, it } from 'vitest'

import { formatSpeed, GAUGE_ZONES, getGaugeColor, getUsageColor } from './utils'

describe('formatSpeed', () => {
  it('should format GHz with two decimal places', () => {
    expect(formatSpeed(3.2)).toBe('3.20 GHz')
  })

  it('should preserve trailing zeros', () => {
    expect(formatSpeed(2)).toBe('2.00 GHz')
  })
})

describe('getGaugeColor', () => {
  it('should return green below 50', () => {
    expect(getGaugeColor(0)).toBe('#22c55e')
    expect(getGaugeColor(49.9)).toBe('#22c55e')
  })

  it('should return amber from 50 up to 80', () => {
    expect(getGaugeColor(50)).toBe('#f59e0b')
    expect(getGaugeColor(79.9)).toBe('#f59e0b')
  })

  it('should return red at 80 and above', () => {
    expect(getGaugeColor(80)).toBe('#ef4444')
    expect(getGaugeColor(100)).toBe('#ef4444')
  })
})

describe('getUsageColor', () => {
  it('should return success below 70', () => {
    expect(getUsageColor(0)).toBe('text-success')
    expect(getUsageColor(69.9)).toBe('text-success')
  })

  it('should return warning from 70 up to 90', () => {
    expect(getUsageColor(70)).toBe('text-warning')
    expect(getUsageColor(89.9)).toBe('text-warning')
  })

  it('should return error at 90 and above', () => {
    expect(getUsageColor(90)).toBe('text-error')
    expect(getUsageColor(100)).toBe('text-error')
  })
})

describe('GAUGE_ZONES', () => {
  it('should define three contiguous zones', () => {
    expect(GAUGE_ZONES).toHaveLength(3)
    expect(GAUGE_ZONES[0]).toMatchObject({ from: 0, to: 50 })
    expect(GAUGE_ZONES[1]).toMatchObject({ from: 50, to: 80 })
    expect(GAUGE_ZONES[2]).toMatchObject({ from: 80, to: 100 })
  })
})
