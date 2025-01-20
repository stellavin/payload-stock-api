import { CollectionConfig } from 'payload';
import { isValidEmail, isValidDate, isValidSymbol } from '@/utils/validators';

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
            if (!(value instanceof Date) || isNaN(value.getTime())) {
            return 'Invalid date format';
            }
            if (value > new Date()) {
            return 'Start date cannot be in the future';
            }
            if (data.endDate && value > data.endDate) {
            return 'Start date must be before end date';
            }
            return true;
        },
      },
      {
        name: 'endDate',
        type: 'date',
        required: true,
        validate: async (value: Date | null | undefined): Promise<string | true> => {
          if (!(value instanceof Date) || isNaN(value.getTime())) {
            return 'Invalid date format';
          }
          if (value > new Date()) {
            return 'End date cannot be in the future';
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
    // afterChange: [
    //   async ({ doc }) => {
    //     // Process the stock request
    //     try {
    //       const stockService = new StockService();
    //       const emailService = new EmailService();
          
    //       const stockData = await stockService.getHistoricalData(
    //         doc.companySymbol,
    //         doc.startDate,
    //         doc.endDate
    //       );
          
    //       const csvData = await csvHelper.convertToCsv(stockData);
    //       await emailService.sendStockReport(doc.email, doc.companySymbol, doc.startDate, doc.endDate, csvData);
          
    //       // Update status to completed
    //       await payload.update({
    //         collection: 'stock-requests',
    //         id: doc.id,
    //         data: { status: 'completed' },
    //       });
    //     } catch (error) {
    //       // Update status to failed
    //       await payload.update({
    //         collection: 'stock-requests',
    //         id: doc.id,
    //         data: { status: 'failed' },
    //       });
    //       throw error;
    //     }
    //   },
    // ],
  },
};