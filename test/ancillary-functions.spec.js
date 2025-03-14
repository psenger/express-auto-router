// utils.test.js
const {
  isMiddlewareFile,
  autoBox,
  replaceUrlPlaceholders,
  isPlaceholder,
  validatePath,
  dictionaryKeyStartsWithPath
} = require('../dist/index')

describe('isMiddlewareFile', () => {
  it('should return true for _middleware.js file entry', () => {
    const entry = { isFile: () => true, name: '_middleware.js' }
    expect(isMiddlewareFile(entry)).toBe(true)
  })

  it('should return false for directory entry', () => {
    const entry = { isFile: () => false, name: '_middleware.js' }
    expect(isMiddlewareFile(entry)).toBe(false)
  })

  it('should return false for non-middleware file', () => {
    const entry = { isFile: () => true, name: 'index.js' }
    expect(isMiddlewareFile(entry)).toBe(false)
  })
})

describe('autoBox', () => {
  it('should wrap non-array value in an array', () => {
    expect(autoBox(5)).toEqual([5])
  })

  it('should return the same array if input is already an array', () => {
    const arr = [1, 2, 3]
    expect(autoBox(arr)).toBe(arr)
  })

  it('should wrap null in an array', () => {
    expect(autoBox(null)).toEqual([null])
  })

  it('should wrap undefined in an array', () => {
    expect(autoBox(undefined)).toEqual([undefined])
  })

  it('should wrap object in an array', () => {
    const obj = { key: 'value' }
    expect(autoBox(obj)).toEqual([obj])
  })
})

describe('replaceUrlPlaceholders', () => {
  it('should replace single placeholder', () => {
    expect(replaceUrlPlaceholders('/users/[id]')).toBe('/users/:id')
  })

  it('should replace multiple placeholders', () => {
    expect(replaceUrlPlaceholders('/users/[id]/posts/[postId]'))
      .toBe('/users/:id/posts/:postId')
  })

  it('should return path without changes if no placeholders', () => {
    expect(replaceUrlPlaceholders('/users/list')).toBe('/users/list')
  })

  it('should handle complex nested placeholders', () => {
    expect(replaceUrlPlaceholders('/products/[category]/[id]/reviews/[reviewId]'))
      .toBe('/products/:category/:id/reviews/:reviewId')
  })
})

describe('isPlaceholder', () => {
  it('should return true for path with placeholder', () => {
    expect(isPlaceholder('/users/[id]')).toBe(true)
  })

  it('should return true for path with multiple placeholders', () => {
    expect(isPlaceholder('/users/[id]/posts/[postId]')).toBe(true)
  })

  it('should return false for path without placeholders', () => {
    expect(isPlaceholder('/users/list')).toBe(false)
  })

  it('should return true for path with square brackets', () => {
    expect(isPlaceholder('/users/list[all]')).toBe(true)
  })
})

describe('validatePath', () => {
  it('should not throw for valid path', () => {
    expect(() => validatePath('/api/users')).not.toThrow()
  })

  it('should throw for empty string', () => {
    expect(() => validatePath('')).toThrow('Invalid path provided')
  })

  it('should throw for null', () => {
    expect(() => validatePath(null)).toThrow('Invalid path provided')
  })

  it('should throw for non-string value', () => {
    expect(() => validatePath(123)).toThrow('Invalid path provided')
  })
})

describe('dictionaryKeyStartsWithPath', () => {
  const authMiddleware = () => {
  }
  const userMiddleware = () => {
  }
  const logMiddleware = () => {
  }

  it('should return middleware for matching paths', () => {
    const dict = {
      '/api/': [authMiddleware],
      '/api/users/': [userMiddleware]
    }
    const result = dictionaryKeyStartsWithPath(dict, '/api/users/profile')
    expect(result).toEqual([authMiddleware, userMiddleware])
  })

  it('should return empty array for no matching paths', () => {
    const dict = {
      '/api/': [authMiddleware],
      '/api/users/': [userMiddleware]
    }
    const result = dictionaryKeyStartsWithPath(dict, '/admin/')
    expect(result).toEqual([])
  })

  it('should handle mixed array and single function values', () => {
    const dict = {
      '/api/': [authMiddleware, logMiddleware],
      '/api/users/': userMiddleware
    }
    const result = dictionaryKeyStartsWithPath(dict, '/api/users/')
    expect(result).toEqual([authMiddleware, logMiddleware, userMiddleware])
  })

  it('should filter out null and undefined values', () => {
    const dict = {
      '/api/': [authMiddleware, null],
      '/api/users/': undefined
    }
    const result = dictionaryKeyStartsWithPath(dict, '/api/users/')
    expect(result).toEqual([authMiddleware])
  })
  it('should autobox the middleware', () => {
    const dict = {
      '/api/': authMiddleware
    }
    const result = dictionaryKeyStartsWithPath(dict, '/api/')
    expect(result).toEqual([authMiddleware])
  })
})
