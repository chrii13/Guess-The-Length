import fs from 'fs'
import path from 'path'

const root = process.cwd()

describe('PWA configuration', () => {
  test('provides a valid web app manifest for installability', () => {
    const manifestPath = path.join(root, 'public', 'manifest.webmanifest')

    expect(fs.existsSync(manifestPath)).toBe(true)

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

    expect(manifest.name).toBe('Guess the Length')
    expect(manifest.short_name).toBe('Guess Length')
    expect(manifest.start_url).toBe('/')
    expect(manifest.scope).toBe('/')
    expect(manifest.display).toBe('standalone')
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: '/assets/icon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any maskable',
        }),
      ])
    )
  })

  test('registers a same-origin service worker from the app shell', () => {
    const registrationPath = path.join(root, 'components', 'PWARegister.tsx')
    const layoutPath = path.join(root, 'app', 'layout.tsx')

    expect(fs.existsSync(registrationPath)).toBe(true)

    const registration = fs.readFileSync(registrationPath, 'utf8')
    const layout = fs.readFileSync(layoutPath, 'utf8')

    expect(registration).toContain("'serviceWorker' in navigator")
    expect(registration).toContain("navigator.serviceWorker.register('/sw.js')")
    expect(layout).toContain('<PWARegister />')
  })

  test('service worker caches the static app shell without caching Supabase API calls', () => {
    const swPath = path.join(root, 'public', 'sw.js')

    expect(fs.existsSync(swPath)).toBe(true)

    const sw = fs.readFileSync(swPath, 'utf8')

    expect(sw).toContain("const STATIC_CACHE = 'guess-the-length-static-v3'")
    expect(sw).toContain("'/manifest.webmanifest'")
    expect(sw).toContain("event.request.method !== 'GET'")
    expect(sw).toContain("url.hostname.includes('supabase.co')")
  })

  test('service worker refreshes navigations from the network before using cache', () => {
    const sw = fs.readFileSync(path.join(root, 'public', 'sw.js'), 'utf8')

    expect(sw).toContain("event.request.mode === 'navigate'")
    expect(sw).toContain('fetch(event.request)')
    expect(sw).toContain("caches.match('/')")
  })

  test('Next metadata exposes mobile PWA tags', () => {
    const layout = fs.readFileSync(path.join(root, 'app', 'layout.tsx'), 'utf8')

    expect(layout).toContain("manifest: '/manifest.webmanifest'")
    expect(layout).toContain('appleWebApp')
    expect(layout).toContain('themeColor')
  })

  test('provides a local network dev script for phone testing', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(root, 'package.json'), 'utf8')
    )

    expect(packageJson.scripts['dev:host']).toBe('next dev -H 0.0.0.0')
  })

  test('client-safe sanitization does not load DOMPurify at module top level', () => {
    const sanitizeSource = fs.readFileSync(path.join(root, 'lib', 'sanitize.ts'), 'utf8')

    expect(sanitizeSource).not.toMatch(/^import DOMPurify from 'isomorphic-dompurify'/m)
    expect(sanitizeSource).toContain("require('isomorphic-dompurify')")
  })
})
