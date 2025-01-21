import { CollectionConfig, Payload } from 'payload';
import { isValidEmail, isValidDate, isValidSymbol, convertDate } from '@/utils/validators';
import { StockService } from '@/services/stockService';
import { convertToCsv } from '@/utils/csvHelper';
import { EmailService } from '@/services/emailService';

// Define the type for our stock request document
type StockRequest = {
  id: string;
  companySymbol: string;
  startDate: string;
  endDate: string;
  email: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
}

// Define the type for updatable fields
type UpdateableFields = Partial<Omit<StockRequest, 'id'>>;

export const StockRequests: CollectionConfig = {
  slug: 'stock-requests',
  admin: {
    useAsTitle: 'companySymbol',
  },
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {

        if(operation === 'create') {
            // Type assertion for the document
            const stockRequest = doc as StockRequest;
            try {
                const stockService = new StockService();
                const emailService = new EmailService();
                
                // Get stock data - convert dates to ISO strings
                const stockData = await stockService.getHistoricalData(
                    stockRequest.companySymbol,
                    convertDate(stockRequest.startDate),
                    convertDate(stockRequest.endDate)
                );
                
                // Convert to CSV and send email
                const csvData = convertToCsv(stockData);
                console.log('csvData', csvData);
                await emailService.sendStockReport(
                    stockRequest.email, 
                    stockRequest.companySymbol, 
                    convertDate(stockRequest.startDate),
                    convertDate(stockRequest.endDate), 
                    csvData
                );
           
            } catch (error) {
                // Update status to failed with error message
                throw error;
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
      validate: async (value: string | null | undefined): Promise<string | true> => {
        if (typeof value !== 'string' || !value) return 'Invalid company symbol';
        const isValid = await isValidSymbol(value);
        if (!isValid) return 'Invalid company symbol';
        return true;
      },
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      validate: async (
        value: string | Date | null | undefined,
        { data }: { data: { endDate?: string | Date | null | undefined } }
      ): Promise<string | true> => {
        if (!value) return 'Start Date is required';

        const startDate = typeof value === 'string' ? new Date(value) : value;
        
        if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
          return 'Invalid Start Date format. Expected format: YYYY-MM-DD';
        }

        const startDateOnly = new Date(startDate.toISOString().split('T')[0]);
        const today = new Date(new Date().toISOString().split('T')[0]);

        if (startDateOnly > today) {
          return 'Start Date cannot be in the future';
        }

        if (data.endDate) {
          const endDate = typeof data.endDate === 'string' 
            ? new Date(data.endDate) 
            : data.endDate;
          
          if (endDate instanceof Date && !isNaN(endDate.getTime())) {
            const endDateOnly = new Date(endDate.toISOString().split('T')[0]);
            if (startDateOnly > endDateOnly) {
              return 'Start Date must be before or equal to End Date';
            }
          }
        }

        return true;
      },
    },
    {
      name: 'endDate',
      type: 'date',
      required: true,
      validate: async (
        value: string | Date | null | undefined,
        { data }: { data: { startDate?: string | Date | null | undefined } }
      ): Promise<string | true> => {
        if (!value) return 'End Date is required';

        const endDate = typeof value === 'string' ? new Date(value) : value;
        
        if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
          return 'Invalid End Date format. Expected format: YYYY-MM-DD';
        }

        const endDateOnly = new Date(endDate.toISOString().split('T')[0]);
        const today = new Date(new Date().toISOString().split('T')[0]);

        if (endDateOnly > today) {
          return 'End Date cannot be in the future';
        }

        if (data.startDate) {
          const startDate = typeof data.startDate === 'string'
            ? new Date(data.startDate)
            : data.startDate;
          
          if (startDate instanceof Date && !isNaN(startDate.getTime())) {
            const startDateOnly = new Date(startDate.toISOString().split('T')[0]);
            if (endDateOnly < startDateOnly) {
              return 'End Date must be after or equal to Start Date';
            }
          }
        }

        return true;
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      validate: (value: string | null | undefined): string | true => {
        if (typeof value !== 'string' || !value) return 'Invalid email format';
        if (!isValidEmail(value)) return 'Invalid email format';
        return true;
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
      ],
      defaultValue: 'pending',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'errorMessage',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    }
  ],
  
};