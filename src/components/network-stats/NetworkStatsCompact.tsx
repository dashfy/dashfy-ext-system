import {
  useApiSubscription,
  Widget,
  WidgetBody,
  WidgetEmpty,
  WidgetError,
  WidgetHeader,
  WidgetLoader,
} from '@getdashfy/ui'
import { formatBytesPerSecond } from '@getdashfy/utils'
import { NetworkIcon } from 'lucide-react'

import type { NetworkStatsResponse } from '@/types'
import { BYTES_OPTIONS } from '@/utils'

const BYTES_OPTIONS_1 = { ...BYTES_OPTIONS, maximumFractionDigits: 1 } as const
const BYTES_OPTIONS_0 = { ...BYTES_OPTIONS, maximumFractionDigits: 0 } as const

export interface NetworkStatsCompactProps {
  /**
   * API subscription ID
   * @default 'system'
   */
  api?: string
  /**
   * API endpoint to call
   * @default 'networkStats'
   */
  endpoint?: string
  /**
   * Custom widget title
   * @default 'System'
   */
  title?: string
  /**
   * Custom widget subject
   * @default 'Network Traffic'
   */
  subject?: string
  /**
   * Network interface to monitor (e.g., 'en0', 'eth0')
   * If not specified, uses the first active interface
   */
  interface?: string
}

/**
 * Displays combined network traffic (RX + TX) in a compact view.
 *
 * @example
 * ```yaml
 * - extension: system
 *   widget: NetworkStatsCompact
 * ```
 */
export const NetworkStatsCompact = ({
  api = 'system',
  endpoint = 'networkStats',
  title = 'System',
  subject = 'Network Traffic',
  interface: ifaceName,
}: NetworkStatsCompactProps) => {
  const { data, error, loading } = useApiSubscription({
    api,
    endpoint,
    params: {},
  })

  if (loading && !data) {
    return (
      <Widget>
        <WidgetHeader icon={<NetworkIcon />} subject={subject} title={title} />
        <WidgetBody>
          <WidgetLoader />
        </WidgetBody>
      </Widget>
    )
  }

  if (error) {
    return (
      <Widget>
        <WidgetHeader icon={<NetworkIcon />} subject={subject} title={title} />
        <WidgetBody>
          <WidgetError error={error} />
        </WidgetBody>
      </Widget>
    )
  }

  const networkData = data as NetworkStatsResponse
  const activeStats = networkData.stats.filter((stat) => stat.operstate === 'up')
  const targetStat = ifaceName
    ? activeStats.find((stat) => stat.iface === ifaceName)
    : activeStats[0]

  if (!targetStat) {
    return (
      <Widget>
        <WidgetHeader icon={<NetworkIcon />} subject={subject} title={title} />
        <WidgetBody>
          <WidgetEmpty message="No active network interface found" />
        </WidgetBody>
      </Widget>
    )
  }

  const rxSpeed = targetStat.rx_sec ?? 0
  const txSpeed = targetStat.tx_sec ?? 0
  const totalSpeed = rxSpeed + txSpeed

  return (
    <Widget>
      <WidgetHeader
        icon={<NetworkIcon />}
        subject={`${subject} (${targetStat.iface})`}
        title={title}
      />
      <WidgetBody>
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 py-6">
          <div className="text-foreground text-2xl font-bold tabular-nums">
            {formatBytesPerSecond(totalSpeed, BYTES_OPTIONS_1)}
          </div>
          <div className="text-muted-foreground text-xs">
            <span className="tabular-nums">↓ {formatBytesPerSecond(rxSpeed, BYTES_OPTIONS_0)}</span>{' '}
            ·{' '}
            <span className="tabular-nums">↑ {formatBytesPerSecond(txSpeed, BYTES_OPTIONS_0)}</span>
          </div>
        </div>
      </WidgetBody>
    </Widget>
  )
}
