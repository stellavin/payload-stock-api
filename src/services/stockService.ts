import { convertDate } from '@/utils/validators';
import axios from 'axios';

export class StockService {

  /**
   * Calculates the date range parameter based on the difference between the start and end dates.
   * 
   * @param startDate - The start date in 'YYYY-MM-DD' format
   * @param endDate - The end date in 'YYYY-MM-DD' format
   * @returns A string representing the range (e.g., '1mo', '3mo', '6mo', '1y', '5y')
   */
  private calculateDateRange(startDate: string, endDate: string): string {
    const diffInDays = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays <= 30) return '1mo';
    if (diffInDays <= 90) return '3mo';
    if (diffInDays <= 180) return '6mo';
    if (diffInDays <= 365) return '1y';
    return '5y';
  }

  /**
   * Transforms raw stock data from Yahoo Finance into a structured format.
   * 
   * @param rawData - The raw data received from Yahoo Finance API
   * @returns An array of stock data objects with date, open, high, low, close, and volume properties
   */
  private transformStockData(rawData: any) {
    const timestamps = rawData.chart.result[0].timestamp;
    const quotes = rawData.chart.result[0].indicators.quote[0];

    return timestamps.map((timestamp: number, index: number) => ({
      date: new Date(timestamp * 1000).toISOString().split('T')[0],
      open: quotes.open[index],
      high: quotes.high[index],
      low: quotes.low[index],
      close: quotes.close[index],
      volume: quotes.volume[index],
    }));
  }

  /**
   * Fetches historical stock data for a given symbol within the specified date range.
   * 
   * @param symbol - The stock symbol to fetch data for
   * @param startDate - The start date in 'YYYY-MM-DD' format
   * @param endDate - The end date in 'YYYY-MM-DD' format
   * @returns A promise that resolves to an array of structured stock data objects
   * @throws An error if the API URL is not defined in the environment variables
   */
  async getHistoricalData(symbol: string, startDate: string, endDate: string) {
    let newStartDate = convertDate(startDate);
    let newEndDate = convertDate(endDate);
    let url = process.env.RAPID_API_URL;

    if (!url) {
      throw new Error('RAPID_API_URL environment variable is not defined');
    }

    const response = await axios.get(url,
      {
        params: {
          interval: '1d',
          symbol,
          range: this.calculateDateRange(newStartDate, newEndDate),
          region: 'US',
          includePrePost: false,
          useYfid: true,
          includeAdjustedClose: true,
        },
        headers: {
          'X-RapidAPI-Key': process.env.RAPID_API_KEY,
          'X-RapidAPI-Host': process.env.API_HOST,
        },
      }
    );

    return this.transformStockData(response.data);
  }
}
