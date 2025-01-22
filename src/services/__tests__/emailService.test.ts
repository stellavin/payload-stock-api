import transporter from '@/email/transport';
import { getCompanyName } from '@/utils/validators';
import { EmailService } from '../emailService';

// Mock the dependencies
jest.mock('@/email/transport');
jest.mock('@/utils/validators');
jest.mock('process', () => ({
  env: {
    SMTP_FROM: 'test@example.com',
    SMTP_USER: 'testuser',
    REFRESH_TOKEN: 'refresh123',
    ACCESS_TOKEN: 'access123'
  }
}));

describe('EmailService', () => {
  let emailService: EmailService;
  const mockTransporter = transporter as jest.Mocked<typeof transporter>;
  const mockGetCompanyName = getCompanyName as jest.MockedFunction<typeof getCompanyName>;

  const testParams = {
    email: 'recipient@example.com',
    companySymbol: 'AAPL',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    csvData: 'date,price\n2024-01-01,150\n2024-01-31,160',
  };

  beforeEach(() => {
    emailService = new EmailService();
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockGetCompanyName.mockResolvedValue('Apple Inc.');
    mockTransporter.sendMail.mockResolvedValue({
      messageId: 'test-message-id',
      accepted: [testParams.email],
      rejected: [],
      response: '250 Message received'
    });
  });

  describe('sendStockReport', () => {
    it('should send email with correct parameters', async () => {
      const result = await emailService.sendStockReport(
        testParams.email,
        testParams.companySymbol,
        testParams.startDate,
        testParams.endDate,
        testParams.csvData
      );

      // Verify getCompanyName was called with correct symbol
      expect(mockGetCompanyName).toHaveBeenCalledWith(testParams.companySymbol);

      // Verify sendMail was called with correct parameters
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: process.env.SMTP_FROM,
        to: testParams.email,
        subject: 'Apple Inc.',
        attachments: [
          {
            filename: 'AAPL_stock_data.csv',
            content: testParams.csvData,
          },
        ],
        html: expect.stringContaining('Apple Inc.'),
        auth: {
          user: process.env.SMTP_USER,
          refreshToken: process.env.REFRESH_TOKEN,
          accessToken: process.env.ACCESS_TOKEN,
          expires: 1484314697598999,
        },
      });

      // Verify the email HTML contains the required information
      const sendMailCall = mockTransporter.sendMail.mock.calls[0][0];
      expect(sendMailCall.html).toContain(testParams.startDate);
      expect(sendMailCall.html).toContain(testParams.endDate);
      expect(sendMailCall.html).toContain('Apple Inc.');

      // Verify the result is returned correctly
      expect(result).toEqual({
        messageId: 'test-message-id',
        accepted: [testParams.email],
        rejected: [],
        response: '250 Message received'
      });
    });

    it('should throw error when company name lookup fails', async () => {
      const error = new Error('Company not found');
      mockGetCompanyName.mockRejectedValue(error);

      await expect(emailService.sendStockReport(
        testParams.email,
        testParams.companySymbol,
        testParams.startDate,
        testParams.endDate,
        testParams.csvData
      )).rejects.toThrow('Company not found');

      expect(mockTransporter.sendMail).not.toHaveBeenCalled();
    });

    it('should throw error when email sending fails', async () => {
      const error = new Error('SMTP error');
      mockTransporter.sendMail.mockRejectedValue(error);

      await expect(emailService.sendStockReport(
        testParams.email,
        testParams.companySymbol,
        testParams.startDate,
        testParams.endDate,
        testParams.csvData
      )).rejects.toThrow('SMTP error');
    });

    it('should handle empty CSV data', async () => {
      await emailService.sendStockReport(
        testParams.email,
        testParams.companySymbol,
        testParams.startDate,
        testParams.endDate,
        ''
      );

      const sendMailCall = mockTransporter.sendMail.mock.calls[0][0];
      expect(sendMailCall.attachments[0].content).toBe('');
    });
  });
});