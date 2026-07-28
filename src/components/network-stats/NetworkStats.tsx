import {
  generateReactKey,
  useApiSubscription,
  Widget,
  WidgetBody,
  WidgetEmpty,
  WidgetError,
  WidgetErrorBoundary,
  WidgetHeader,
  WidgetLoader,
  WidgetStatusChip,
} from '@getdashfy/ui'
import { formatBytes, formatBytesPerSecond } from '@getdashfy/utils'
import { NetworkIcon } from 'lucide-react'

import type { NetworkStatsResponse } from '@/types'
import { BYTES_OPTIONS } from '@/utils'

export interface NetworkStatsProps {
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
   * @default 'Network'
   */
  subject?: string
}

/**
 * Displays network interface stats including bytes transferred and current speed.
 *
 * @example
 * ```yaml
 * - extension: system
 *   widget: NetworkStats
 * ```
 */
export const NetworkStats = ({
  api = 'system',
  endpoint = 'networkStats',
  title = 'System',
  subject = 'Network',
}: NetworkStatsProps) => {
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
  const { stats } = networkData

  const activeStats = stats.filter((stat) => stat.operstate === 'up')

  return (
    <Widget>
      <WidgetHeader
        count={activeStats.length}
        icon={<NetworkIcon />}
        subject={subject}
        title={title}
      />
      <WidgetBody disablePadding scrollable>
        <WidgetErrorBoundary resetKeys={[stats.length]}>
          {activeStats.length === 0 ? (
            <WidgetEmpty message="No active network interfaces" />
          ) : (
            <div className="divide-border/50 divide-y">
              {activeStats.map((stat, index) => (
                <div
                  key={generateReactKey('net', stat.iface, index)}
                  className="space-y-2 px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{stat.iface}</span>
                      <WidgetStatusChip label={stat.operstate} status="success" />
                    </div>
                  </div>
                  <div
                    className="text-muted-foreground grid grid-cols-2 text-xs"
                    style={{ columnGap: '1rem', rowGap: '0.25rem' }}
                  >
                    <div className="flex justify-between">
                      <span>↓ Received</span>
                      <span className="font-mono">{formatBytes(stat.rx_bytes, BYTES_OPTIONS)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>↑ Sent</span>
                      <span className="font-mono">{formatBytes(stat.tx_bytes, BYTES_OPTIONS)}</span>
                    </div>
                    {stat.rx_sec !== null && (
                      <div className="flex justify-between">
                        <span>↓ Speed</span>
                        <span className="font-mono">
                          {formatBytesPerSecond(stat.rx_sec, BYTES_OPTIONS)}
                        </span>
                      </div>
                    )}
                    {stat.tx_sec !== null && (
                      <div className="flex justify-between">
                        <span>↑ Speed</span>
                        <span className="font-mono">
                          {formatBytesPerSecond(stat.tx_sec, BYTES_OPTIONS)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </WidgetErrorBoundary>
      </WidgetBody>
    </Widget>
  )
}
