import { convertToCsv } from '../csvHelper'

describe('convertToCsv', () => {
  test('should convert simple data array to CSV format', () => {
    const testData = [
      {
        date: '2024-01-01',
        open: 150.0,
        high: 155.0,
        low: 149.0,
        close: 153.0,
        volume: 1000000,
      },
    ]

    const expected = 'Date,Open,High,Low,Close,Volume\n' + '2024-01-01,150,155,149,153,1000000'

    expect(convertToCsv(testData)).toBe(expected)
  })

  test('should handle multiple rows of data', () => {
    const testData = [
      {
        date: '2024-01-01',
        open: 150.0,
        high: 155.0,
        low: 149.0,
        close: 153.0,
        volume: 1000000,
      },
      {
        date: '2024-01-02',
        open: 153.0,
        high: 158.0,
        low: 152.0,
        close: 157.0,
        volume: 1200000,
      },
    ]

    const expected =
      'Date,Open,High,Low,Close,Volume\n' +
      '2024-01-01,150,155,149,153,1000000\n' +
      '2024-01-02,153,158,152,157,1200000'

    expect(convertToCsv(testData)).toBe(expected)
  })

  test('should handle missing data points as empty values', () => {
    const testData = [
      {
        date: '2024-01-01',
        open: 150.0,
        // high is missing
        low: 149.0,
        close: 153.0,
        volume: 1000000,
      },
    ]

    const expected = 'Date,Open,High,Low,Close,Volume\n' + '2024-01-01,150,,149,153,1000000'

    expect(convertToCsv(testData)).toBe(expected)
  })

  test('should handle empty array input', () => {
    const testData: any[] = []
    const expected = 'Date,Open,High,Low,Close,Volume'

    expect(convertToCsv(testData)).toBe(expected)
  })

  test('should handle data with additional fields', () => {
    const testData = [
      {
        date: '2024-01-01',
        open: 150.0,
        high: 155.0,
        low: 149.0,
        close: 153.0,
        volume: 1000000,
        extraField: 'ignored',
      },
    ]

    const expected = 'Date,Open,High,Low,Close,Volume\n' + '2024-01-01,150,155,149,153,1000000'

    expect(convertToCsv(testData)).toBe(expected)
  })

  test('should handle zero values correctly', () => {
    const testData = [
      {
        date: '2024-01-01',
        open: 0,
        high: 0,
        low: 0,
        close: 0,
        volume: 0,
      },
    ]

    const expected = 'Date,Open,High,Low,Close,Volume\n' + '2024-01-01,0,0,0,0,0'

    expect(convertToCsv(testData)).toBe(expected)
  })

  test('should handle different data types correctly', () => {
    const testData = [
      {
        date: '2024-01-01',
        open: '150.00', // string
        high: 155, // number
        low: '149', // string
        close: 153.0, // number
        volume: 1e6, // scientific notation
      },
    ]

    const expected = 'Date,Open,High,Low,Close,Volume\n' + '2024-01-01,150.00,155,149,153,1000000'

    expect(convertToCsv(testData)).toBe(expected)
  })
})
