import axios from 'axios';

export class StockService {
  private readonly apiKey: string;
  private readonly apiHost: string;

  constructor() {
    const apiKey = process.env.RAPID_API_KEY;
    if (!apiKey) {
      throw new Error('RAPID_API_KEY is required but not defined.');
    }
    this.apiKey = apiKey;
    this.apiHost = 'yh-finance.p.rapidapi.com';
  }

  async getHistoricalData(symbol: string, startDate: string, endDate: string) {
    const response = await axios.get(
      `https://yh-finance.p.rapidapi.com/stock/v3/get-chart`,
      {
        params: {
          interval: '1d',
          symbol,
          range: this.calculateDateRange(startDate, endDate),
          region: 'US',
          includePrePost: false,
          useYfid: true,
          includeAdjustedClose: true,
        },
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.apiHost,
        },
      }
    );

    return this.transformStockData(response.data);
  }

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
    // Transform the Yahoo Finance data into our required format
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
}