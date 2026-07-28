import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createSystemClient } from './client'

const si = vi.hoisted(() => ({
  battery: vi.fn(),
  cpu: vi.fn(),
  cpuTemperature: vi.fn(),
  currentLoad: vi.fn(),
  fsSize: vi.fn(),
  mem: vi.fn(),
  networkInterfaces: vi.fn(),
  networkStats: vi.fn(),
  osInfo: vi.fn(),
  processes: vi.fn(),
  system: vi.fn(),
  time: vi.fn(),
}))

vi.mock('systeminformation', () => ({
  default: si,
}))

const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
}

/** Mimics immediate first push; no timers. */
function createTestPushInterval(intervalUsed: { current: number }) {
  return (options?: { interval?: number }) => {
    if (options?.interval !== undefined) {
      intervalUsed.current = options.interval
    }

    return (
      _key: string,
      callback: (data: unknown) => void,
      fetchFn: () => Promise<unknown>,
    ): (() => void) => {
      void fetchFn().then((data) => {
        callback(data)
      })
      return vi.fn()
    }
  }
}

const baseCpu = {
  manufacturer: 'Test',
  brand: 'CPU',
  speed: 2.4,
  speedMin: 0.8,
  speedMax: 3.2,
  cores: 8,
  physicalCores: 4,
  processors: 1,
}

const baseOs = {
  platform: 'darwin',
  distro: 'macOS',
  release: '14.0',
  codename: '',
  kernel: '23.0.0',
  arch: 'arm64',
  hostname: 'test-host',
  logofile: 'apple',
}

const baseSystem = {
  manufacturer: 'Apple',
  model: 'Mac',
  version: '1.0',
  serial: 'serial',
  uuid: 'uuid',
}

const baseTime = {
  current: 1_700_000_000_000,
  uptime: 3600,
  timezone: 'UTC',
  timezoneName: 'UTC',
}

function seedSystemInfoMocks(): void {
  si.cpu.mockResolvedValue(baseCpu)
  si.osInfo.mockResolvedValue(baseOs)
  si.system.mockResolvedValue(baseSystem)
  si.time.mockReturnValue(baseTime)
}

beforeEach(() => {
  vi.clearAllMocks()
  seedSystemInfoMocks()
  si.time.mockReturnValue(baseTime)
  si.currentLoad.mockResolvedValue({
    avgLoad: 1,
    currentLoad: 10,
    currentLoadUser: 5,
    currentLoadSystem: 5,
    currentLoadIdle: 90,
    cpus: [
      {
        load: 10,
        loadUser: 5,
        loadSystem: 5,
        loadIdle: 90,
      },
    ],
  })
  si.cpuTemperature.mockResolvedValue({
    main: 45,
    cores: [44, 46],
    max: 48,
  })
  si.mem.mockResolvedValue({
    total: 16_000_000_000,
    free: 4_000_000_000,
    used: 12_000_000_000,
    active: 8_000_000_000,
    available: 4_000_000_000,
    buffcache: 0,
    swaptotal: 0,
    swapused: 0,
    swapfree: 0,
  })
  si.fsSize.mockResolvedValue([
    {
      fs: '/dev/disk1',
      type: 'APFS',
      size: 500_000_000_000,
      used: 250_000_000_000,
      available: 250_000_000_000,
      use: 50,
      mount: '/',
    },
  ])
  si.networkInterfaces.mockResolvedValue([
    {
      iface: 'en0',
      ifaceName: 'en0',
      ip4: '192.168.1.1',
      ip6: '',
      mac: 'aa:bb:cc',
      speed: 1000,
      type: 'wireless',
      operstate: 'up',
    },
  ])
  si.networkStats.mockResolvedValue([
    {
      iface: 'en0',
      operstate: 'up',
      rx_bytes: 1000,
      rx_sec: 10,
      tx_bytes: 500,
      tx_sec: 5,
    },
  ])
  si.processes.mockResolvedValue({
    all: 100,
    running: 10,
    blocked: 0,
    sleeping: 90,
    list: [
      { pid: 1, name: 'high-cpu', cpu: 50, mem: 10, command: 'a' },
      { pid: 2, name: 'high-mem', cpu: 5, mem: 80, command: 'b' },
      { pid: 3, name: 'mid', cpu: 20, mem: 20, command: 'c' },
    ],
  })
  si.battery.mockResolvedValue({
    hasBattery: true,
    cycleCount: 100,
    isCharging: false,
    percent: 85,
    timeRemaining: 120,
    acConnected: false,
  })
})

describe('createSystemClient', () => {
  it('should throw when createPushInterval is not provided', () => {
    const register = createSystemClient({})
    expect(() => {
      register({ logger: mockLogger as never, createPushInterval: undefined })
    }).toThrow('@dashfy/ext-system requires push mode')
  })

  it('should record push interval from config', async () => {
    const intervalUsed = { current: 0 }
    const createPushInterval = createTestPushInterval(intervalUsed)
    const register = createSystemClient({ pushInterval: 5000 })
    const api = register({
      logger: mockLogger as never,
      createPushInterval: createPushInterval as never,
    })

    const callback = vi.fn()
    await api.systemInfo!(callback)

    expect(intervalUsed.current).toBe(5000)
  })

  describe('systemInfo', () => {
    it('should push mapped cpu, os, system, and time', async () => {
      const intervalUsed = { current: 0 }
      const createPushInterval = createTestPushInterval(intervalUsed)
      const register = createSystemClient({})
      const api = register({
        logger: mockLogger as never,
        createPushInterval: createPushInterval as never,
      })

      const callback = vi.fn()
      await api.systemInfo!(callback)
      await waitFor(() => {
        expect(callback).toHaveBeenCalled()
      })

      expect(si.cpu).toHaveBeenCalled()
      expect(si.osInfo).toHaveBeenCalled()
      expect(si.system).toHaveBeenCalled()
      expect(si.time).toHaveBeenCalled()

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          cpu: expect.objectContaining({
            manufacturer: 'Test',
            brand: 'CPU',
            speed: 2.4,
            cores: 8,
          }),
          os: expect.objectContaining({
            hostname: 'test-host',
            distro: 'macOS',
          }),
          system: expect.objectContaining({
            manufacturer: 'Apple',
            model: 'Mac',
          }),
          time: expect.objectContaining({
            uptime: 3600,
            timezoneName: 'UTC',
          }),
        }),
      )
    })
  })

  describe('cpuUsage', () => {
    it('should push load and temperature', async () => {
      const intervalUsed = { current: 0 }
      const createPushInterval = createTestPushInterval(intervalUsed)
      const api = createSystemClient({})({
        logger: mockLogger as never,
        createPushInterval: createPushInterval as never,
      })

      const callback = vi.fn()
      await api.cpuUsage!(callback)
      await waitFor(() => {
        expect(callback).toHaveBeenCalled()
      })

      expect(si.currentLoad).toHaveBeenCalled()
      expect(si.cpuTemperature).toHaveBeenCalled()

      expect(callback).toHaveBeenCalledWith({
        load: {
          avgLoad: 1,
          currentLoad: 10,
          currentLoadUser: 5,
          currentLoadSystem: 5,
          currentLoadIdle: 90,
          cpus: [
            {
              load: 10,
              loadUser: 5,
              loadSystem: 5,
              loadIdle: 90,
            },
          ],
        },
        temperature: {
          main: 45,
          cores: [44, 46],
          max: 48,
        },
      })
    })
  })

  describe('memoryUsage', () => {
    it('should push memory fields', async () => {
      const intervalUsed = { current: 0 }
      const createPushInterval = createTestPushInterval(intervalUsed)
      const api = createSystemClient({})({
        logger: mockLogger as never,
        createPushInterval: createPushInterval as never,
      })

      const callback = vi.fn()
      await api.memoryUsage!(callback)
      await waitFor(() => {
        expect(callback).toHaveBeenCalled()
      })

      expect(si.mem).toHaveBeenCalled()
      expect(callback).toHaveBeenCalledWith({
        memory: expect.objectContaining({
          total: 16_000_000_000,
          used: 12_000_000_000,
        }),
      })
    })
  })

  describe('diskUsage', () => {
    it('should map fsSize to disks', async () => {
      const intervalUsed = { current: 0 }
      const createPushInterval = createTestPushInterval(intervalUsed)
      const api = createSystemClient({})({
        logger: mockLogger as never,
        createPushInterval: createPushInterval as never,
      })

      const callback = vi.fn()
      await api.diskUsage!(callback)
      await waitFor(() => {
        expect(callback).toHaveBeenCalled()
      })

      expect(si.fsSize).toHaveBeenCalled()
      expect(callback).toHaveBeenCalledWith({
        disks: [
          expect.objectContaining({
            fs: '/dev/disk1',
            mount: '/',
            use: 50,
          }),
        ],
      })
    })
  })

  describe('networkStats', () => {
    it('should normalize array and single interface/stat shapes', async () => {
      si.networkInterfaces.mockResolvedValue({
        iface: 'lo0',
        ifaceName: 'lo0',
        ip4: '127.0.0.1',
        ip6: '',
        mac: '',
        speed: null,
        type: 'loopback',
        operstate: 'unknown',
      } as never)
      si.networkStats.mockResolvedValue({
        iface: 'lo0',
        operstate: 'unknown',
        rx_bytes: 0,
        rx_sec: null,
        tx_bytes: 0,
        tx_sec: null,
      } as never)

      const intervalUsed = { current: 0 }
      const createPushInterval = createTestPushInterval(intervalUsed)
      const api = createSystemClient({})({
        logger: mockLogger as never,
        createPushInterval: createPushInterval as never,
      })

      const callback = vi.fn()
      await api.networkStats!(callback)
      await waitFor(() => {
        expect(callback).toHaveBeenCalled()
      })

      const payload = callback.mock.calls[0]?.[0] as {
        interfaces: unknown[]
        stats: unknown[]
      }

      expect(payload.interfaces).toHaveLength(1)
      expect(payload.stats).toHaveLength(1)
    })
  })

  describe('processes', () => {
    it('should sort by cpu by default and respect processLimit', async () => {
      const list = Array.from({ length: 15 }, (_, i) => ({
        pid: i,
        name: `p${i}`,
        cpu: i,
        mem: 0,
        command: 'x',
      }))
      si.processes.mockResolvedValue({
        all: 100,
        running: 10,
        blocked: 0,
        sleeping: 90,
        list,
      })

      const intervalUsed = { current: 0 }
      const createPushInterval = createTestPushInterval(intervalUsed)
      const api = createSystemClient({ processLimit: 10 })({
        logger: mockLogger as never,
        createPushInterval: createPushInterval as never,
      })

      const callback = vi.fn()
      await api.processes!(callback)
      await waitFor(() => {
        expect(callback).toHaveBeenCalled()
      })

      const payload = callback.mock.calls[0]?.[0] as {
        processes: { list: { cpu: number }[] }
      }

      expect(payload.processes.list).toHaveLength(10)
      expect(payload.processes.list[0]?.cpu).toBe(14)
      expect(payload.processes.list[9]?.cpu).toBe(5)
    })

    it('should use explicit limit and sort by mem', async () => {
      const intervalUsed = { current: 0 }
      const createPushInterval = createTestPushInterval(intervalUsed)
      const api = createSystemClient({ processLimit: 10 })({
        logger: mockLogger as never,
        createPushInterval: createPushInterval as never,
      })

      const callback = vi.fn()
      await api.processes!(callback, { limit: 2, sortBy: 'mem' })
      await waitFor(() => {
        expect(callback).toHaveBeenCalled()
      })

      const payload = callback.mock.calls[0]?.[0] as {
        processes: { list: { name: string; mem: number }[] }
      }

      expect(payload.processes.list).toHaveLength(2)
      expect(payload.processes.list[0]?.name).toBe('high-mem')
      expect(payload.processes.list[1]?.name).toBe('mid')
    })
  })

  describe('battery', () => {
    it('should push battery fields', async () => {
      const intervalUsed = { current: 0 }
      const createPushInterval = createTestPushInterval(intervalUsed)
      const api = createSystemClient({})({
        logger: mockLogger as never,
        createPushInterval: createPushInterval as never,
      })

      const callback = vi.fn()
      await api.battery!(callback)
      await waitFor(() => {
        expect(callback).toHaveBeenCalled()
      })

      expect(si.battery).toHaveBeenCalled()
      expect(callback).toHaveBeenCalledWith({
        battery: expect.objectContaining({
          hasBattery: true,
          percent: 85,
          isCharging: false,
        }),
      })
    })
  })
})
