// Start the Next.js standalone production server — layout-aware and
// Render-safe.
//
// - Finds server.js whether Next emitted it at .next/standalone/server.js
//   (flat) or .next/standalone/<project-dir>/server.js (nested workspace).
// - Forces HOSTNAME=0.0.0.0: Render sets HOSTNAME to the container hostname,
//   and the standalone server binds process.env.HOSTNAME — binding 0.0.0.0
//   guarantees Render's port detector can always reach the app.
// - Port comes from Render's PORT env var (Next reads process.env.PORT,
//   defaulting to 3000 locally).
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const standaloneDir = path.resolve('.next', 'standalone')

function fail(msg) {
  console.error('[start] ' + msg)
  process.exit(1)
}

if (!fs.existsSync(standaloneDir)) {
  fail('.next/standalone not found — run `npm run build` first.')
}

// Locate server.js — flat layout first, then one directory deep.
let serverPath = path.join(standaloneDir, 'server.js')
if (!fs.existsSync(serverPath)) {
  for (const entry of fs.readdirSync(standaloneDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === 'node_modules') continue
    const candidate = path.join(standaloneDir, entry.name, 'server.js')
    if (fs.existsSync(candidate)) {
      serverPath = candidate
      break
    }
  }
}
if (!fs.existsSync(serverPath)) {
  fail('server.js not found in .next/standalone (searched flat and nested layouts).')
}

console.log('[start] launching ' + path.relative(process.cwd(), serverPath) + ' on 0.0.0.0:' + (process.env.PORT || 3000))

const child = spawn(process.execPath, [serverPath], {
  cwd: path.dirname(serverPath),
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    HOSTNAME: '0.0.0.0',
  },
})

child.on('error', (err) => {
  console.error('[start] failed to launch server:', err)
  process.exit(1)
})

child.on('exit', (code, signal) => {
  if (signal) {
    console.error('[start] server terminated by signal ' + signal)
    process.exit(1)
  }
  process.exit(code ?? 0)
})
