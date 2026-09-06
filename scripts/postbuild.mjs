// Post-build: stage static assets next to the Next.js standalone server.
//
// Why: Next.js 16 (Turbopack, output: "standalone") emits the server at
//   .next/standalone/server.js                 (project at workspace root)
// or
//   .next/standalone/<project-dir>/server.js   (nested inside a workspace)
// depending on where the repo was cloned. The old hardcoded `cp` chain only
// handled the flat layout. This script finds server.js in either layout and
// copies .next/static and public/ next to it, so `npm start` works everywhere
// (local sandbox, Render, Docker, any clone path).
import fs from 'node:fs'
import path from 'node:path'

const standaloneDir = path.resolve('.next', 'standalone')

function fail(msg) {
  console.error('[postbuild] ' + msg)
  process.exit(1)
}

if (!fs.existsSync(standaloneDir)) {
  fail('.next/standalone not found — build with `next build` (output: "standalone"), not the static export.')
}

// Locate server.js — flat layout first, then one directory deep (skip node_modules).
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

const serverDir = path.dirname(serverPath)

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return false
  fs.cpSync(src, dest, { recursive: true })
  return true
}

// 1. .next/static  ->  <serverDir>/.next/static   (client JS/CSS chunks)
const stagedStatic = copyDir(
  path.resolve('.next', 'static'),
  path.join(serverDir, '.next', 'static')
)

// 2. public/  ->  <serverDir>/public             (product images, products.json, etc.)
const stagedPublic = copyDir(path.resolve('public'), path.join(serverDir, 'public'))

console.log('[postbuild] standalone server: ' + path.relative(process.cwd(), serverPath))
console.log('[postbuild] static assets:    ' + (stagedStatic ? 'staged' : 'missing (skipped)'))
console.log('[postbuild] public assets:    ' + (stagedPublic ? 'staged' : 'missing (skipped)'))
