import type {
  CpuUsageResponse,
  DiskUsageResponse,
  MemoryUsageResponse,
  NetworkStatsResponse,
  ProcessesResponse,
  SystemInfoResponse,
} from '@/types'

export const systemInfoResponse: SystemInfoResponse = {
  cpu: {
    manufacturer: 'TestMfg',
    brand: 'Test CPU',
    speed: 2.4,
    speedMin: 0.8,
    speedMax: 3.2,
    cores: 8,
    physicalCores: 4,
    processors: 1,
  },
  os: {
    platform: 'darwin',
    distro: 'macOS',
    release: '14.0',
    codename: '',
    kernel: '23.0.0',
    arch: 'arm64',
    hostname: 'my-host',
    logofile: 'apple',
  },
  system: {
    manufacturer: 'To Be Filled By O.E.M.',
    model: 'Generic',
    version: '1',
    serial: 'x',
    uuid: 'y',
  },
  time: {
    current: 1_700_000_000_000,
    uptime: 3600,
    timezone: 'UTC',
    timezoneName: 'UTC',
  },
}

export const systemInfoWithHardware: SystemInfoResponse = {
  ...systemInfoResponse,
  system: {
    manufacturer: 'Dell',
    model: 'XPS',
    version: '1',
    serial: 's',
    uuid: 'u',
  },
}

export const cpuUsageResponse: CpuUsageResponse = {
  load: {
    avgLoad: 1,
    currentLoad: 25.5,
    currentLoadUser: 10,
    currentLoadSystem: 5,
    currentLoadIdle: 59.5,
    cpus: [
      { load: 20, loadUser: 8, loadSystem: 2, loadIdle: 70 },
      { load: 30, loadUser: 12, loadSystem: 3, loadIdle: 55 },
    ],
  },
  temperature: { main: 45, cores: [44, 46], max: 48 },
}

export const memoryUsageResponse: MemoryUsageResponse = {
  memory: {
    total: 16_000_000_000,
    free: 4_000_000_000,
    used: 12_000_000_000,
    active: 8_000_000_000,
    available: 4_000_000_000,
    buffcache: 1_000_000_000,
    swaptotal: 2_000_000_000,
    swapused: 500_000_000,
    swapfree: 1_500_000_000,
  },
}

export const memoryUsageNoSwap: MemoryUsageResponse = {
  memory: {
    ...memoryUsageResponse.memory,
    swaptotal: 0,
    swapused: 0,
    swapfree: 0,
  },
}

export const diskUsageResponse: DiskUsageResponse = {
  disks: [
    {
      fs: '/dev/disk1',
      type: 'APFS',
      size: 500_000_000_000,
      used: 250_000_000_000,
      available: 250_000_000_000,
      use: 50,
      mount: '/',
    },
    {
      fs: '/dev/disk2',
      type: 'APFS',
      size: 100_000_000_000,
      used: 10_000_000_000,
      available: 90_000_000_000,
      use: 10,
      mount: '/home',
    },
  ],
}

export const networkStatsResponse: NetworkStatsResponse = {
  interfaces: [],
  stats: [
    {
      iface: 'en0',
      operstate: 'up',
      rx_bytes: 1000,
      rx_sec: 1024,
      tx_bytes: 500,
      tx_sec: 512,
    },
    {
      iface: 'lo0',
      operstate: 'down',
      rx_bytes: 0,
      rx_sec: 0,
      tx_bytes: 0,
      tx_sec: 0,
    },
  ],
}

export const networkStatsNoActive: NetworkStatsResponse = {
  interfaces: [],
  stats: [
    {
      iface: 'lo0',
      operstate: 'down',
      rx_bytes: 0,
      rx_sec: null,
      tx_bytes: 0,
      tx_sec: null,
    },
  ],
}

export const processesResponse: ProcessesResponse = {
  processes: {
    all: 200,
    running: 5,
    blocked: 0,
    sleeping: 195,
    list: [
      { pid: 1, name: 'kernel', cpu: 1.2, mem: 0.5, command: '/sbin/kernel' },
      { pid: 42, name: 'node', cpu: 5.5, mem: 10, command: 'node app.js' },
    ],
  },
}
