import type { APIRegistration } from '@dashfy/types'
import si from 'systeminformation'

const DEFAULT_PROCESS_LIMIT = 10
const DEFAULT_PUSH_INTERVAL = 2_000

export interface SystemClientConfig {
  /**
   * Maximum number of processes to return, sorted by CPU usage.
   * @default 10
   */
  processLimit?: number
  /**
   * Interval in milliseconds for pushing system metrics updates.
   * Only used in push mode.
   * @default 2_000
   */
  pushInterval?: number
}

/**
 * Creates a System monitoring API client for Dashfy using push mode.
 *
 * Uses the `systeminformation` package to collect metrics from the local machine
 * where the Dashfy server is running. Each API method sets up its own interval
 * to push data at the configured frequency.
 *
 * @param config - Client configuration
 * @param config.processLimit - Max processes to return (default: 10)
 * @param config.pushInterval - Push interval in milliseconds (default: 2_000)
 * @returns API registration function for Dashfy
 *
 * @example
 * ```ts
 * import { Dashfy } from '@dashfy/server'
 * import { createSystemClient } from '@dashfy/ext-system/client'
 *
 * const dashfy = new Dashfy()
 * dashfy.registerApi('system', createSystemClient(), 'push')
 * ```
 */
export function createSystemClient(config: SystemClientConfig = {}): APIRegistration {
  const { processLimit = DEFAULT_PROCESS_LIMIT, pushInterval = DEFAULT_PUSH_INTERVAL } = config

  return ({ logger, createPushInterval }) => {
    if (!createPushInterval) {
      throw new Error(
        "@dashfy/ext-system requires push mode. Register with: dashfy.registerApi('system', createSystemClient(), 'push')",
      )
    }

    const startPushInterval = createPushInterval({ interval: pushInterval })

    return {
      /**
       * Get static system information (CPU model, OS, hostname, uptime).
       */
      systemInfo: (callback: (data: unknown) => void): Promise<() => void> => {
        const stopPushInterval = startPushInterval('systemInfo', callback, async () => {
          logger.info('[system.systemInfo] Collecting system information')

          const [cpu, os, system] = await Promise.all([si.cpu(), si.osInfo(), si.system()])

          const time = si.time()

          return {
            cpu: {
              manufacturer: cpu.manufacturer,
              brand: cpu.brand,
              speed: cpu.speed,
              speedMin: cpu.speedMin,
              speedMax: cpu.speedMax,
              cores: cpu.cores,
              physicalCores: cpu.physicalCores,
              processors: cpu.processors,
            },
            os: {
              platform: os.platform,
              distro: os.distro,
              release: os.release,
              codename: os.codename,
              kernel: os.kernel,
              arch: os.arch,
              hostname: os.hostname,
              logofile: os.logofile,
            },
            system: {
              manufacturer: system.manufacturer,
              model: system.model,
              version: system.version,
              serial: system.serial,
              uuid: system.uuid,
            },
            time: {
              current: time.current,
              uptime: time.uptime,
              timezone: time.timezone,
              timezoneName: time.timezoneName,
            },
          }
        })

        return Promise.resolve(stopPushInterval)
      },

      /**
       * Get current CPU usage and temperature.
       */
      cpuUsage: (callback: (data: unknown) => void): Promise<() => void> => {
        const stopPushInterval = startPushInterval('cpuUsage', callback, async () => {
          logger.info('[system.cpuUsage] Collecting CPU usage')

          const [load, temperature] = await Promise.all([si.currentLoad(), si.cpuTemperature()])

          return {
            load: {
              avgLoad: load.avgLoad,
              currentLoad: load.currentLoad,
              currentLoadUser: load.currentLoadUser,
              currentLoadSystem: load.currentLoadSystem,
              currentLoadIdle: load.currentLoadIdle,
              cpus: load.cpus.map((core) => ({
                load: core.load,
                loadUser: core.loadUser,
                loadSystem: core.loadSystem,
                loadIdle: core.loadIdle,
              })),
            },
            temperature: {
              main: temperature.main,
              cores: temperature.cores,
              max: temperature.max,
            },
          }
        })

        return Promise.resolve(stopPushInterval)
      },

      /**
       * Get current memory usage.
       */
      memoryUsage: (callback: (data: unknown) => void): Promise<() => void> => {
        const stopPushInterval = startPushInterval('memoryUsage', callback, async () => {
          logger.info('[system.memoryUsage] Collecting memory usage')

          const mem = await si.mem()

          return {
            memory: {
              total: mem.total,
              free: mem.free,
              used: mem.used,
              active: mem.active,
              available: mem.available,
              buffcache: mem.buffcache,
              swaptotal: mem.swaptotal,
              swapused: mem.swapused,
              swapfree: mem.swapfree,
            },
          }
        })

        return Promise.resolve(stopPushInterval)
      },

      /**
       * Get disk/filesystem usage.
       */
      diskUsage: (callback: (data: unknown) => void): Promise<() => void> => {
        const stopPushInterval = startPushInterval('diskUsage', callback, async () => {
          logger.info('[system.diskUsage] Collecting disk usage')

          const fsSize = await si.fsSize()

          return {
            disks: fsSize.map((disk) => ({
              fs: disk.fs,
              type: disk.type,
              size: disk.size,
              used: disk.used,
              available: disk.available,
              use: disk.use,
              mount: disk.mount,
            })),
          }
        })

        return Promise.resolve(stopPushInterval)
      },

      /**
       * Get network interfaces and stats (bytes transferred).
       */
      networkStats: (callback: (data: unknown) => void): Promise<() => void> => {
        const stopPushInterval = startPushInterval('networkStats', callback, async () => {
          logger.info('[system.networkStats] Collecting network stats')

          const [interfaces, stats] = await Promise.all([si.networkInterfaces(), si.networkStats()])

          const interfaceArray = Array.isArray(interfaces) ? interfaces : [interfaces]
          const statsArray = Array.isArray(stats) ? stats : [stats]

          return {
            interfaces: interfaceArray.map((iface) => ({
              iface: iface.iface,
              ifaceName: iface.ifaceName,
              ip4: iface.ip4,
              ip6: iface.ip6,
              mac: iface.mac,
              speed: iface.speed,
              type: iface.type,
              operstate: iface.operstate,
            })),
            stats: statsArray.map((stat) => ({
              iface: stat.iface,
              operstate: stat.operstate,
              rx_bytes: stat.rx_bytes,
              rx_sec: stat.rx_sec,
              tx_bytes: stat.tx_bytes,
              tx_sec: stat.tx_sec,
            })),
          }
        })

        return Promise.resolve(stopPushInterval)
      },

      /**
       * Get running processes, sorted by CPU usage.
       */
      processes: (
        callback: (data: unknown) => void,
        params?: {
          limit?: number
          sortBy?: 'cpu' | 'mem'
        },
      ): Promise<() => void> => {
        const limit = params?.limit ?? processLimit
        const sortBy = params?.sortBy ?? 'cpu'

        const stopPushInterval = startPushInterval('processes', callback, async () => {
          logger.info(`[system.processes] Collecting top ${limit} processes by ${sortBy}`)

          const processes = await si.processes()

          const sortedList = processes.list
            .sort((a, b) => (sortBy === 'cpu' ? b.cpu - a.cpu : b.mem - a.mem))
            .slice(0, limit)
            .map((proc) => ({
              pid: proc.pid,
              name: proc.name,
              cpu: proc.cpu,
              mem: proc.mem,
              command: proc.command,
            }))

          return {
            processes: {
              all: processes.all,
              running: processes.running,
              blocked: processes.blocked,
              sleeping: processes.sleeping,
              list: sortedList,
            },
          }
        })

        return Promise.resolve(stopPushInterval)
      },

      /**
       * Get battery status (laptops).
       */
      battery: (callback: (data: unknown) => void): Promise<() => void> => {
        const stopPushInterval = startPushInterval('battery', callback, async () => {
          logger.info('[system.battery] Collecting battery status')

          const battery = await si.battery()

          return {
            battery: {
              hasBattery: battery.hasBattery,
              cycleCount: battery.cycleCount,
              isCharging: battery.isCharging,
              percent: battery.percent,
              timeRemaining: battery.timeRemaining,
              acConnected: battery.acConnected,
            },
          }
        })

        return Promise.resolve(stopPushInterval)
      },
    }
  }
}
