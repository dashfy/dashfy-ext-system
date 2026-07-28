# Dashfy System Extension

[![npm version](https://img.shields.io/npm/v/@dashfy/ext-system.svg?style=flat-square)](https://www.npmjs.com/package/@dashfy/ext-system)
[![License](https://img.shields.io/github/license/dashfy/dashfy.svg?style=flat-square)](https://github.com/dashfy/dashfy/blob/main/LICENSE)

> System monitoring extension for [Dashfy](https://github.com/dashfy/dashfy) - Monitor CPU, memory, disk, network, and processes.

This extension provides widgets to display real-time system resource metrics from the machine running the Dashfy server using [systeminformation](https://github.com/sebhildebrandt/systeminformation).

## Features

- **🖥️ CPU monitoring**: Real-time CPU usage with per-core breakdown and temperature
- **🧠 Memory tracking**: RAM and swap usage with detailed breakdown
- **💾 Disk usage**: Filesystem usage per mount point with progress bars
- **🌐 Network stats**: Interface status, bytes transferred, and current speed
- **📋 Process list**: Top processes sorted by CPU or memory usage
- **🔧 System info**: Hostname, OS, CPU model, uptime, and hardware details
- **🔋 Battery status**: Battery level, charging state, and time remaining
- **⚡ Real-time updates**: Automatic data refresh via WebSocket subscriptions
- **🎨 Theme support**: Works with all Dashfy themes (light/dark mode)

## Installation

```bash
npm install @dashfy/ext-system
# or
pnpm add @dashfy/ext-system
# or
yarn add @dashfy/ext-system
```

## Package Structure

This extension has two entry points:

- **`@dashfy/ext-system`** — Browser-safe React widgets (import in your React app)
- **`@dashfy/ext-system/client`** — Server-only API client with `systeminformation` (import in your Dashfy server)

This separation ensures Node.js-only dependencies don't get bundled into your browser code.

## Quick Start

### 1. Server Setup

Register the System API client in your Dashfy server using **push mode**:

```ts
import { Dashfy } from '@dashfy/server'
import { createSystemClient } from '@dashfy/ext-system/client'

const dashfy = new Dashfy()

// Register System API with push mode for real-time updates
dashfy.registerApi(
  'system',
  createSystemClient({
    pushInterval: 2000, // Update every 2 seconds
  }),
  'push',
)

await dashfy.start()
```

> **Important:**
>
> - Import the client from `@dashfy/ext-system/client` (not the main export). This ensures the Node.js-only `systeminformation` package is not bundled into your browser code.
> - Use `'push'` mode (third parameter) for real-time system monitoring with custom update intervals.

### 2. Client Setup

Register System widgets in your React application:

```tsx
import { WidgetRegistry } from '@dashfy/ui'
import {
  CpuUsage,
  CpuUsageLine,
  DiskUsage,
  MemoryUsage,
  MemoryUsageLine,
  NetworkStats,
  NetworkStatsLine,
  Processes,
  SystemInfo,
} from '@dashfy/ext-system'

// Register all System widgets
WidgetRegistry.addExtension('system', {
  CpuUsage,
  CpuUsageLine,
  DiskUsage,
  MemoryUsage,
  MemoryUsageLine,
  NetworkStats,
  NetworkStatsLine,
  Processes,
  SystemInfo,
})
```

### 3. Dashboard Configuration

Add System widgets to your dashboard configuration:

```yaml
# dashfy.config.yml
port: 5001
dashboards:
  - title: System Monitor
    columns: 3
    rows: 2
    widgets:
      - extension: system
        widget: CpuUsage
        showCores: true
        x: 0
        y: 0
        columns: 1
        rows: 1

      - extension: system
        widget: MemoryUsage
        x: 1
        y: 0
        columns: 1
        rows: 1

      - extension: system
        widget: DiskUsage
        x: 2
        y: 0
        columns: 1
        rows: 1
```

## System Client Configuration

### Configuration Options

```ts
createSystemClient({
  // Maximum number of processes to return (sorted by CPU usage)
  processLimit: 10, // default

  // Push interval in milliseconds (how often to send updates)
  pushInterval: 2000, // default (2 seconds)
})
```

### Push Mode

This extension uses **push mode** for real-time system monitoring. Unlike poll mode (where the Bus controls timing), push mode allows each metric to update at its own frequency:

```ts
// Register with push mode
dashfy.registerApi(
  'system',
  createSystemClient({
    pushInterval: 2000, // Update every 2 seconds
  }),
  'push', // ← Important: specify push mode
)
```

**Benefits:**

- Independent update frequency from other APIs
- More responsive for fast-changing metrics like CPU/memory
- Efficient: only active subscriptions run intervals

### API Endpoints

The system client exposes the following endpoints:

| Endpoint       | Description                        | Data Source           |
| -------------- | ---------------------------------- | --------------------- |
| `systemInfo`   | Static system info (OS, CPU, etc.) | `si.cpu`, `si.osInfo` |
| `cpuUsage`     | Current CPU load and temperature   | `si.currentLoad`      |
| `memoryUsage`  | RAM and swap usage                 | `si.mem`              |
| `diskUsage`    | Filesystem usage per mount         | `si.fsSize`           |
| `networkStats` | Network interfaces and traffic     | `si.networkStats`     |
| `processes`    | Top processes by CPU/memory        | `si.processes`        |
| `battery`      | Battery status (laptops)           | `si.battery`          |

## Available Widgets

### `CpuUsage`

Displays current CPU usage with an overall load bar and optional per-core breakdown.

**Parameters:**

| Parameter         | Type    | Required | Default    | Description              |
| ----------------- | ------- | -------- | ---------- | ------------------------ |
| `title`           | string  | no       | "System"   | Custom widget title      |
| `showCores`       | boolean | no       | false      | Show per-core usage bars |
| `showTemperature` | boolean | no       | true       | Show CPU temperature     |
| `api`             | string  | no       | "system"   | API subscription ID      |
| `endpoint`        | string  | no       | "cpuUsage" | API endpoint to call     |

**Example:**

```yaml
- extension: system
  widget: CpuUsage
  showCores: true
  showTemperature: true
  columns: 1
  rows: 1
```

---

### `CpuUsageLine`

Displays CPU usage as a real-time animated line chart with smooth interpolation using [Liveline](https://github.com/benjitaylor/liveline).

**Parameters:**

| Parameter     | Type    | Required | Default    | Description                        |
| ------------- | ------- | -------- | ---------- | ---------------------------------- |
| `title`       | string  | no       | "System"   | Custom widget title                |
| `window`      | number  | no       | 60         | Time window in seconds             |
| `showWindows` | boolean | no       | true       | Show time window buttons (30s-15m) |
| `api`         | string  | no       | "system"   | API subscription ID                |
| `endpoint`    | string  | no       | "cpuUsage" | API endpoint to call               |

**Example:**

```yaml
- extension: system
  widget: CpuUsageLine
  window: 120
  showWindows: true
  columns: 2
  rows: 1
```

---

### `CpuUsageGauge`

Displays CPU usage as a radial gauge chart with color-coded status (green/yellow/red).

**Parameters:**

| Parameter  | Type   | Required | Default    | Description          |
| ---------- | ------ | -------- | ---------- | -------------------- |
| `title`    | string | no       | "System"   | Custom widget title  |
| `api`      | string | no       | "system"   | API subscription ID  |
| `endpoint` | string | no       | "cpuUsage" | API endpoint to call |

**Example:**

```yaml
- extension: system
  widget: CpuUsageGauge
  columns: 1
  rows: 1
```

---

### `MemoryUsage`

Displays current memory (RAM) usage with a progress bar and detailed breakdown.

**Parameters:**

| Parameter  | Type    | Required | Default       | Description           |
| ---------- | ------- | -------- | ------------- | --------------------- |
| `title`    | string  | no       | "System"      | Custom widget title   |
| `showSwap` | boolean | no       | true          | Show swap memory info |
| `api`      | string  | no       | "system"      | API subscription ID   |
| `endpoint` | string  | no       | "memoryUsage" | API endpoint to call  |

**Example:**

```yaml
- extension: system
  widget: MemoryUsage
  showSwap: true
  columns: 1
  rows: 1
```

---

### `MemoryUsageLine`

Displays memory usage as a real-time animated line chart with smooth interpolation using [Liveline](https://github.com/benjitaylor/liveline).

**Parameters:**

| Parameter     | Type    | Required | Default       | Description                        |
| ------------- | ------- | -------- | ------------- | ---------------------------------- |
| `title`       | string  | no       | "System"      | Custom widget title                |
| `window`      | number  | no       | 60            | Time window in seconds             |
| `showWindows` | boolean | no       | true          | Show time window buttons (30s-15m) |
| `api`         | string  | no       | "system"      | API subscription ID                |
| `endpoint`    | string  | no       | "memoryUsage" | API endpoint to call               |

**Example:**

```yaml
- extension: system
  widget: MemoryUsageLine
  window: 300
  showWindows: true
  columns: 2
  rows: 1
```

---

### `MemoryUsageGauge`

Displays memory usage as a radial gauge chart with color-coded status (green/yellow/red).

**Parameters:**

| Parameter  | Type   | Required | Default       | Description          |
| ---------- | ------ | -------- | ------------- | -------------------- |
| `title`    | string | no       | "System"      | Custom widget title  |
| `api`      | string | no       | "system"      | API subscription ID  |
| `endpoint` | string | no       | "memoryUsage" | API endpoint to call |

**Example:**

```yaml
- extension: system
  widget: MemoryUsageGauge
  columns: 1
  rows: 1
```

---

### `DiskUsage`

Displays filesystem/disk usage with progress bars per mount point.

**Parameters:**

| Parameter  | Type   | Required | Default     | Description          |
| ---------- | ------ | -------- | ----------- | -------------------- |
| `title`    | string | no       | "System"    | Custom widget title  |
| `api`      | string | no       | "system"    | API subscription ID  |
| `endpoint` | string | no       | "diskUsage" | API endpoint to call |

**Example:**

```yaml
- extension: system
  widget: DiskUsage
  columns: 1
  rows: 1
```

---

### `DiskUsageGauge`

Displays disk usage as a radial gauge chart with color-coded status (green/yellow/red).

**Parameters:**

| Parameter  | Type   | Required | Default     | Description                      |
| ---------- | ------ | -------- | ----------- | -------------------------------- |
| `title`    | string | no       | "System"    | Custom widget title              |
| `mount`    | string | no       | (first)     | Mount point to display (e.g., /) |
| `api`      | string | no       | "system"    | API subscription ID              |
| `endpoint` | string | no       | "diskUsage" | API endpoint to call             |

**Example:**

```yaml
- extension: system
  widget: DiskUsageGauge
  mount: /
  columns: 1
  rows: 1
```

---

### `NetworkStats`

Displays network interface stats including bytes transferred and current speed.

**Parameters:**

| Parameter  | Type   | Required | Default        | Description          |
| ---------- | ------ | -------- | -------------- | -------------------- |
| `title`    | string | no       | "System"       | Custom widget title  |
| `api`      | string | no       | "system"       | API subscription ID  |
| `endpoint` | string | no       | "networkStats" | API endpoint to call |

**Example:**

```yaml
- extension: system
  widget: NetworkStats
  columns: 1
  rows: 1
```

---

### `NetworkStatsLine`

Displays network traffic (RX/TX) as a real-time multi-series animated line chart using [Liveline](https://github.com/benjitaylor/liveline).

**Parameters:**

| Parameter     | Type    | Required | Default        | Description                        |
| ------------- | ------- | -------- | -------------- | ---------------------------------- |
| `title`       | string  | no       | "System"       | Custom widget title                |
| `interface`   | string  | no       | (auto)         | Network interface (e.g., 'en0')    |
| `window`      | number  | no       | 60             | Time window in seconds             |
| `showWindows` | boolean | no       | true           | Show time window buttons (30s-15m) |
| `api`         | string  | no       | "system"       | API subscription ID                |
| `endpoint`    | string  | no       | "networkStats" | API endpoint to call               |

**Example:**

```yaml
- extension: system
  widget: NetworkStatsLine
  interface: en0
  window: 120
  showWindows: true
  columns: 2
  rows: 1
```

---

### `NetworkStatsCompact`

Displays combined network traffic (RX + TX) in a compact text view.

**Parameters:**

| Parameter   | Type   | Required | Default        | Description                     |
| ----------- | ------ | -------- | -------------- | ------------------------------- |
| `title`     | string | no       | "System"       | Custom widget title             |
| `interface` | string | no       | (auto)         | Network interface (e.g., 'en0') |
| `api`       | string | no       | "system"       | API subscription ID             |
| `endpoint`  | string | no       | "networkStats" | API endpoint to call            |

**Example:**

```yaml
- extension: system
  widget: NetworkStatsCompact
  interface: en0
  columns: 1
  rows: 1
```

---

### `Processes`

Displays top processes sorted by CPU or memory usage.

**Parameters:**

| Parameter  | Type           | Required | Default     | Description                 |
| ---------- | -------------- | -------- | ----------- | --------------------------- |
| `title`    | string         | no       | "System"    | Custom widget title         |
| `limit`    | number         | no       | 10          | Max processes to display    |
| `sortBy`   | "cpu" \| "mem" | no       | "cpu"       | Sort by CPU or memory usage |
| `api`      | string         | no       | "system"    | API subscription ID         |
| `endpoint` | string         | no       | "processes" | API endpoint to call        |

**Example:**

```yaml
- extension: system
  widget: Processes
  limit: 15
  sortBy: cpu
  columns: 2
  rows: 1
```

---

### `SystemInfo`

Displays static system information: hostname, OS, CPU model, uptime, etc.

**Parameters:**

| Parameter  | Type   | Required | Default      | Description          |
| ---------- | ------ | -------- | ------------ | -------------------- |
| `title`    | string | no       | "System"     | Custom widget title  |
| `api`      | string | no       | "system"     | API subscription ID  |
| `endpoint` | string | no       | "systemInfo" | API endpoint to call |

**Example:**

```yaml
- extension: system
  widget: SystemInfo
  columns: 1
  rows: 1
```

---

## Complete Examples

### Example 1: Full System Monitor

```yaml
# dashfy.config.yml
dashboards:
  - title: System Monitor
    columns: 3
    rows: 2
    widgets:
      # CPU usage with per-core breakdown
      - extension: system
        widget: CpuUsage
        showCores: true
        showTemperature: true
        x: 0
        y: 0
        columns: 1
        rows: 1

      # Memory usage
      - extension: system
        widget: MemoryUsage
        showSwap: true
        x: 1
        y: 0
        columns: 1
        rows: 1

      # System info
      - extension: system
        widget: SystemInfo
        x: 2
        y: 0
        columns: 1
        rows: 1

      # Disk usage
      - extension: system
        widget: DiskUsage
        x: 0
        y: 1
        columns: 1
        rows: 1

      # Network stats
      - extension: system
        widget: NetworkStats
        x: 1
        y: 1
        columns: 1
        rows: 1

      # Top processes
      - extension: system
        widget: Processes
        limit: 10
        sortBy: cpu
        x: 2
        y: 1
        columns: 1
        rows: 1
```

### Example 2: Compact Overview

```yaml
dashboards:
  - title: Server Health
    columns: 2
    rows: 2
    widgets:
      - extension: system
        widget: CpuUsage
        x: 0
        y: 0
        columns: 1
        rows: 1

      - extension: system
        widget: MemoryUsage
        x: 1
        y: 0
        columns: 1
        rows: 1

      - extension: system
        widget: DiskUsage
        x: 0
        y: 1
        columns: 1
        rows: 1

      - extension: system
        widget: Processes
        limit: 5
        x: 1
        y: 1
        columns: 1
        rows: 1
```

### Example 3: TypeScript Configuration

```ts
import type { DashfyConfig } from '@dashfy/types'

const config: DashfyConfig = {
  dashboards: [
    {
      title: 'System Monitor',
      columns: 3,
      rows: 2,
      widgets: [
        {
          extension: 'system',
          widget: 'CpuUsage',
          showCores: true,
          x: 0,
          y: 0,
          columns: 1,
          rows: 1,
        },
        {
          extension: 'system',
          widget: 'MemoryUsage',
          x: 1,
          y: 0,
          columns: 1,
          rows: 1,
        },
        {
          extension: 'system',
          widget: 'Processes',
          limit: 15,
          sortBy: 'cpu',
          x: 2,
          y: 0,
          columns: 1,
          rows: 2,
        },
      ],
    },
  ],
}

export default config
```

## Cross-Platform Support

This extension uses [systeminformation](https://github.com/sebhildebrandt/systeminformation) which supports:

- **macOS**: Full support including CPU temperature (via powermetrics)
- **Linux**: Full support including CPU temperature
- **Windows**: Full support (some features may require admin privileges)
- **FreeBSD/OpenBSD**: Partial support

> **Note:** CPU temperature may not be available on all systems. When unavailable, the widget gracefully displays "N/A".

## Troubleshooting

### CPU temperature shows N/A

**Solution:** CPU temperature is not available on all hardware. On macOS, it may require running the server with elevated privileges. On Linux, ensure `lm-sensors` is installed.

### High CPU usage from the extension itself

**Solution:** Increase the `pushInterval` (e.g., 3000ms or 5000ms) or limit the number of system widgets.

### No network interfaces shown

**Solution:** The widget only displays active ("up") interfaces. Ensure your network interfaces are connected and active.

### Processes list is empty

**Solution:** Some environments may restrict process listing. Ensure the Dashfy server has appropriate permissions to read process information.

## Contributing

Contributions are welcome! Please refer to the main [Dashfy contributing guide](https://github.com/dashfy/dashfy/blob/main/CONTRIBUTING.md).

## Related Packages

- [`@dashfy/server`](https://www.npmjs.com/package/@dashfy/server) - Dashfy server
- [`@dashfy/ui`](https://www.npmjs.com/package/@dashfy/ui) - Dashfy UI components
- [`@dashfy/types`](https://www.npmjs.com/package/@dashfy/types) - Dashfy TypeScript types
- [`@dashfy/ext-github`](https://www.npmjs.com/package/@dashfy/ext-github) - GitHub extension
- [`@dashfy/ext-json`](https://www.npmjs.com/package/@dashfy/ext-json) - JSON/REST API extension
- [`@dashfy/ext-nba`](https://www.npmjs.com/package/@dashfy/ext-nba) - NBA extension

## License

MIT © [Breno Polanski](https://github.com/brenopolanski)

---

Part of the [Dashfy](https://github.com/dashfy/dashfy) project.
