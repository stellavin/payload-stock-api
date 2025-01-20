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

export const isValidSymbol = async (symbol: string): Promise<boolean> => {
  try {
    const response = await axios.get(
      'https://pkgstore.datahub.io/core/nasdaq-listings/nasdaq-listed_json/data/a5bc7580d6176d60ac0b2142ca8d7df6/nasdaq-listed_json.json'
    );
    return response.data.some((listing: any) => listing.Symbol === symbol);
  } catch {
    return false;
  }
};