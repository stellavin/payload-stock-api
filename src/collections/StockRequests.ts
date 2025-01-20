import { CollectionConfig } from 'payload';
import { isValidEmail, isValidDate, isValidSymbol } from '@/utils/validators';
import { StockService } from '@/services/stockService';
import { convertToCsv } from '@/utils/csvHelper';

export const StockRequests: CollectionConfig = {
  slug: 'stock-requests',
  admin: {
    useAsTitle: 'companySymbol',
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
          value: Date | null | undefined,
          { data }: { data: { endDate?: Date | null | undefined } }
        ): Promise<string | true> => {
          // Check if the value is null or undefined
          if (value === null || value === undefined) {
            return 'Start Date is required';
          }
      
          // If value is a string, validate it using the isValidDate utility function
        //   if (typeof value === 'string' && !isValidDate(value)) {
        //     return 'Invalid Start Date format. Expected format: YYYY-mm-dd';
        //   }
      
          // If value is a Date object, check if it's valid
          if (value instanceof Date && isNaN(value.getTime())) {
            return 'Invalid Start Date';
          }
      
          // Ensure Start Date is not in the future
          if (value instanceof Date && value > new Date()) {
            return 'Start Date cannot be in the future';
          }
      
          // Ensure Start Date is before or equal to End Date
          if (data.endDate && value instanceof Date && value > data.endDate) {
            return 'Start Date must be before or equal to End Date';
          }
      
          return true;
        },
        // defaultValue: () => new Date().toISOString().split('T')[0],
      },
      
      {
        name: 'endDate',
        type: 'date',
        required: true,
        validate: async (
          value: Date | null | undefined,
          { data }: { data: { startDate?: Date | null | undefined } }
        ): Promise<string | true> => {
          // Check if the value is null or undefined
          if (value === null || value === undefined) {
            return 'End Date is required';
          }
      
          // If value is a string, validate it using the isValidDate utility function
        //   if (typeof value === 'string' && !isValidDate(value)) {
        //     return 'Invalid End Date format. Expected format: YYYY-mm-dd';
        //   }
      
          // If value is a Date object, check if it's valid
          if (value instanceof Date && isNaN(value.getTime())) {
            return 'Invalid End Date';
          }
      
          // Ensure End Date is not in the future
          if (value instanceof Date && value > new Date()) {
            return 'End Date cannot be in the future';
          }
      
          // Ensure End Date is after or equal to Start Date
          if (data.startDate && value instanceof Date && value < data.startDate) {
            return 'End Date must be after or equal to Start Date';
          }
      
          return true;
        },
        // defaultValue: () => new Date().toISOString().split('T')[0],
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
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
      ],
      defaultValue: 'pending',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc }) => {
        // Process the stock request
        try {
          const stockService = new StockService();
        //   const emailService = new EmailService();
          
          const stockData = await stockService.getHistoricalData(
            doc.companySymbol,
            doc.startDate,
            doc.endDate
          );
          
          const csvData =  convertToCsv(stockData);
          console.log('data------', csvData);
        //   await emailService.sendStockReport(doc.email, doc.companySymbol, doc.startDate, doc.endDate, csvData);
          
          // Update status to completed
        //   await payload.update({
        //     collection: 'stock-requests',
        //     id: doc.id,
        //     data: { status: 'completed' },
        //   });
        } catch (error) {
          // Update status to failed
        //   await payload.update({
        //     collection: 'stock-requests',
        //     id: doc.id,
        //     data: { status: 'failed' },
        //   });
          throw error;
        }
      },
    ],
  },
};