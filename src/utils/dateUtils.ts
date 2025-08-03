export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
};

export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleString();
};

export const subtractDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

export const subtractMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() - months);
  return result;
};

export const getStartOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const getEndOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

export const getDateRangePresets = () => {
  const today = new Date();
  
  return {
    '7days': {
      start: formatDate(subtractDays(today, 7)),
      end: formatDate(today),
      label: 'Last 7 Days'
    },
    '30days': {
      start: formatDate(subtractDays(today, 30)),
      end: formatDate(today),
      label: 'Last 30 Days'
    },
    '90days': {
      start: formatDate(subtractDays(today, 90)),
      end: formatDate(today),
      label: 'Last 90 Days'
    },
    'thisMonth': {
      start: formatDate(getStartOfMonth(today)),
      end: formatDate(getEndOfMonth(today)),
      label: 'This Month'
    },
    'lastMonth': {
      start: formatDate(getStartOfMonth(subtractMonths(today, 1))),
      end: formatDate(getEndOfMonth(subtractMonths(today, 1))),
      label: 'Last Month'
    },
    'thisYear': {
      start: formatDate(new Date(today.getFullYear(), 0, 1)),
      end: formatDate(today),
      label: 'This Year'
    }
  };
};
