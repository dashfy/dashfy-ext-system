import {
  useApiSubscription,
  Widget,
  WidgetBody,
  WidgetError,
  WidgetErrorBoundary,
  WidgetHeader,
  WidgetListItem,
  WidgetLoader,
} from '@dashfy/ui'
import { format } from '@dashfy/utils'
import { ServerIcon } from 'lucide-react'

import type { SystemInfoResponse } from '@/types'
import { formatSpeed } from '@/utils'

export interface SystemInfoProps {
  /**
   * API subscription ID
   * @default 'system'
   */
  api?: string
  /**
   * API endpoint to call
   * @default 'systemInfo'
   */
  endpoint?: string
  /**
   * Custom widget title
   * @default 'System'
   */
  title?: string
  /**
   * Custom widget subject
   * @default 'Info'
   */
  subject?: string
}

/**
 * Displays static system information: hostname, OS, CPU model, uptime, etc.
 *
 * @example
 * ```json
 * {
 *   "extension": "system",
 *   "widget": "SystemInfo"
 * }
 * ```
 *
 * @example
 * ```yaml
 * extension: system
 * widget: SystemInfo
 * ```
 *
 * @example
 * ```tsx
 * <SystemInfo />
 * ```
 */
export const SystemInfo = ({
  api = 'system',
  endpoint = 'systemInfo',
  title = 'System',
  subject = 'Info',
}: SystemInfoProps) => {
  const { data, error, loading } = useApiSubscription({
    api,
    endpoint,
    params: {},
  })

  if (loading && !data) {
    return (
      <Widget>
        <WidgetHeader icon={<ServerIcon />} subject={subject} title={title} />
        <WidgetBody>
          <WidgetLoader />
        </WidgetBody>
      </Widget>
    )
  }

  if (error) {
    return (
      <Widget>
        <WidgetHeader icon={<ServerIcon />} subject={subject} title={title} />
        <WidgetBody>
          <WidgetError error={error} />
        </WidgetBody>
      </Widget>
    )
  }

  const sysData = data as SystemInfoResponse
  const { cpu, os, system, time } = sysData

  return (
    <Widget>
      <WidgetHeader icon={<ServerIcon />} subject={subject} title={title} />
      <WidgetBody disablePadding scrollable>
        <WidgetErrorBoundary resetKeys={[os.hostname, time.uptime]}>
          <div className="space-y-0">
            <WidgetListItem title="Hostname" value={os.hostname} />
            <WidgetListItem title="OS" value={`${os.distro} ${os.release}`} />
            <WidgetListItem title="Kernel" value={os.kernel} />
            <WidgetListItem title="Architecture" value={os.arch} />
            <WidgetListItem title="Platform" value={os.platform} />
            <WidgetListItem title="CPU" value={`${cpu.manufacturer} ${cpu.brand}`} />
            <WidgetListItem title="CPU Speed" value={formatSpeed(cpu.speed)} />
            <WidgetListItem
              title="Cores"
              value={`${cpu.physicalCores} physical / ${cpu.cores} logical`}
            />
            {system.manufacturer && system.manufacturer !== 'To Be Filled By O.E.M.' && (
              <WidgetListItem title="Hardware" value={`${system.manufacturer} ${system.model}`} />
            )}
            <WidgetListItem title="Uptime" value={format(time.uptime, 'uptime')} />
            <WidgetListItem title="Timezone" value={time.timezoneName} />
          </div>
        </WidgetErrorBoundary>
      </WidgetBody>
    </Widget>
  )
}
