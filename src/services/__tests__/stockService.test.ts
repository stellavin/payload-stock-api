import { convertDate } from '@/utils/validators'
import axios from 'axios'
import { StockService } from '../stockService'

// Mock dependencies
jest.mock('axios')
jest.mock('@/utils/validators')
jest.mock('process', () => ({
  env: {
    RAPID_API_URL: 'https://api.example.com/stock',
    RAPID_API_KEY: 'test-api-key',
    API_HOST: 'test-api-host',
  },
}))

describe('StockService', () => {
  let stockService: StockService
  const mockAxios = axios as jest.Mocked<typeof axios>
  const mockConvertDate = convertDate as jest.MockedFunction<typeof convertDate>

  beforeEach(() => {
    stockService = new StockService()
    jest.clearAllMocks()

    // Setup default mock for convertDate
    mockConvertDate.mockImplementation((date) => date)
  })

  describe('calculateDateRange', () => {
    const testCases = [
      {
        startDate: '2024-01-01',
        endDate: '2024-01-15',
        expected: '1mo',
        description: 'should return 1mo for <= 30 days',
      },
      {
        startDate: '2024-01-01',
        endDate: '2024-03-15',
        expected: '3mo',
        description: 'should return 3mo for <= 90 days',
      },
      {
        startDate: '2024-01-01',
        endDate: '2024-06-15',
        expected: '6mo',
        description: 'should return 6mo for <= 180 days',
      },
      {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        expected: '1y',
        description: 'should return 1y for <= 365 days',
      },
      {
        startDate: '2024-01-01',
        endDate: '2026-01-01',
        expected: '5y',
        description: 'should return 5y for > 365 days',
      },
    ]

    testCases.forEach(({ startDate, endDate, expected, description }) => {
      it(description, () => {
        const result = (stockService as any).calculateDateRange(startDate, endDate)
        expect(result).toBe(expected)
      })
    })
  })

  describe('transformStockData', () => {
    it('should transform raw stock data correctly', () => {
      const mockRawData = {
        chart: {
          result: [
            {
              timestamp: [1640995200, 1641081600],
              indicators: {
                quote: [
                  {
                    open: [150.0, 155.0],
                    high: [152.0, 157.0],
                    low: [149.0, 154.0],
                    close: [151.0, 156.0],
                    volume: [1000000, 1100000],
                  },
                ],
              },
            },
          ],
        },
      }

      const expected = [
        {
          date: '2022-01-01',
          open: 150.0,
          high: 152.0,
          low: 149.0,
          close: 151.0,
          volume: 1000000,
        },
        {
          date: '2022-01-02',
          open: 155.0,
          high: 157.0,
          low: 154.0,
          close: 156.0,
          volume: 1100000,
        },
      ]

      const result = (stockService as any).transformStockData(mockRawData)
      expect(result).toEqual(expected)
    })

    it('should handle missing or null values in raw data', () => {
      const mockRawData = {
        chart: {
          result: [
            {
              timestamp: [1640995200],
              indicators: {
                quote: [
                  {
                    open: [null],
                    high: [undefined],
                    low: [150.0],
                    close: [151.0],
                    volume: [1000000],
                  },
                ],
              },
            },
          ],
        },
      }

      const result = (stockService as any).transformStockData(mockRawData)
      expect(result[0]).toEqual({
        date: '2022-01-01',
        open: null,
        high: undefined,
        low: 150.0,
        close: 151.0,
        volume: 1000000,
      })
    })
  })

  describe('getHistoricalData', () => {
    const mockParams = {
      symbol: 'AAPL',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    }

    const mockApiResponse = {
      data: {
        chart: {
          result: [
            {
              timestamp: [1640995200],
              indicators: {
                quote: [
                  {
                    open: [150.0],
                    high: [152.0],
                    low: [149.0],
                    close: [151.0],
                    volume: [1000000],
                  },
                ],
              },
            },
          ],
        },
      },
    }

    beforeEach(() => {
      mockAxios.get.mockResolvedValue(mockApiResponse)
    })

    it('should fetch historical data successfully', async () => {
      const result = await stockService.getHistoricalData(
        mockParams.symbol,
        mockParams.startDate,
        mockParams.endDate,
      )

      expect(mockAxios.get).toHaveBeenCalledWith(process.env.RAPID_API_URL, {
        params: {
          interval: '1d',
          symbol: mockParams.symbol,
          range: '1mo',
          region: 'US',
          includePrePost: false,
          useYfid: true,
          includeAdjustedClose: true,
        },
        headers: {
          'X-RapidAPI-Key': process.env.RAPID_API_KEY,
          'X-RapidAPI-Host': process.env.API_HOST,
        },
      })

      expect(result).toEqual([
        {
          date: '2022-01-01',
          open: 150.0,
          high: 152.0,
          low: 149.0,
          close: 151.0,
          volume: 1000000,
        },
      ])
    })

    it('should throw error when API URL is not defined', async () => {
      jest.spyOn(process, 'env', 'get').mockReturnValue({
        NODE_ENV: 'development',
      })

      await expect(
        stockService.getHistoricalData(mockParams.symbol, mockParams.startDate, mockParams.endDate),
      ).rejects.toThrow('RAPID_API_URL environment variable is not defined')
    })

    it('should handle API errors', async () => {
      const error = new Error('API Error')
      mockAxios.get.mockRejectedValue(error)

      await expect(
        stockService.getHistoricalData(mockParams.symbol, mockParams.startDate, mockParams.endDate),
      ).rejects.toThrow('API Error')
    })

    it('should use converted dates from validator', async () => {
      mockConvertDate
        .mockReturnValueOnce('2024-01-01T00:00:00Z')
        .mockReturnValueOnce('2024-01-31T00:00:00Z')

      await stockService.getHistoricalData(
        mockParams.symbol,
        mockParams.startDate,
        mockParams.endDate,
      )

      expect(mockConvertDate).toHaveBeenCalledWith(mockParams.startDate)
      expect(mockConvertDate).toHaveBeenCalledWith(mockParams.endDate)
    })
  })
})
