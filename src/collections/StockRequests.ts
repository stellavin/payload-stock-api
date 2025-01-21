import { CollectionConfig, Payload } from 'payload'
import { isValidEmail, isValidDate, isValidSymbol, convertDate } from '@/utils/validators'
import { StockService } from '@/services/stockService'
import { convertToCsv } from '@/utils/csvHelper'
import { EmailService } from '@/services/emailService'
import { StockRequest } from '@/payload-types'

/**
 * Collection configuration for handling stock requests.
 *
 * This configuration defines fields for stock request data, hooks for processing requests,
 * and integrates with external services to fetch stock data and send reports.
 */
export const StockRequests: CollectionConfig = {
  slug: 'stock-requests', // Identifier for the collection
  admin: {
    useAsTitle: 'companySymbol', // Display field in admin UI
  },
  hooks: {
    afterChange: [
      /**
       * Hook executed after a document change.
       *
       * Handles stock requests by fetching historical data and sending it via email.
       *
       * @param doc - The updated document
       * @param req - Payload request object
       * @param operation - Operation performed (e.g., "create")
       */
      async ({ doc, req, operation }) => {
        if (operation === 'create') {
          const stockRequest = doc as StockRequest
          try {
            const stockService = new StockService()
            const emailService = new EmailService()

            // Fetch historical stock data and send report
            const stockData = await stockService.getHistoricalData(
              stockRequest.companySymbol,
              convertDate(stockRequest.startDate),
              convertDate(stockRequest.endDate),
            )

            const csvData = convertToCsv(stockData)

            await emailService.sendStockReport(
              stockRequest.email,
              stockRequest.companySymbol,
              convertDate(stockRequest.startDate),
              convertDate(stockRequest.endDate),
              csvData,
            )
          } catch (error) {
            throw error
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'companySymbol',
      type: 'text',
      required: true,
      /**
       * Validates the company symbol field.
       *
       * @param value - The input value for the company symbol
       * @returns A promise resolving to `true` if valid or an error message
       */
      validate: async (value: string | null | undefined): Promise<string | true> => {
        if (typeof value !== 'string' || !value) return 'Invalid company symbol'
        const isValid = await isValidSymbol(value)
        if (!isValid) return 'Invalid company symbol'
        return true
      },
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      /**
       * Validates the start date field.
       *
       * Ensures the date is in the correct format, is not in the future, and is before the end date.
       *
       * @param value - The input value for the start date
       * @param data - Related data, including `endDate`
       * @returns A promise resolving to `true` if valid or an error message
       */
      validate: async (
        value: string | Date | null | undefined,
        { data }: { data: { endDate?: string | Date | null | undefined } },
      ): Promise<string | true> => {
        if (!value) return 'Start Date is required'

        const startDate = typeof value === 'string' ? new Date(value) : value

        if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
          return 'Invalid Start Date format. Expected format: YYYY-MM-DD'
        }

        const startDateOnly = new Date(startDate.toISOString().split('T')[0])
        const today = new Date(new Date().toISOString().split('T')[0])

        if (startDateOnly > today) {
          return 'Start Date cannot be in the future'
        }

        if (data.endDate) {
          const endDate = typeof data.endDate === 'string' ? new Date(data.endDate) : data.endDate

          if (endDate instanceof Date && !isNaN(endDate.getTime())) {
            const endDateOnly = new Date(endDate.toISOString().split('T')[0])
            if (startDateOnly > endDateOnly) {
              return 'Start Date must be before or equal to End Date'
            }
          }
        }

        return true
      },
    },
    {
      name: 'endDate',
      type: 'date',
      required: true,
      /**
       * Validates the end date field.
       *
       * Ensures the date is in the correct format, is not in the future, and is after the start date.
       *
       * @param value - The input value for the end date
       * @param data - Related data, including `startDate`
       * @returns A promise resolving to `true` if valid or an error message
       */
      validate: async (
        value: string | Date | null | undefined,
        { data }: { data: { startDate?: string | Date | null | undefined } },
      ): Promise<string | true> => {
        if (!value) return 'End Date is required'

        const endDate = typeof value === 'string' ? new Date(value) : value

        if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
          return 'Invalid End Date format. Expected format: YYYY-MM-DD'
        }

        const endDateOnly = new Date(endDate.toISOString().split('T')[0])
        const today = new Date(new Date().toISOString().split('T')[0])

        if (endDateOnly > today) {
          return 'End Date cannot be in the future'
        }

        if (data.startDate) {
          const startDate =
            typeof data.startDate === 'string' ? new Date(data.startDate) : data.startDate

          if (startDate instanceof Date && !isNaN(startDate.getTime())) {
            const startDateOnly = new Date(startDate.toISOString().split('T')[0])
            if (endDateOnly < startDateOnly) {
              return 'End Date must be after or equal to Start Date'
            }
          }
        }

        return true
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      /**
       * Validates the email field.
       *
       * Ensures the email is in a valid format.
       *
       * @param value - The input value for the email
       * @returns `true` if valid or an error message
       */
      validate: (value: string | null | undefined): string | true => {
        if (typeof value !== 'string' || !value) return 'Invalid email format'
        if (!isValidEmail(value)) return 'Invalid email format'
        return true
      },
    },
  ],
}
