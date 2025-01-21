import { convertDate } from '@/utils/validators';
import axios from 'axios';

export class StockService {

  private calculateDateRange(startDate: string, endDate: string): string {
    // Calculate the appropriate range parameter based on start and end dates
    const diffInDays = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays <= 30) return '1mo';
    if (diffInDays <= 90) return '3mo';
    if (diffInDays <= 180) return '6mo';
    if (diffInDays <= 365) return '1y';
    return '5y';
  }

  private transformStockData(rawData: any) {
    // Transform the Yahoo Finance data the required format
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