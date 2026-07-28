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
} from '@getdashfy/ui'
import { formatBytes, formatPercent } from '@getdashfy/utils'
import { HardDriveIcon } from 'lucide-react'

import type { DiskUsageResponse } from '@/types'
import { BYTES_OPTIONS, getUsageColor, PERCENT_OPTIONS } from '@/utils'

export interface DiskUsageProps {
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
}

/**
 * Displays filesystem/disk usage with progress bars per mount point.
 *
 * @example
 * ```yaml
 * - extension: system
 *   widget: DiskUsage
 * ```
 */
export const DiskUsage = ({
  api = 'system',
  endpoint = 'diskUsage',
  title = 'System',
  subject = 'Disk Usage',
}: DiskUsageProps) => {
  const { data, error, loading } = useApiSubscription({
    api,
    endpoint,
    params: {},
  })

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
  const { disks } = diskData

  return (
    <Widget>
      <WidgetHeader count={disks.length} icon={<HardDriveIcon />} subject={subject} title={title} />
      <WidgetBody disablePadding scrollable>
        <WidgetErrorBoundary resetKeys={[disks.length]}>
          <div className="divide-border/50 divide-y">
            {disks.map((disk, index) => (
              <div
                key={generateReactKey('disk', disk.mount, index)}
                className="space-y-2 px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{disk.mount}</div>
                    <div className="text-muted-foreground truncate text-xs">
                      {disk.fs} ({disk.type})
                    </div>
                  </div>
                  <span className={`ml-2 shrink-0 text-sm font-bold ${getUsageColor(disk.use)}`}>
                    {formatPercent(disk.use, PERCENT_OPTIONS)}
                  </span>
                </div>
                <Progress value={disk.use} />
                <div className="text-muted-foreground flex justify-between text-xs">
                  <span>{formatBytes(disk.used, BYTES_OPTIONS)} used</span>
                  <span>{formatBytes(disk.available, BYTES_OPTIONS)} free</span>
                  <span>{formatBytes(disk.size, BYTES_OPTIONS)} total</span>
                </div>
              </div>
            ))}
          </div>
        </WidgetErrorBoundary>
      </WidgetBody>
    </Widget>
  )
}
