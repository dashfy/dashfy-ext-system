/**
 * Shapes of the payloads returned by the system client endpoints.
 *
 * These mirror the `systeminformation` results the client pushes to widgets,
 * narrowed to the fields the widgets actually render.
 */

export interface CpuData {
  manufacturer: string
  brand: string
  speed: number
  speedMin: number
  speedMax: number
  cores: number
  physicalCores: number
  processors: number
}

export interface CpuLoadData {
  avgLoad: number
  currentLoad: number
  currentLoadUser: number
  currentLoadSystem: number
  currentLoadIdle: number
  cpus: CpuCoreLoad[]
}

export interface CpuCoreLoad {
  load: number
  loadUser: number
  loadSystem: number
  loadIdle: number
}

export interface CpuTemperatureData {
  main: number | null
  cores: number[]
  max: number | null
}

export interface MemoryData {
  total: number
  free: number
  used: number
  active: number
  available: number
  buffcache: number
  swaptotal: number
  swapused: number
  swapfree: number
}

export interface DiskData {
  fs: string
  type: string
  size: number
  used: number
  available: number
  use: number
  mount: string
}

export interface NetworkInterfaceData {
  iface: string
  ifaceName: string
  ip4: string
  ip6: string
  mac: string
  speed: number | null
  type: string
  operstate: string
}

export interface NetworkStatsData {
  iface: string
  operstate: string
  rx_bytes: number
  rx_sec: number | null
  tx_bytes: number
  tx_sec: number | null
}

export interface OsData {
  platform: string
  distro: string
  release: string
  codename: string
  kernel: string
  arch: string
  hostname: string
  logofile: string
}

export interface SystemData {
  manufacturer: string
  model: string
  version: string
  serial: string
  uuid: string
}

export interface TimeData {
  current: number
  uptime: number
  timezone: string
  timezoneName: string
}

export interface ProcessData {
  pid: number
  name: string
  cpu: number
  mem: number
  command: string
}

export interface ProcessesData {
  all: number
  running: number
  blocked: number
  sleeping: number
  list: ProcessData[]
}

export interface BatteryData {
  hasBattery: boolean
  cycleCount: number
  isCharging: boolean
  percent: number
  timeRemaining: number
  acConnected: boolean
}

export interface SystemInfoResponse {
  cpu: CpuData
  os: OsData
  system: SystemData
  time: TimeData
}

export interface CpuUsageResponse {
  load: CpuLoadData
  temperature: CpuTemperatureData
}

export interface MemoryUsageResponse {
  memory: MemoryData
}

export interface DiskUsageResponse {
  disks: DiskData[]
}

export interface NetworkStatsResponse {
  interfaces: NetworkInterfaceData[]
  stats: NetworkStatsData[]
}

export interface ProcessesResponse {
  processes: ProcessesData
}

export interface BatteryResponse {
  battery: BatteryData
}
