const { autoBox } = require('../../src/index.js')

describe('autoBox', () => {
  test('wraps non-array values in an array', () => {
    expect(autoBox(5)).toEqual([5])
    expect(autoBox('hello')).toEqual(['hello'])
    expect(autoBox(null)).toEqual([null])
    expect(autoBox(undefined)).toEqual([undefined])
    expect(autoBox({})).toEqual([{}])
  })

  test('returns arrays unchanged', () => {
    expect(autoBox([1, 2, 3])).toEqual([1, 2, 3])
    expect(autoBox([])).toEqual([])
    expect(autoBox(['a', 'b'])).toEqual(['a', 'b'])
  })

  test('handles complex objects', () => {
    const obj = { a: 1, b: 2 }
    expect(autoBox(obj)).toEqual([obj])
    
    const func = () => 'test'
    expect(autoBox(func)).toEqual([func])
  })
})