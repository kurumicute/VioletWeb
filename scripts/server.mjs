import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const windowsGo = 'C:/Program Files/Go/bin/go.exe'
const go = process.platform === 'win32' && existsSync(windowsGo) ? windowsGo : 'go'
const args = process.argv.slice(2)
const child = spawn(go, args.length ? args : ['run', '.'], {
  cwd: resolve(root, 'server'),
  stdio: 'inherit',
  env: {
    ...process.env,
    GOCACHE: resolve(root, '.cache/go-build'),
    GOMODCACHE: resolve(root, '.cache/go-mod'),
  },
})
child.on('error', () => {
  console.error('找不到 Go。請安裝 Go 1.24 以上，並重新開啟終端。')
  process.exitCode = 1
})
child.on('exit', (code) => {
  process.exitCode = code ?? 1
})
process.on('SIGINT', () => child.kill('SIGINT'))
