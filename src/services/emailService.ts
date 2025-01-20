import nodemailer from 'nodemailer';
import axios from 'axios';


export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendStockReport(
    email: string,
    companySymbol: string,
    startDate: string,
    endDate: string,
    csvData: string
  ) {
    const companyName = await this.getCompanyName(companySymbol);
    
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: companyName,
      text: `Historical stock data from ${startDate} to ${endDate}`,
      attachments: [
        {
          filename: `${companySymbol}_stock_data.csv`,
          content: csvData,
        },
      ],
    });
    console.log('==============================SENT=================================')
  }

  private async getCompanyName(symbol: string): Promise<string> {
    // Fetch company name from NASDAQ listings
    const response = await axios.get(
      'https://pkgstore.datahub.io/core/nasdaq-listings/nasdaq-listed_json/data/a5bc7580d6176d60ac0b2142ca8d7df6/nasdaq-listed_json.json'
    );
    
    const company = response.data.find((listing: any) => listing.Symbol === symbol);
    return company ? company.Company : symbol;
  }
}