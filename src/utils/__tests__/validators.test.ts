import axios from 'axios'
import {
  isValidEmail,
  isValidDate,
  convertDate,
  isValidSymbol,
  getCompanyName,
} from '../validators'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('Utility Functions', () => {
  // Email Validation Tests
  describe('isValidEmail', () => {
    test('should return true for valid email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(isValidEmail('user+label@domain.com')).toBe(true)
    })

    test('should return false for invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('user@')).toBe(false)
      expect(isValidEmail('user@domain')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })

  // Date Validation Tests
  describe('isValidDate', () => {
    test('should return true for valid dates', () => {
      expect(isValidDate('2024-01-01')).toBe(true)
      expect(isValidDate('2023-12-31')).toBe(true)
      expect(isValidDate('2024-02-29')).toBe(true) // Leap year
    })

    test('should return false for invalid dates', () => {
      expect(isValidDate('2023-13-01')).toBe(false) // Invalid month
      expect(isValidDate('2023-04-31')).toBe(false) // Invalid day
      expect(isValidDate('2023/04/15')).toBe(false) // Wrong format
      expect(isValidDate('')).toBe(false)
      expect(isValidDate('invalid-date')).toBe(false)
    })
  })

  // Date Conversion Tests
  describe('convertDate', () => {
    test('should convert various date formats to YYYY-MM-DD', () => {
      expect(convertDate('2024-01-15')).toBe('2024-01-15')
      expect(convertDate('01/15/2024')).toBe('2024-01-15')
      expect(convertDate('2024/01/15')).toBe('2024-01-15')
    })

    test('should handle edge cases', () => {
      const today = new Date().toISOString().split('T')[0]
      expect(convertDate('invalid-date')).toBe(today) // Invalid dates return today's date
    })
  })

  // Stock Symbol Validation Tests
  describe('isValidSymbol', () => {
    beforeEach(() => {
      process.env.NASDAQ_API = 'https://api.nasdaq.com/api/symbols'
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    test('should return true for valid symbols', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [
          { Symbol: 'AAPL', 'Company Name': 'Apple Inc.' },
          { Symbol: 'GOOGL', 'Company Name': 'Alphabet Inc.' },
        ],
      })

      const result = await isValidSymbol('AAPL')
      expect(result).toBe(true)
      expect(mockedAxios.get).toHaveBeenCalledWith(process.env.NASDAQ_API)
    })

    test('should return false for invalid symbols', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [{ Symbol: 'AAPL', 'Company Name': 'Apple Inc.' }],
      })

      const result = await isValidSymbol('INVALID')
      expect(result).toBe(false)
    })

    test('should handle API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'))

      const result = await isValidSymbol('AAPL')
      expect(result).toBe(false)
    })

    test('should handle missing API URL', async () => {
      process.env.NASDAQ_API = undefined

      const result = await isValidSymbol('AAPL')
      expect(result).toBe(false)
    })
  })

  // Company Name Tests
  describe('getCompanyName', () => {
    beforeEach(() => {
      process.env.NASDAQ_API = 'https://api.nasdaq.com/api/symbols'
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    test('should return company name for valid symbol', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [{ Symbol: 'AAPL', 'Company Name': 'Apple Inc.' }],
      })

      const result = await getCompanyName('AAPL')
      expect(result).toBe('Apple Inc.')
    })

    test('should return symbol when company not found', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [{ Symbol: 'AAPL', 'Company Name': 'Apple Inc.' }],
      })

      const result = await getCompanyName('INVALID')
      expect(result).toBe('INVALID')
    })

    test('should handle API errors by returning symbol', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'))

      const result = await getCompanyName('AAPL')
      expect(result).toBe('AAPL')
    })

    test('should handle missing API URL', async () => {
      process.env.NASDAQ_API = undefined

      const result = await getCompanyName('AAPL')
      expect(result).toBe('AAPL')
    })
  })
})
