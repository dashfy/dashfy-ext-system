import type { ChartConfig } from '@dashfy/ui'
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
} from '@dashfy/ui'
import { formatPercent } from '@dashfy/utils'
import type { LivelinePoint } from 'liveline'
import { Liveline } from 'liveline'
import { CpuIcon } from 'lucide-react'
import * as React from 'react'

import type { CpuUsageResponse } from '@/types'
import { CHART_WINDOW_OPTIONS, MAX_CHART_POINTS, PERCENT_OPTIONS } from '@/utils'

export interface CpuUsageLineProps {
  /**
   * API subscription ID
   * @default 'system'
   */
  api?: string
  /**
   * API endpoint to call
   * @default 'cpuUsage'
   */
  endpoint?: string
  /**
   * Custom widget title
   * @default 'System'
   */
  title?: string
  /**
   * Custom widget subject
   * @default 'CPU Usage'
   */
  subject?: string
  /**
   * Whether to show time window buttons
   * @default true
   */
  showWindows?: boolean
}

/**
 * Displays CPU usage as a real-time animated line chart.
 *
 * @example
 * ```json
 * {
 *   "extension": "system",
 *   "widget": "CpuUsageLine"
 * }
 * ```
 *
 * @example
 * ```yaml
 * extension: system
 * widget: CpuUsageLine
 * ```
 *
 * @example
 * ```tsx
 * <CpuUsageLine />
 * ```
 */
export const CpuUsageLine = ({
  api = 'system',
  endpoint = 'cpuUsage',
  title = 'System',
  subject = 'CPU Usage',
  showWindows = true,
}: CpuUsageLineProps) => {
  const { data, error, loading } = useApiSubscription({
    api,
    endpoint,
    params: {},
  })

  const { mode } = useMode()
  const [chartDataPoints, setChartDataPoints] = React.useState<LivelinePoint[]>([])
  const [currentValue, setCurrentValue] = React.useState(0)

  React.useEffect(() => {
    if (data) {
      const cpuData = data as CpuUsageResponse
      const timestamp = Math.floor(Date.now() / 1000)
      const value = cpuData.load.currentLoad

      setCurrentValue(value)
      setChartDataPoints((prev) => {
        const newPoints = [...prev, { time: timestamp, value }]
        return newPoints.slice(-MAX_CHART_POINTS)
      })
    }
  }, [data])

  if (loading && !data) {
    return (
      <Widget>
        <WidgetHeader icon={<CpuIcon />} subject={subject} title={title} />
        <WidgetBody>
          <WidgetLoader />
        </WidgetBody>
      </Widget>
    )
  }

  if (error) {
    return (
      <Widget>
        <WidgetHeader icon={<CpuIcon />} subject={subject} title={title} />
        <WidgetBody>
          <WidgetError error={error} />
        </WidgetBody>
      </Widget>
    )
  }

  return (
    <Widget>
      <WidgetHeader icon={<CpuIcon />} subject={subject} title={title} />
      <WidgetBody scrollable>
        <WidgetErrorBoundary resetKeys={[currentValue]}>
          <ChartContainer
            className="h-full w-full shrink-0"
            config={{} satisfies ChartConfig}
            style={{ height: showWindows ? 'calc(100% - 60px)' : 'calc(100% - 32px)' }}
          >
            <Liveline
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
