const { replaceUrlPlaceholders, isPlaceholder, validatePath, parseDirectoryPriority, joinUrlPaths } = require('../../src/index.js')

describe('replaceUrlPlaceholders', () => {
  test('replaces placeholder brackets with colons', () => {
    expect(replaceUrlPlaceholders('/users/[userId]')).toBe('/users/:userId')
    expect(replaceUrlPlaceholders('/posts/[postId]/comments/[commentId]')).toBe('/posts/:postId/comments/:commentId')
  })

  test('handles paths without placeholders', () => {
    expect(replaceUrlPlaceholders('/users')).toBe('/users')
    expect(replaceUrlPlaceholders('/static/path')).toBe('/static/path')
  })

  test('handles empty or root paths', () => {
    expect(replaceUrlPlaceholders('')).toBe('')
    expect(replaceUrlPlaceholders('/')).toBe('/')
  })
})

describe('isPlaceholder', () => {
  test('identifies placeholder patterns', () => {
    expect(isPlaceholder('[userId]')).toBe(true)
    expect(isPlaceholder('[postId]')).toBe(true)
    expect(isPlaceholder('[123]')).toBe(true)
  })

  test('rejects non-placeholder patterns', () => {
    expect(isPlaceholder('userId')).toBe(false)
    expect(isPlaceholder('users')).toBe(false)
    expect(isPlaceholder('[userId')).toBe(false)
    expect(isPlaceholder('userId]')).toBe(false)
    expect(isPlaceholder('[]')).toBe(false)
  })
})

describe('validatePath', () => {
  test('validates non-empty string paths', () => {
    expect(() => validatePath('/valid/path')).not.toThrow()
    expect(() => validatePath('/another/valid/path')).not.toThrow()
    expect(() => validatePath('relative/path')).not.toThrow()
  })

  test('throws error for invalid paths', () => {
    expect(() => validatePath('')).toThrow('Invalid path provided')
    expect(() => validatePath(null)).toThrow('Invalid path provided')
    expect(() => validatePath(undefined)).toThrow('Invalid path provided')
    expect(() => validatePath(123)).toThrow('Invalid path provided')
    expect(() => validatePath(false)).toThrow('Invalid path provided')
  })

  test('accepts non-empty string paths', () => {
    expect(() => validatePath('relative/path')).not.toThrow()
    expect(() => validatePath('./relative')).not.toThrow()
    expect(() => validatePath('../relative')).not.toThrow()
  })
})

describe('parseDirectoryPriority', () => {
  test('extracts priority from directory names with 2-digit prefix', () => {
    expect(parseDirectoryPriority('01-users')).toEqual({ priority: 1, name: 'users', hasPrefix: true, isDynamic: false })
    expect(parseDirectoryPriority('10-posts')).toEqual({ priority: 10, name: 'posts', hasPrefix: true, isDynamic: false })
    expect(parseDirectoryPriority('99-admin')).toEqual({ priority: 99, name: 'admin', hasPrefix: true, isDynamic: false })
  })

  test('handles directories without priority', () => {
    expect(parseDirectoryPriority('users')).toEqual({ priority: 50, name: 'users', hasPrefix: false, isDynamic: false })
    expect(parseDirectoryPriority('posts')).toEqual({ priority: 50, name: 'posts', hasPrefix: false, isDynamic: false })
  })

  test('handles dynamic routes', () => {
    expect(parseDirectoryPriority('[userId]')).toEqual({ priority: 50, name: '[userId]', hasPrefix: false, isDynamic: true })
    expect(parseDirectoryPriority('05-[postId]')).toEqual({ priority: 5, name: '[postId]', hasPrefix: true, isDynamic: true })
  })

  test('handles edge cases', () => {
    expect(parseDirectoryPriority('00-test')).toEqual({ priority: 0, name: 'test', hasPrefix: true, isDynamic: false })
    expect(parseDirectoryPriority('1-short')).toEqual({ priority: 50, name: '1-short', hasPrefix: false, isDynamic: false })
    expect(parseDirectoryPriority('12-short')).toEqual({ priority: 12, name: 'short', hasPrefix: true, isDynamic: false })
  })

  test('falls back to default priority for invalid priority prefix', () => {
    // Test out of range priorities (should fall back to default)
    expect(parseDirectoryPriority('100-invalid')).toEqual({ 
      priority: 50, 
      name: '100-invalid', 
      hasPrefix: false, 
      isDynamic: false 
    })
    
    expect(parseDirectoryPriority('-01-invalid')).toEqual({ 
      priority: 50, 
      name: '-01-invalid', 
      hasPrefix: false, 
      isDynamic: false 
    })
  })
})

describe('joinUrlPaths', () => {
  test('joins base path with segment correctly', () => {
    expect(joinUrlPaths('/api', 'users')).toBe('/api/users')
    expect(joinUrlPaths('/api', '/users')).toBe('/api/users')
    expect(joinUrlPaths('/api/', 'users')).toBe('/api/users')
    expect(joinUrlPaths('/api/', '/users')).toBe('/api/users')
  })

  test('handles empty segments', () => {
    expect(joinUrlPaths('/api', '')).toBe('/api/')
    expect(joinUrlPaths('/api/', '')).toBe('/api/')
  })

  test('handles root path', () => {
    expect(joinUrlPaths('', 'users')).toBe('/users')
    expect(joinUrlPaths('', '/users')).toBe('/users')
    expect(joinUrlPaths('/', 'users')).toBe('/users')
    expect(joinUrlPaths('/', '/users')).toBe('/users')
  })

  test('handles complex paths', () => {
    expect(joinUrlPaths('/api/v1', 'users/profile')).toBe('/api/v1/users/profile')
    expect(joinUrlPaths('/api/v1/', '/users/profile')).toBe('/api/v1/users/profile')
  })
})