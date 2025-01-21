// Importing the axios library for making HTTP requests
import axios from 'axios';

/**
 * Validates whether the provided email is in a valid format.
 * 
 * @param email - The email address to validate
 * @returns true if the email is valid, false otherwise
 */
  export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

/**
 * Validates whether the provided string is a valid date in the format 'YYYY-MM-DD'.
 * 
 * @param date - The date string to validate
 * @returns true if the date is valid, false otherwise
 */
  export const isValidDate = (date: string): boolean => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    
    const parsedDate = new Date(date);
    return parsedDate.toString() !== 'Invalid Date';
  };

/**
 * Converts a date string into 'YYYY-MM-DD' format.
 * 
 * @param date - The date string to convert
 * @returns The converted date in 'YYYY-MM-DD' format
 */
  export const convertDate = (date: string): string => {
    const parsedDate = new Date(date);
    return parsedDate.toISOString().split('T')[0]; // Returns yyyy-mm-dd
  };

/**
 * Checks if a given stock symbol is valid by verifying it against NASDAQ listings.
 * 
 * @param symbol - The stock symbol to validate
 * @returns true if the symbol is valid, false otherwise
 */
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
 * Fetches the company name for a given stock symbol from NASDAQ listings.
 * 
 * @param symbol - The stock symbol
 * @returns The company name if found, or the symbol if not found
 */
  export const getCompanyName = async (symbol: string): Promise<string> => {
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
      return symbol;
    }
  };
