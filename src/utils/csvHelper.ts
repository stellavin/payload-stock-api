/**
 * Converts an array of data objects into a CSV string format.
 * 
 * @param data - An array of objects representing the data to be converted
 * @returns A string formatted as CSV, including headers and rows
 */
  export const convertToCsv = (data: any[]): string => {
    const headers = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume'];

    const rows = data.map(row =>
      headers.map(header => row[header.toLowerCase()]).join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  };
