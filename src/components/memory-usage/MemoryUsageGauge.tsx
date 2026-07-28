import {
  useApiSubscription,
  useMode,
  Widget,
  WidgetBody,
  WidgetError,
  WidgetErrorBoundary,
  WidgetHeader,
  WidgetLoader,
} from '@getdashfy/ui'
import { Gauge } from 'livegauge'
import { MemoryStickIcon } from 'lucide-react'

import type { MemoryUsageResponse } from '@/types'
import { GAUGE_ZONES, getGaugeColor } from '@/utils'

export interface MemoryUsageGaugeProps {
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
   * Whether to show tick labels
   * @default false
   */
  tickLabels?: boolean
}

/**
 * Displays memory usage as a radial gauge chart.
 *
 * @example
 * ```yaml
 * - extension: system
 *   widget: MemoryUsageGauge
 * ```
 */
export const MemoryUsageGauge = ({
  api = 'system',
  endpoint = 'memoryUsage',
  title = 'System',
  subject = 'Memory Usage',
  tickLabels = false,
}: MemoryUsageGaugeProps) => {
  const { data, error, loading } = useApiSubscription({
    api,
    endpoint,
    params: {},
  })

  const { mode } = useMode()

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
  const memoryPercentage = Math.round((memoryData.memory.active / memoryData.memory.total) * 100)

  return (
    <Widget>
      <WidgetHeader icon={<MemoryStickIcon />} subject={subject} title={title} />
      <WidgetBody>
        <WidgetErrorBoundary resetKeys={[memoryPercentage]}>
          <div className="flex h-full min-h-0 w-full shrink-0 items-center justify-center text-xs">
            <div className="aspect-video max-h-full w-auto max-w-full min-w-0 shrink-0">
              <Gauge
                color={getGaugeColor(memoryPercentage)}
                formatValue={(value) => `${value.toFixed(0)}%`}
                label="Memory"
                loading={loading}
                max={100}
                min={0}
                momentum={false}
                theme={mode}
                tickLabels={tickLabels}
                value={memoryPercentage}
                zones={GAUGE_ZONES}
                tooltip
              />
            </div>
          </div>
        </WidgetErrorBoundary>
      </WidgetBody>
    </Widget>
  )
}
