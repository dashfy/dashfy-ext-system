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
  WidgetTable,
  WidgetTableCell,
  WidgetTableHeadCell,
} from '@getdashfy/ui'
import { formatPercent } from '@getdashfy/utils'
import { ListIcon } from 'lucide-react'

import type { ProcessesResponse } from '@/types'
import { PERCENT_OPTIONS } from '@/utils'

export interface ProcessesProps {
  /**
   * API subscription ID
   * @default 'system'
   */
  api?: string
  /**
   * API endpoint to call
   * @default 'processes'
   */
  endpoint?: string
  /**
   * Custom widget title
   * @default 'System'
   */
  title?: string
  /**
   * Custom widget subject
   * @default 'Processes'
   */
  subject?: string
  /**
   * Maximum number of processes to display
   * @default 10
   */
  limit?: number
  /**
   * Sort processes by CPU or memory usage
   * @default 'cpu'
   */
  sortBy?: 'cpu' | 'mem'
}

/**
 * Displays top processes sorted by CPU or memory usage.
 *
 * @example
 * ```yaml
 * - extension: system
 *   widget: Processes
 * ```
 */
export const Processes = ({
  api = 'system',
  endpoint = 'processes',
  title = 'System',
  subject = 'Processes',
  limit = 10,
  sortBy = 'cpu',
}: ProcessesProps) => {
  const { data, error, loading } = useApiSubscription({
    api,
    endpoint,
    params: { limit, sortBy },
  })

  if (loading && !data) {
    return (
      <Widget>
        <WidgetHeader icon={<ListIcon />} subject={subject} title={title} />
        <WidgetBody>
          <WidgetLoader />
        </WidgetBody>
      </Widget>
    )
  }

  if (error) {
    return (
      <Widget>
        <WidgetHeader icon={<ListIcon />} subject={subject} title={title} />
        <WidgetBody>
          <WidgetError error={error} />
        </WidgetBody>
      </Widget>
    )
  }

  const processData = data as ProcessesResponse
  const { processes } = processData
  const { list, all, running } = processes

  return (
    <Widget>
      <WidgetHeader count={all} icon={<ListIcon />} subject={subject} title={title} />
      <WidgetBody disablePadding scrollable>
        <WidgetErrorBoundary resetKeys={[list.length, all]}>
          {list.length === 0 ? (
            <WidgetEmpty message="No processes found" />
          ) : (
            <>
              <div className="text-muted-foreground flex gap-4 px-3 py-2 text-xs">
                <span>Total: {all}</span>
                <span>Running: {running}</span>
                <span>Sleeping: {processes.sleeping}</span>
              </div>
              <WidgetTable>
                <thead>
                  <tr className="border-y">
                    <WidgetTableHeadCell className="w-16">PID</WidgetTableHeadCell>
                    <WidgetTableHeadCell>Name</WidgetTableHeadCell>
                    <WidgetTableHeadCell align="right" className="w-20">
                      CPU
                    </WidgetTableHeadCell>
                    <WidgetTableHeadCell align="right" className="w-20">
                      MEM
                    </WidgetTableHeadCell>
                  </tr>
                </thead>
                <tbody>
                  {list.map((proc) => (
                    <tr key={generateReactKey('proc', proc.pid)}>
                      <WidgetTableCell className="font-mono text-xs">{proc.pid}</WidgetTableCell>
                      <WidgetTableCell>
                        <span className="truncate text-sm" title={proc.command}>
                          {proc.name}
                        </span>
                      </WidgetTableCell>
                      <WidgetTableCell align="right" className="font-mono text-xs">
                        {formatPercent(proc.cpu, PERCENT_OPTIONS)}
                      </WidgetTableCell>
                      <WidgetTableCell align="right" className="font-mono text-xs">
                        {formatPercent(proc.mem, PERCENT_OPTIONS)}
                      </WidgetTableCell>
                    </tr>
                  ))}
                </tbody>
              </WidgetTable>
            </>
          )}
        </WidgetErrorBoundary>
      </WidgetBody>
    </Widget>
  )
}
