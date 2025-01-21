import axios from 'axios';

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidDate = (date: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  const parsedDate = new Date(date);
  return parsedDate.toString() !== 'Invalid Date';
};

export const convertDate = (date: string): string  => {
    const parsedDate = new Date(date);
    return parsedDate.toISOString().split('T')[0]; // Returns yyyy-mm-dd
};

export const isValidSymbol = async (symbol: string): Promise<boolean> => {
    try {
      const url = process.env.NASDAQ_API;
      
      if (!url) {
        throw new Error('NASDAQ API URL is not defined');
      }
      
      const response = await axios.get(url);
      return response.data.some((listing: any) => listing.Symbol === symbol);
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  /**
   * Fetch the company name for a given stock symbol from NASDAQ listings.
   * 
   * @param symbol - Stock symbol
   * @returns Company name or the symbol if not found
   */
  export const getCompanyName = async (symbol: string): Promise<boolean> => {
    try {
      const url = process.env.NASDAQ_API;
      
      if (!url) {
        throw new Error('NASDAQ API URL is not defined');
      }
      
      const response = await axios.get(url);
      const company = response.data.find((listing: any) => listing.Symbol === symbol);
      return company ? company['Company Name'] : symbol;
    } catch (error) {
      console.error(error);
      return false;
    }
  };