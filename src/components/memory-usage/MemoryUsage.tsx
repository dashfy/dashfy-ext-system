import {
  Progress,
  useApiSubscription,
  Widget,
  WidgetBody,
  WidgetError,
  WidgetErrorBoundary,
  WidgetHeader,
  WidgetLoader,
} from '@dashfy/ui'
import { formatBytes, formatPercent } from '@dashfy/utils'
import { MemoryStickIcon } from 'lucide-react'

import type { MemoryUsageResponse } from '@/types'
import { BYTES_OPTIONS, getUsageColor, PERCENT_OPTIONS } from '@/utils'

export interface MemoryUsageProps {
  /**
   * API subscription ID
   * @default 'system'
   */
  api?: string
  /**
   * API endpoint to call
   * @default 'memoryUsage'
   */
  endpoint?: string
  /**
   * Custom widget title
   * @default 'System'
   */
  title?: string
  /**
   * Custom widget subject
   * @default 'Memory Usage'
   */
  subject?: string
  /**
   * Whether to show swap memory info
   * @default true
   */
  showSwap?: boolean
}

/**
 * Displays current memory (RAM) usage with a progress bar and detailed breakdown.
 *
 * @example
 * ```json
 * {
 *   "extension": "system",
 *   "widget": "MemoryUsage"
 * }
 * ```
 *
 * @example
 * ```yaml
 * extension: system
 * widget: MemoryUsage
 * ```
 *
 * @example
 * ```tsx
 * <MemoryUsage />
 * ```
 */
export const MemoryUsage = ({
  api = 'system',
  endpoint = 'memoryUsage',
  title = 'System',
  subject = 'Memory Usage',
  showSwap = true,
}: MemoryUsageProps) => {
  const { data, error, loading } = useApiSubscription({
    api,
    endpoint,
    params: {},
  })

  if (loading && !data) {
    return (
      <Widget>
        <WidgetHeader icon={<MemoryStickIcon />} subject={subject} title={title} />
        <WidgetBody>
          <WidgetLoader />
        </WidgetBody>
      </Widget>
    )
  }

  if (error) {
    return (
      <Widget>
        <WidgetHeader icon={<MemoryStickIcon />} subject={subject} title={title} />
        <WidgetBody>
          <WidgetError error={error} />
        </WidgetBody>
      </Widget>
    )
  }

  const memoryData = data as MemoryUsageResponse
  const { memory } = memoryData
  const usedPercentage = (memory.active / memory.total) * 100
  const swapPercentage = memory.swaptotal > 0 ? (memory.swapused / memory.swaptotal) * 100 : 0

  return (
    <Widget>
      <WidgetHeader icon={<MemoryStickIcon />} subject={subject} title={title} />
      <WidgetBody>
        <WidgetErrorBoundary resetKeys={[memory.active, memory.total]}>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">RAM</span>
                <span className={`text-sm font-bold ${getUsageColor(usedPercentage)}`}>
                  {formatBytes(memory.active, BYTES_OPTIONS)} /{' '}
                  {formatBytes(memory.total, BYTES_OPTIONS)}
                </span>
              </div>
              <Progress value={usedPercentage} />
              <div className="text-muted-foreground text-right text-xs">
                {formatPercent(usedPercentage, PERCENT_OPTIONS)} used
              </div>
            </div>

            <div
              className="text-muted-foreground grid grid-cols-2 text-xs"
              style={{ columnGap: '1rem', rowGap: '0.25rem' }}
            >
              <div className="flex justify-between">
                <span>Active</span>
                <span className="font-mono">{formatBytes(memory.active, BYTES_OPTIONS)}</span>
              </div>
              <div className="flex justify-between">
                <span>Available</span>
                <span className="font-mono">{formatBytes(memory.available, BYTES_OPTIONS)}</span>
              </div>
              <div className="flex justify-between">
                <span>Buffers/Cache</span>
                <span className="font-mono">{formatBytes(memory.buffcache, BYTES_OPTIONS)}</span>
              </div>
              <div className="flex justify-between">
                <span>Free</span>
                <span className="font-mono">{formatBytes(memory.free, BYTES_OPTIONS)}</span>
              </div>
            </div>

            {showSwap && memory.swaptotal > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Swap</span>
                  <span className={`text-xs font-bold ${getUsageColor(swapPercentage)}`}>
                    {formatBytes(memory.swapused, BYTES_OPTIONS)} /{' '}
                    {formatBytes(memory.swaptotal, BYTES_OPTIONS)}
                  </span>
                </div>
                <Progress className="h-1.5" value={swapPercentage} />
              </div>
            )}
          </div>
        </WidgetErrorBoundary>
      </WidgetBody>
    </Widget>
  )
}
