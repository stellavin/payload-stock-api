import transporter from '@/email/transport';
import { getCompanyName } from '@/utils/validators';


export class EmailService {

  /**
   * Send a stock report email with CSV attachment.
   * 
   * @param email - Recipient email address
   * @param companySymbol - Stock symbol of the company
   * @param startDate - Start date of the report
   * @param endDate - End date of the report
   * @param csvData - CSV data to attach
   */
    async sendStockReport(
        email: string,
        companySymbol: string,
        startDate: string,
        endDate: string,
        csvData: string
    ) {
        const companyName = await getCompanyName(companySymbol);

        const result = await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: email,
            subject: companyName,
            attachments: [
                {
                filename: `${companySymbol}_stock_data.csv`,
                content: csvData,
                },
            ],
            html: `
                  <div>
                      <p>Attached is the stock data for <strong>${companyName}</strong> from <strong>${startDate}</strong> to <strong>${endDate}</strong>.</p>
                      <p>Please find the CSV file attached with all the relevant stock data.</p>
                  </div>
              `,
            auth: {
              user: process.env.SMTP_USER,
              refreshToken: process.env.REFRESH_TOKEN,
              accessToken: process.env.ACCESS_TOKEN,
              expires: 1484314697598999,
            },
          
          })

       return result;
    }
}
