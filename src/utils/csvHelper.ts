export const convertToCsv = (data: any[]): string => {
    const headers = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume'];
    const rows = data.map(row => 
      headers.map(header => row[header.toLowerCase()]).join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
  };
  