#!/usr/bin/env node
const { spawn } = require('child_process')
const path = require('path')
const port = process.env.PORT || '5175'
const viteBin = path.join(__dirname, 'node_modules', 'vite', 'bin', 'vite.js')
const child = spawn(process.execPath, [viteBin, '--port', port, '--strictPort'], { cwd: __dirname, stdio: 'inherit' })
child.on('exit', code => process.exit(code ?? 0))
