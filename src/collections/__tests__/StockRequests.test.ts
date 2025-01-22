import { StockRequests } from './StockRequests';
import { PayloadRequest, RequestContext } from 'payload/types';
import { CreateOrUpdateOperation, SanitizedCollectionConfig } from 'payload/types';
import { StockService } from '@/services/stockService';
import { EmailService } from '@/services/emailService';
import { isValidEmail, isValidSymbol, convertDate } from '@/utils/validators';
import { convertToCsv } from '@/utils/csvHelper';

// Mock all dependencies
jest.mock('@/services/stockService');
jest.mock('@/services/emailService');
jest.mock('@/utils/validators');
jest.mock('@/utils/csvHelper');

describe('StockRequests Collection', () => {
  const MockStockService = StockService as jest.MockedClass<typeof StockService>;
  const MockEmailService = EmailService as jest.MockedClass<typeof EmailService>;
  const mockIsValidEmail = isValidEmail as jest.MockedFunction<typeof isValidEmail>;
  const mockIsValidSymbol = isValidSymbol as jest.MockedFunction<typeof isValidSymbol>;
  const mockConvertDate = convertDate as jest.MockedFunction<typeof convertDate>;
  const mockConvertToCsv = convertToCsv as jest.MockedFunction<typeof convertToCsv>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockIsValidEmail.mockReturnValue(true);
    mockIsValidSymbol.mockResolvedValue(true);
    mockConvertDate.mockImplementation(date => date);
    mockConvertToCsv.mockReturnValue('csv,data');
    MockStockService.prototype.getHistoricalData.mockResolvedValue([]);
    MockEmailService.prototype.sendStockReport.mockResolvedValue({});
  });

  describe('Field Validations', () => {
    describe('companySymbol field', () => {
      const { validate } = StockRequests.fields.find(f => f.name === 'companySymbol')!;

      it('should validate valid company symbol', async () => {
        mockIsValidSymbol.mockResolvedValue(true);
        const result = await validate('AAPL');
        expect(result).toBe(true);
        expect(mockIsValidSymbol).toHaveBeenCalledWith('AAPL');
      });

      it('should reject invalid company symbol', async () => {
        mockIsValidSymbol.mockResolvedValue(false);
        const result = await validate('INVALID');
        expect(result).toBe('Invalid company symbol');
      });

      it('should reject null/undefined values', async () => {
        expect(await validate(null)).toBe('Invalid company symbol');
        expect(await validate(undefined)).toBe('Invalid company symbol');
      });
    });

    describe('startDate field', () => {
      const { validate } = StockRequests.fields.find(f => f.name === 'startDate')!;
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      it('should validate valid start date', async () => {
        const result = await validate(yesterday, { data: { endDate: today } });
        expect(result).toBe(true);
      });

      it('should reject future dates', async () => {
        const result = await validate(tomorrow, { data: {} });
        expect(result).toBe('Start Date cannot be in the future');
      });

      it('should reject start date after end date', async () => {
        const result = await validate(today, { data: { endDate: yesterday } });
        expect(result).toBe('Start Date must be before or equal to End Date');
      });

      it('should reject invalid date format', async () => {
        const result = await validate('invalid-date', { data: {} });
        expect(result).toBe('Invalid Start Date format. Expected format: YYYY-MM-DD');
      });
    });

    describe('endDate field', () => {
      const { validate } = StockRequests.fields.find(f => f.name === 'endDate')!;
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      it('should validate valid end date', async () => {
        const result = await validate(today, { data: { startDate: yesterday } });
        expect(result).toBe(true);
      });

      it('should reject future dates', async () => {
        const result = await validate(tomorrow, { data: {} });
        expect(result).toBe('End Date cannot be in the future');
      });

      it('should reject end date before start date', async () => {
        const result = await validate(yesterday, { data: { startDate: today } });
        expect(result).toBe('End Date must be after or equal to Start Date');
      });

      it('should reject invalid date format', async () => {
        const result = await validate('invalid-date', { data: {} });
        expect(result).toBe('Invalid End Date format. Expected format: YYYY-MM-DD');
      });
    });

    describe('email field', () => {
      const { validate } = StockRequests.fields.find(f => f.name === 'email')!;

      it('should validate valid email', () => {
        mockIsValidEmail.mockReturnValue(true);
        const result = validate('test@example.com');
        expect(result).toBe(true);
        expect(mockIsValidEmail).toHaveBeenCalledWith('test@example.com');
      });

      it('should reject invalid email', () => {
        mockIsValidEmail.mockReturnValue(false);
        const result = validate('invalid-email');
        expect(result).toBe('Invalid email format');
      });

      it('should reject null/undefined values', () => {
        expect(validate(null)).toBe('Invalid email format');
        expect(validate(undefined)).toBe('Invalid email format');
      });
    });
  });

  describe('afterChange Hook', () => {
    const afterChangeHook = StockRequests.hooks.afterChange![0];
    const mockDoc = {
      companySymbol: 'AAPL',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      email: 'test@example.com'
    };
    
    const mockHookArgs = {
      collection: {
        config: StockRequests,
        slug: 'stock-requests',
      },
      context: {},
      doc: mockDoc,
      previousDoc: null,
      req: {
        user: null,
        payloadAPI: 'local',
        payload: {
          config: {
            collections: [StockRequests]
          }
        }
      },

    it('should process stock request on create operation', async () => {
      const mockStockData = [{ date: '2024-01-01', close: 100 }];
      MockStockService.prototype.getHistoricalData.mockResolvedValue(mockStockData);
      mockConvertToCsv.mockReturnValue('date,close\n2024-01-01,100');

      await afterChangeHook({
        ...mockHookArgs,
        operation: 'create'
      });

      expect(MockStockService.prototype.getHistoricalData).toHaveBeenCalledWith(
        mockDoc.companySymbol,
        mockDoc.startDate,
        mockDoc.endDate
      );

      expect(mockConvertToCsv).toHaveBeenCalledWith(mockStockData);

      expect(MockEmailService.prototype.sendStockReport).toHaveBeenCalledWith(
        mockDoc.email,
        mockDoc.companySymbol,
        mockDoc.startDate,
        mockDoc.endDate,
        'date,close\n2024-01-01,100'
      );
    });

    it('should not process stock request on update operation', async () => {
      await afterChangeHook({
        ...mockHookArgs,
        operation: 'update'
      });

      expect(MockStockService.prototype.getHistoricalData).not.toHaveBeenCalled();
      expect(MockEmailService.prototype.sendStockReport).not.toHaveBeenCalled();
    });

    it('should handle errors in processing', async () => {
      const error = new Error('API Error');
      MockStockService.prototype.getHistoricalData.mockRejectedValue(error);

      await expect(afterChangeHook({
        ...mockHookArgs,
        operation: 'create'
      })).rejects.toThrow('API Error');
    });
  });
});