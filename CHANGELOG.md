# @getdashfy/ext-system

## 0.1.0

### Initial Release

First public release of the Dashfy System extension — widgets and a server-only client for monitoring the machine running the Dashfy server, backed by [systeminformation](https://github.com/sebhildebrandt/systeminformation).

- **System client** (`createSystemClient`) with configurable `processLimit` and `pushInterval`, registered in push mode so each endpoint runs its own interval.
- **Seven endpoints**: `systemInfo`, `cpuUsage`, `memoryUsage`, `diskUsage`, `networkStats`, `processes`, and `battery`.
- **CPU widgets**: `CpuUsage`, `CpuUsageGauge`, `CpuUsageLine`.
- **Memory widgets**: `MemoryUsage`, `MemoryUsageGauge`, `MemoryUsageLine`.
- **Disk widgets**: `DiskUsage`, `DiskUsageGauge`.
- **Network widgets**: `NetworkStats`, `NetworkStatsCompact`, `NetworkStatsLine`.
- **Process and info widgets**: `Processes`, `SystemInfo`.
- Separate `./client` entry point so the Node-only `systeminformation` dependency never reaches the browser bundle.
- Real-time updates via WebSocket subscriptions and full Dashfy theme (light/dark) support.
