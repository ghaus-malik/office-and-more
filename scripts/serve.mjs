// Zero-dependency static server for the built demo (offline backup).
// Usage: npm run serve   →  http://localhost:4173
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'dist')
const port = Number(process.env.PORT || 4173)
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.pdf': 'application/pdf', '.woff2': 'font/woff2', '.json': 'application/json', '.ico': 'image/x-icon' }

createServer(async (req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0])
  let file = normalize(join(root, url))
  if (!file.startsWith(root)) return res.writeHead(403).end()
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html')
  } catch {
    file = join(root, 'index.html') // SPA fallback
  }
  try {
    const body = await readFile(file)
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' })
    res.end(body)
  } catch {
    res.writeHead(404).end('Not found')
  }
}).listen(port, () => console.log(`Office & More demo → http://localhost:${port}`))
