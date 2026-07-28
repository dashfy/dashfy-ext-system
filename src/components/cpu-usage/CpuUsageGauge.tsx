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
import { CpuIcon } from 'lucide-react'

import type { CpuUsageResponse } from '@/types'
import { GAUGE_ZONES, getGaugeColor } from '@/utils'

export interface CpuUsageGaugeProps {
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
   * Whether to show tick labels
   * @default false
   */
  tickLabels?: boolean
}

/**
 * Displays CPU usage as a radial gauge chart.
 *
 * @example
 * ```yaml
 * - extension: system
 *   widget: CpuUsageGauge
 * ```
 */
export const CpuUsageGauge = ({
  api = 'system',
  endpoint = 'cpuUsage',
  title = 'System',
  subject = 'CPU Usage',
  tickLabels = false,
}: CpuUsageGaugeProps) => {
  const { data, error, loading } = useApiSubscription({
    api,
    endpoint,
    params: {},
  })

  const { mode } = useMode()

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

  const cpuData = data as CpuUsageResponse
  const cpuPercentage = Math.round(cpuData.load.currentLoad)

  return (
    <Widget>
      <WidgetHeader icon={<CpuIcon />} subject={subject} title={title} />
      <WidgetBody>
        <WidgetErrorBoundary resetKeys={[cpuPercentage]}>
          <div className="flex h-full min-h-0 w-full shrink-0 items-center justify-center text-xs">
            <div className="aspect-video max-h-full w-auto max-w-full min-w-0 shrink-0">
              <Gauge
                color={getGaugeColor(cpuPercentage)}
                formatValue={(value) => `${value.toFixed(0)}%`}
                label="CPU"
                loading={loading}
                max={100}
                min={0}
                momentum={false}
                theme={mode}
                tickLabels={tickLabels}
                value={cpuPercentage}
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
