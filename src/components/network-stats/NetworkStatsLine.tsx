import type { ChartConfig } from '@getdashfy/ui'
import {
  ChartContainer,
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
import { formatBytesPerSecond } from '@getdashfy/utils'
import type { LivelineSeries } from 'liveline'
import { Liveline } from 'liveline'
import { NetworkIcon } from 'lucide-react'
import * as React from 'react'

import type { NetworkStatsResponse } from '@/types'
import { BYTES_OPTIONS, CHART_WINDOW_OPTIONS, MAX_CHART_POINTS } from '@/utils'

export interface NetworkStatsLineProps {
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
  /**
   * Whether to show time window buttons
   * @default true
   */
  showWindows?: boolean
}

/**
 * Displays network traffic (RX/TX) as a real-time multi-series animated line chart.
 *
 * @example
 * ```yaml
 * - extension: system
 *   widget: NetworkStatsLine
 * ```
 */
export const NetworkStatsLine = ({
  api = 'system',
  endpoint = 'networkStats',
  title = 'System',
  subject = 'Network Traffic',
  interface: ifaceName,
  showWindows = true,
}: NetworkStatsLineProps) => {
  const { data, error, loading } = useApiSubscription({
    api,
    endpoint,
    params: {},
  })

  const { mode } = useMode()
  const [rxDataPoints, setRxDataPoints] = React.useState<LivelineSeries['data']>([])
  const [txDataPoints, setTxDataPoints] = React.useState<LivelineSeries['data']>([])
  const [rxValue, setRxValue] = React.useState(0)
  const [txValue, setTxValue] = React.useState(0)
  const [activeInterface, setActiveInterface] = React.useState<string>('')

  React.useEffect(() => {
    if (data) {
      const networkData = data as NetworkStatsResponse
      const timestamp = Math.floor(Date.now() / 1000)

      const activeStats = networkData.stats.filter((stat) => stat.operstate === 'up')
      const targetStat = ifaceName
        ? activeStats.find((stat) => stat.iface === ifaceName)
        : activeStats[0]

      if (targetStat) {
        setActiveInterface(targetStat.iface)

        const rxSpeed = targetStat.rx_sec ?? 0
        const txSpeed = targetStat.tx_sec ?? 0

        setRxValue(rxSpeed)
        setTxValue(txSpeed)

        setRxDataPoints((prev) => {
          const newPoints = [...prev, { time: timestamp, value: rxSpeed }]
          return newPoints.slice(-MAX_CHART_POINTS)
        })

        setTxDataPoints((prev) => {
          const newPoints = [...prev, { time: timestamp, value: txSpeed }]
          return newPoints.slice(-MAX_CHART_POINTS)
        })
      }
    }
  }, [data, ifaceName])

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

  if (!activeInterface) {
    return (
      <Widget>
        <WidgetHeader icon={<NetworkIcon />} subject={subject} title={title} />
        <WidgetBody>
          <WidgetEmpty message="No active network interface found" />
        </WidgetBody>
      </Widget>
    )
  }

  const series: LivelineSeries[] = [
    {
      id: 'rx',
      data: rxDataPoints,
      value: rxValue,
      color: '#3b82f6',
      label: '↓ RX',
    },
    {
      id: 'tx',
      data: txDataPoints,
      value: txValue,
      color: '#f59e0b',
      label: '↑ TX',
    },
  ]

  return (
    <Widget>
      <WidgetHeader
        icon={<NetworkIcon />}
        subject={`${subject} (${activeInterface})`}
        title={title}
      />
      <WidgetBody scrollable>
        <WidgetErrorBoundary resetKeys={[rxValue, txValue, activeInterface]}>
          <ChartContainer
            className="h-full w-full shrink-0"
            config={{} satisfies ChartConfig}
            style={{ height: showWindows ? 'calc(100% - 60px)' : 'calc(100% - 32px)' }}
          >
            <Liveline
              data={[]}
              formatValue={(value) =>
                formatBytesPerSecond(value, { ...BYTES_OPTIONS, maximumFractionDigits: 1 })
              }
              loading={rxDataPoints.length === 0 || txDataPoints.length === 0}
              series={series}
              theme={mode}
              value={0}
              windows={showWindows ? CHART_WINDOW_OPTIONS : undefined}
            />
          </ChartContainer>
        </WidgetErrorBoundary>
      </WidgetBody>
    </Widget>
  )
}
