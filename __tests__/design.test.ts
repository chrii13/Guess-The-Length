import fs from 'fs'
import path from 'path'

const root = process.cwd()

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(dir, entry.name)
    if (entry.isDirectory()) return sourceFiles(relative)
    return /\.tsx?$/.test(entry.name) ? [relative] : []
  })
}

const files = ['app', 'components', 'hooks'].flatMap(sourceFiles)
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8')

describe('visual system', () => {
  test.each(files)('%s uses only the new design tokens', (file) => {
    const source = read(file)

    expect(source).not.toContain('primary-')
    expect(source).not.toContain('imageVersion')
    expect(source.replace(/\/assets\/icon\.svg/g, '')).not.toContain('/assets/')
  })

  test('global styles respect reduced motion and carry no override hacks', () => {
    const css = read(path.join('app', 'globals.css'))

    expect(css).toContain('prefers-reduced-motion')
    expect(css).not.toContain('!important')
  })

  test('only the new app icon is left in public assets', () => {
    expect(fs.readdirSync(path.join(root, 'public', 'assets'))).toEqual(['icon.svg'])
  })
})
