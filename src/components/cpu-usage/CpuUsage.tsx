import {
  generateReactKey,
  Progress,
  useApiSubscription,
  Widget,
  WidgetBody,
  WidgetError,
  WidgetErrorBoundary,
  WidgetHeader,
  WidgetLoader,
} from '@dashfy/ui'
import { formatPercent, formatTemperature } from '@dashfy/utils'
import { CpuIcon } from 'lucide-react'

import type { CpuUsageResponse } from '@/types'
import { getUsageColor, PERCENT_INT_OPTIONS, PERCENT_OPTIONS, TEMPERATURE_OPTIONS } from '@/utils'

export interface CpuUsageProps {
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
   * Whether to show per-core usage
   * @default false
   */
  showCores?: boolean
  /**
   * Whether to show temperature
   * @default true
   */
  showTemperature?: boolean
}

/**
 * Displays current CPU usage with an overall load bar and optional per-core breakdown.
 *
 * @example
 * ```json
 * {
 *   "extension": "system",
 *   "widget": "CpuUsage"
 * }
 *
 * @example
 * ```yaml
 * extension: system
 * widget: CpuUsage
 * ```
 *
 * @example
 * ```tsx
 * <CpuUsage />
 * ```
 */
export const CpuUsage = ({
  api = 'system',
  endpoint = 'cpuUsage',
  title = 'System',
  subject = 'CPU Usage',
  showCores = false,
  showTemperature = true,
}: CpuUsageProps) => {
  const { data, error, loading } = useApiSubscription({
    api,
    endpoint,
    params: {},
  })

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
  const { load, temperature } = cpuData

  return (
    <Widget>
      <WidgetHeader icon={<CpuIcon />} subject={subject} title={title} />
      <WidgetBody scrollable>
        <WidgetErrorBoundary resetKeys={[load.cpus.length]}>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Overall</span>
                <span className={`text-sm font-bold ${getUsageColor(load.currentLoad)}`}>
                  {formatPercent(load.currentLoad, PERCENT_OPTIONS)}
                </span>
              </div>
              <Progress value={load.currentLoad} />
            </div>

            <div
              className="text-muted-foreground grid grid-cols-2 text-xs"
              style={{ columnGap: '1rem', rowGap: '0.25rem' }}
            >
              <div className="flex justify-between">
                <span>User</span>
                <span className="font-mono">
                  {formatPercent(load.currentLoadUser, PERCENT_OPTIONS)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>System</span>
                <span className="font-mono">
                  {formatPercent(load.currentLoadSystem, PERCENT_OPTIONS)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Idle</span>
                <span className="font-mono">
                  {formatPercent(load.currentLoadIdle, PERCENT_OPTIONS)}
                </span>
              </div>
              {showTemperature && temperature.main !== null && (
                <div className="flex justify-between">
                  <span>Temp</span>
                  <span className="font-mono">
                    {formatTemperature(temperature.main, TEMPERATURE_OPTIONS)}
                  </span>
                </div>
              )}
            </div>

            {showCores && load.cpus.length > 0 && (
              <div className="pt-2">
                <span className="text-muted-foreground text-xs font-medium">Per Core</span>
                <div className="space-y-1.5">
                  {load.cpus.map((core, index) => (
                    <div
                      key={generateReactKey('cpu-core', index)}
                      className="flex items-center gap-2"
                    >
                      <span className="text-muted-foreground w-6 text-right font-mono text-xs">
                        {index}
                      </span>
                      <Progress className="h-1.5 flex-1" value={core.load} />
                      <span className="w-12 text-right font-mono text-xs">
                        {formatPercent(core.load, PERCENT_INT_OPTIONS)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </WidgetErrorBoundary>
      </WidgetBody>
    </Widget>
  )
}
