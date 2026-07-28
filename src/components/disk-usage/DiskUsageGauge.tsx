import {
  useApiSubscription,
  useMode,
  Widget,
  WidgetBody,
  WidgetEmpty,
  WidgetError,
  WidgetErrorBoundary,
  WidgetHeader,
  WidgetLoader,
} from '@getdashfy/ui'
import { Gauge } from 'livegauge'
import { HardDriveIcon } from 'lucide-react'

import type { DiskUsageResponse } from '@/types'
import { GAUGE_ZONES, getGaugeColor } from '@/utils'

export interface DiskUsageGaugeProps {
  /**
   * API subscription ID
   * @default 'system'
   */
  api?: string
  /**
   * API endpoint to call
   * @default 'diskUsage'
   */
  endpoint?: string
  /**
   * Custom widget title
   * @default 'System'
   */
  title?: string
  /**
   * Custom widget subject
   * @default 'Disk Usage'
   */
  subject?: string
  /**
   * Mount point to display (e.g., '/', '/home')
   * If not specified, shows the first mount point
   */
  mount?: string
  /**
   * Whether to show tick labels
   * @default false
   */
  tickLabels?: boolean
}

/**
 * Displays disk usage as a radial gauge chart.
 *
 * @example
 * ```yaml
 * - extension: system
 *   widget: DiskUsageGauge
 * ```
 */
export const DiskUsageGauge = ({
  api = 'system',
  endpoint = 'diskUsage',
  title = 'System',
  subject = 'Disk Usage',
  mount,
  tickLabels = false,
}: DiskUsageGaugeProps) => {
  const { data, error, loading } = useApiSubscription({
    api,
    endpoint,
    params: {},
  })

  const { mode } = useMode()

  if (loading && !data) {
    return (
      <Widget>
        <WidgetHeader icon={<HardDriveIcon />} subject={subject} title={title} />
        <WidgetBody>
          <WidgetLoader />
        </WidgetBody>
      </Widget>
    )
  }

  if (error) {
    return (
      <Widget>
        <WidgetHeader icon={<HardDriveIcon />} subject={subject} title={title} />
        <WidgetBody>
          <WidgetError error={error} />
        </WidgetBody>
      </Widget>
    )
  }

  const diskData = data as DiskUsageResponse
  const targetDisk = mount ? diskData.disks.find((disk) => disk.mount === mount) : diskData.disks[0]

  if (!targetDisk) {
    return (
      <Widget>
        <WidgetHeader icon={<HardDriveIcon />} subject={subject} title={title} />
        <WidgetBody>
          <WidgetEmpty message="No disk found" />
        </WidgetBody>
      </Widget>
    )
  }

  const diskPercentage = Math.round(targetDisk.use)

  return (
    <Widget>
      <WidgetHeader
        icon={<HardDriveIcon />}
        subject={`${subject} (${targetDisk.mount})`}
        title={title}
      />
      <WidgetBody>
        <WidgetErrorBoundary resetKeys={[diskPercentage, targetDisk.mount]}>
          <div className="flex h-full min-h-0 w-full shrink-0 items-center justify-center text-xs">
            <div className="aspect-video max-h-full w-auto max-w-full min-w-0 shrink-0">
              <Gauge
                color={getGaugeColor(diskPercentage)}
                formatValue={(value) => `${value.toFixed(0)}%`}
                label="Disk"
                loading={loading}
                max={100}
                min={0}
                momentum={false}
                theme={mode}
                tickLabels={tickLabels}
                value={diskPercentage}
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
