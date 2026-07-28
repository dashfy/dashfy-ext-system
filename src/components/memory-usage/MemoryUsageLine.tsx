import type { ChartConfig } from '@getdashfy/ui'
import {
  ChartContainer,
  useApiSubscription,
  useMode,
  Widget,
  WidgetBody,
  WidgetError,
  WidgetErrorBoundary,
  WidgetHeader,
  WidgetLoader,
} from '@getdashfy/ui'
import { formatBytes, formatPercent } from '@getdashfy/utils'
import type { LivelinePoint } from 'liveline'
import { Liveline } from 'liveline'
import { MemoryStickIcon } from 'lucide-react'
import * as React from 'react'

import type { MemoryUsageResponse } from '@/types'
import { BYTES_OPTIONS, CHART_WINDOW_OPTIONS, MAX_CHART_POINTS, PERCENT_OPTIONS } from '@/utils'

export interface MemoryUsageLineProps {
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
   * Whether to show time window buttons
   * @default true
   */
  showWindows?: boolean
}

/**
 * Displays memory usage as a real-time animated line chart.
 *
 * @example
 * ```yaml
 * - extension: system
 *   widget: MemoryUsageLine
 * ```
 */
export const MemoryUsageLine = ({
  api = 'system',
  endpoint = 'memoryUsage',
  title = 'System',
  subject = 'Memory Usage',
  showWindows = true,
}: MemoryUsageLineProps) => {
  const { data, error, loading } = useApiSubscription({
    api,
    endpoint,
    params: {},
  })

  const { mode } = useMode()
  const [chartDataPoints, setChartDataPoints] = React.useState<LivelinePoint[]>([])
  const [currentValue, setCurrentValue] = React.useState(0)
  const [totalMemory, setTotalMemory] = React.useState(0)

  React.useEffect(() => {
    if (data) {
      const memoryData = data as MemoryUsageResponse
      const timestamp = Math.floor(Date.now() / 1000)
      const usedPercentage = (memoryData.memory.active / memoryData.memory.total) * 100

      setCurrentValue(usedPercentage)
      setTotalMemory(memoryData.memory.total)
      setChartDataPoints((prev) => {
        const newPoints = [...prev, { time: timestamp, value: usedPercentage }]
        return newPoints.slice(-MAX_CHART_POINTS)
      })
    }
  }, [data])

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

  return (
    <Widget>
      <WidgetHeader
        icon={<MemoryStickIcon />}
        subject={`${subject} (${formatBytes(totalMemory, BYTES_OPTIONS)})`}
        title={title}
      />
      <WidgetBody scrollable>
        <WidgetErrorBoundary resetKeys={[currentValue]}>
          <ChartContainer
            className="h-full w-full shrink-0"
            config={{} satisfies ChartConfig}
            style={{ height: showWindows ? 'calc(100% - 60px)' : 'calc(100% - 32px)' }}
          >
            <Liveline
              color="#10b981"
              data={chartDataPoints}
              formatValue={(value) => formatPercent(value, PERCENT_OPTIONS)}
              loading={chartDataPoints.length === 0}
              theme={mode}
              value={currentValue}
              windows={showWindows ? CHART_WINDOW_OPTIONS : undefined}
              exaggerate
              showValue
            />
          </ChartContainer>
        </WidgetErrorBoundary>
      </WidgetBody>
    </Widget>
  )
}
